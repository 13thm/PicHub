package com.thm.pichub.websocket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Date;

/**
 * WebSocket 消息实体类
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WsMessage implements Serializable {

    /**
     * 消息类型
     * JOIN: 用户加入频道
     * LEAVE: 用户离开频道
     * START_EDIT: 开始编辑
     * ROTATE: 旋转同步
     * SAVE: 保存成功
     * REJECT: 编辑被拒绝
     * AUTO_UNLOCK: 异常断开解锁
     */
    private String type;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 用户名
     */
    private String userName;

    /**
     * 图片ID
     */
    private Long imageId;

    /**
     * 旋转角度: 0, 90, 180, 270
     */
    private Integer angle;

    /**
     * 消息内容
     */
    private String message;

    /**
     * 时间戳
     */
    private Long timestamp;

    public static WsMessage join(Long userId, String userName, Long imageId) {
        return new WsMessage("JOIN", userId, userName, imageId, null, "用户加入", System.currentTimeMillis());
    }

    public static WsMessage leave(Long userId, String userName, Long imageId) {
        return new WsMessage("LEAVE", userId, userName, imageId, null, "用户离开", System.currentTimeMillis());
    }

    public static WsMessage startEdit(Long userId, String userName, Long imageId) {
        return new WsMessage("START_EDIT", userId, userName, imageId, null, "用户开始编辑", System.currentTimeMillis());
    }

    public static WsMessage rotate(Long imageId, Integer angle) {
        return new WsMessage("ROTATE", null, null, imageId, angle, "图片旋转同步", System.currentTimeMillis());
    }

    public static WsMessage save(Long userId, String userName, Long imageId) {
        return new WsMessage("SAVE", userId, userName, imageId, null, "图片保存成功", System.currentTimeMillis());
    }

    public static WsMessage reject(Long imageId) {
        return new WsMessage("REJECT", null, null, imageId, null, "当前图片正在编辑中", System.currentTimeMillis());
    }

    public static WsMessage autoUnlock(Long imageId) {
        return new WsMessage("AUTO_UNLOCK", null, null, imageId, null, "编辑者异常断开，编辑锁已释放", System.currentTimeMillis());
    }
}
