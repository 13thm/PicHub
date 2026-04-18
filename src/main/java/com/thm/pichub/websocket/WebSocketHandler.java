package com.thm.pichub.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;

import javax.annotation.Resource;
import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * WebSocket 处理器
 * 处理连接建立、断开、消息接收
 */
@Slf4j
public class WebSocketHandler implements org.springframework.web.socket.WebSocketHandler {

    private ChannelManager channelManager;

    private EditLockManager editLockManager;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public void setChannelManager(ChannelManager channelManager) {
        this.channelManager = channelManager;
    }

    public void setEditLockManager(EditLockManager editLockManager) {
        this.editLockManager = editLockManager;
    }

    /**
     * 存储所有活跃的会话 (sessionId -> WebSocketSession)
     */
    private final Set<WebSocketSession> activeSessions = ConcurrentHashMap.newKeySet();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        log.info("WebSocket 连接建立: sessionId={}", session.getId());
        activeSessions.add(session);
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        if (message instanceof TextMessage) {
            handleTextMessage(session, (TextMessage) message);
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.error("WebSocket 传输错误: sessionId={}", session.getId(), exception);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        log.info("WebSocket 连接关闭: sessionId={}, status={}", session.getId(), closeStatus);

        String sessionId = session.getId();

        // 从活跃会话中移除
        activeSessions.remove(session);

        // 1. 如果该会话是某个图片的编辑者，自动释放编辑锁
        editLockManager.autoUnlockOnDisconnect(sessionId);

        // 2. 处理的离开频道逻辑
        handleLeaveChannel(session);
    }

    @Override
    public boolean supportsPartialMessages() {
        return false;
    }

    /**
     * 处理文本消息
     */
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String sessionId = session.getId();
        String payload = message.getPayload();
        log.info("收到 WebSocket 消息: sessionId={}, message={}", sessionId, payload);

        try {
            WsRequest request = objectMapper.readValue(payload, WsRequest.class);
            String action = request.getAction();

            // 参数校验
            if (action == null) {
                log.warn("消息缺少 action 字段");
                return;
            }

            // 获取用户信息
            Long userId = request.getUserId();
            String userName = request.getUserName();

            if (userId == null || userName == null) {
                log.warn("消息缺少 userId 或 userName 字段");
                return;
            }

            switch (action) {
                case "join":
                    handleJoin(session, userId, userName, request.getImageId());
                    break;
                case "leave":
                    handleLeaveChannel(session);
                    break;
                case "edit":
                    handleEdit(userId, userName, sessionId, request.getImageId());
                    break;
                case "rotate":
                    handleRotate(userId, userName, sessionId, request.getImageId(), request.getDirection());
                    break;
                case "save":
                    handleSave(userId, userName, sessionId, request.getImageId());
                    break;
                default:
                    log.warn("未知的操作类型: {}", action);
            }

        } catch (Exception e) {
            log.error("处理消息失败", e);
        }
    }

    /**
     * 处理加入频道
     */
    private void handleJoin(WebSocketSession session, Long userId, String userName, Long imageId) {
        if (imageId == null) {
            log.warn("加入频道缺少 imageId 参数");
            return;
        }

        log.info("用户 {}({}) 请求加入图片 {} 频道", userName, userId, imageId);

        // 加入频道
        channelManager.joinChannel(imageId, session, userId, userName);

        // 广播用户加入消息
        WsMessage joinMessage = WsMessage.join(userId, userName, imageId);
        channelManager.broadcastToChannel(imageId, joinMessage);
    }

    /**
     * 处理离开频道
     */
    private void handleLeaveChannel(WebSocketSession session) {
        String sessionId = session.getId();
        Long currentImageId = channelManager.getUserCurrentImageId(sessionId);

        if (currentImageId != null) {
            Long userId = channelManager.getUserId(sessionId);
            String userName = channelManager.getUserName(sessionId);

            if (userId != null && userName != null) {
                // 广播用户离开消息
                WsMessage leaveMessage = WsMessage.leave(userId, userName, currentImageId);
                channelManager.broadcastToChannel(currentImageId, leaveMessage);
            }
        }

        // 从频道管理器中移除
        channelManager.leaveChannel(session);
    }

    /**
     * 处理请求编辑
     */
    private void handleEdit(Long userId, String userName, String sessionId, Long imageId) {
        if (imageId == null) {
            log.warn("请求编辑缺少 imageId 参数");
            return;
        }

        log.info("用户 {}({}) 请求编辑图片 {}", userName, userId, imageId);

        // 尝试获取编辑锁
        boolean locked = editLockManager.tryLock(imageId, userId, userName, sessionId);

        if (locked) {
            // 获取成功，广播开始编辑消息
            WsMessage startEditMessage = WsMessage.startEdit(userId, userName, imageId);
            channelManager.broadcastToChannel(imageId, startEditMessage);
        } else {
            // 获取失败，发送拒绝消息
            WsMessage rejectMessage = WsMessage.reject(imageId);
            channelManager.broadcastToChannel(imageId, rejectMessage);
        }
    }

    /**
     * 处理旋转操作
     */
    private void handleRotate(Long userId, String userName, String sessionId, Long imageId, String direction) {
        if (imageId == null) {
            log.warn("旋转操作缺少 imageId 参数");
            return;
        }

        // 权限验证：只有编辑者可以旋转
        if (!editLockManager.isEditor(imageId, sessionId)) {
            log.warn("非编辑者尝试旋转图片: imageId={}, userId={}", imageId, userId);
            return;
        }

        if (direction == null) {
            log.warn("旋转操作缺少 direction 参数");
            return;
        }

        log.info("用户 {}({}) 对图片 {} 执行旋转: {}", userName, userId, imageId, direction);

        // 计算新角度
        Integer currentAngle = channelManager.getAngle(imageId);
        Integer newAngle;

        switch (direction) {
            case "left":
                // 左旋 90 度
                newAngle = (currentAngle - 90 + 360) % 360;
                break;
            case "right":
                // 右旋 90 度
                newAngle = (currentAngle + 90) % 360;
                break;
            default:
                log.warn("不支持的旋转方向: {}", direction);
                return;
        }

        // 更新角度
        channelManager.updateAngle(imageId, newAngle);

        // 广播旋转消息
        WsMessage rotateMessage = WsMessage.rotate(imageId, newAngle);
        channelManager.broadcastToChannel(imageId, rotateMessage);
    }

    /**
     * 处理保存操作
     */
    private void handleSave(Long userId, String userName, String sessionId, Long imageId) {
        if (imageId == null) {
            log.warn("保存操作缺少 imageId 参数");
            return;
        }

        // 权限验证：只有编辑者可以保存
        if (!editLockManager.isEditor(imageId, sessionId)) {
            log.warn("非编辑者尝试保存图片: imageId={}, userId={}", imageId, userId);
            return;
        }

        log.info("用户 {}({}) 保存图片 {}", userName, userId, imageId);

        // 释放编辑锁
        editLockManager.unlock(imageId);

        // 重置角度到 0（因为图片已旋转保存）
        channelManager.resetAngle(imageId);

        // 广播保存成功消息
        WsMessage saveMessage = WsMessage.save(userId, userName, imageId);
        channelManager.broadcastToChannel(imageId, saveMessage);
    }
}
