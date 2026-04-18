package com.thm.pichub.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 频道管理器
 * 按图片ID管理用户会话和实时旋转角度
 */
@Slf4j
@Component
public class ChannelManager {

    /**
     * 每个图片的在线用户会话集合
     * Key: 图片ID, Value: 会话集合
     */
    private final Map<Long, Set<WebSocketSession>> channels = new ConcurrentHashMap<>();

    /**
     * 每个图片的当前旋转角度
     * Key: 图片ID, Value: 角度 (0, 90, 180, 270)
     */
    private final Map<Long, Integer> imageAngles = new ConcurrentHashMap<>();

    /**
     * 会话与用户ID的映射
     * Key: SessionId, Value: UserId
     */
    private final Map<String, Long> sessionUsers = new ConcurrentHashMap<>();

    /**
     * 会话与用户名的映射
     * Key: SessionId, Value: UserName
     */
    private final Map<String, String> sessionUserNames = new ConcurrentHashMap<>();

    /**
     * 会话与当前浏览图片ID的映射
     * Key: SessionId, Value: ImageId
     */
    private final Map<String, Long> sessionImages = new ConcurrentHashMap<>();

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 用户加入图片频道
     */
    public void joinChannel(Long imageId, WebSocketSession session, Long userId, String userName) {
        String sessionId = session.getId();
        log.info("用户 {}({}) 加入图片 {} 频道", userName, userId, imageId);

        // 记录会话信息
        sessionUsers.put(sessionId, userId);
        sessionUserNames.put(sessionId, userName);
        sessionImages.put(sessionId, imageId);

        // 如果该图片频道不存在，创建
        channels.computeIfAbsent(imageId, k -> ConcurrentHashMap.newKeySet());
        channels.get(imageId).add(session);

        // 初始化角度（如未初始化）
        imageAngles.putIfAbsent(imageId, 0);
    }

    /**
     * 用户离开频道
     */
    public void leaveChannel(WebSocketSession session) {
        String sessionId = session.getId();

        Long imageId = sessionImages.get(sessionId);
        if (imageId != null) {
            Set<WebSocketSession> channel = channels.get(imageId);
            if (channel != null) {
                channel.remove(session);
                log.info("会话 {} 离开图片 {} 频道，当前频道人数: {}",
                        sessionId, imageId, channel.size());

                // 如果频道为空，删除频道
                if (channel.isEmpty()) {
                    channels.remove(imageId);
                    imageAngles.remove(imageId);
                }
            }
        }

        // 清理会话信息
        sessionUsers.remove(sessionId);
        sessionUserNames.remove(sessionId);
        sessionImages.remove(sessionId);
    }

    /**
     * 按频道广播消息
     */
    public void broadcastToChannel(Long imageId, WsMessage message) {
        Set<WebSocketSession> channel = channels.get(imageId);
        if (channel == null) {
            return;
        }

        String jsonMessage;
        try {
            jsonMessage = objectMapper.writeValueAsString(message);
        } catch (Exception e) {
            log.error("消息序列化失败", e);
            return;
        }

        TextMessage textMessage = new TextMessage(jsonMessage);

        // 向频道内所有会话发送消息
        for (WebSocketSession session : channel) {
            if (session.isOpen()) {
                try {
                    session.sendMessage(textMessage);
                } catch (IOException e) {
                    log.error("发送消息失败: sessionId={}", session.getId(), e);
                }
            }
        }
    }

    /**
     * 更新图片旋转角度
     */
    public void updateAngle(Long imageId, Integer angle) {
        imageAngles.put(imageId, angle);
    }

    /**
     * 获取图片当前角度
     */
    public Integer getAngle(Long imageId) {
        return imageAngles.getOrDefault(imageId, 0);
    }

    /**
     * 重置图片角度
     */
    public void resetAngle(Long imageId) {
        imageAngles.put(imageId, 0);
    }

    /**
     * 获取用户当前浏览的图片ID
     */
    public Long getUserCurrentImageId(String sessionId) {
        return sessionImages.get(sessionId);
    }

    /**
     * 获取用户ID
     */
    public Long getUserId(String sessionId) {
        return sessionUsers.get(sessionId);
    }

    /**
     * 获取用户名
     */
    public String getUserName(String sessionId) {
        return sessionUserNames.get(sessionId);
    }

    /**
     * 获取频道在线用户数
     */
    public int getChannelOnlineCount(Long imageId) {
        Set<WebSocketSession> channel = channels.get(imageId);
        return channel != null ? channel.size() : 0;
    }
}
