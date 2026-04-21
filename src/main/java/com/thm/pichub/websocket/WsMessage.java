package com.thm.pichub.websocket;

import java.io.Serializable;
import java.util.List;

/**
 * WebSocket 消息实体类
 */
public class WsMessage implements Serializable {

    private String type;
    private Long userId;
    private String userName;
    private Long imageId;
    private Integer angle;
    private String message;
    private Long timestamp;
    private List<UserInfo> userList;
    private String fileUrl;  // 文件URL，用于图片保存后广播新URL

    // 默认构造器用于反序列化
    public WsMessage() {}

    // Builder 构造器
    private WsMessage(Builder builder) {
        this.type = builder.type;
        this.userId = builder.userId;
        this.userName = builder.userName;
        this.imageId = builder.imageId;
        this.angle = builder.angle;
        this.message = builder.message;
        this.timestamp = builder.timestamp;
        this.userList = builder.userList;
        this.fileUrl = builder.fileUrl;
    }

    public static Builder builder() {
        return new Builder();
    }

    // Getters 和 Setters
    public String getType() { return type; }
    public WsMessage setType(String type) { this.type = type; return this; }

    public Long getUserId() { return userId; }
    public WsMessage setUserId(Long userId) { this.userId = userId; return this; }

    public String getUserName() { return userName; }
    public WsMessage setUserName(String userName) { this.userName = userName; return this; }

    public Long getImageId() { return imageId; }
    public WsMessage setImageId(Long imageId) { this.imageId = imageId; return this; }

    public Integer getAngle() { return angle; }
    public WsMessage setAngle(Integer angle) { this.angle = angle; return this; }

    public String getMessage() { return message; }
    public WsMessage setMessage(String message) { this.message = message; return this; }

    public Long getTimestamp() { return timestamp; }
    public WsMessage setTimestamp(Long timestamp) { this.timestamp = timestamp; return this; }

    public List<UserInfo> getUserList() { return userList; }
    public WsMessage setUserList(List<UserInfo> userList) { this.userList = userList; return this; }

    public String getFileUrl() { return fileUrl; }
    public WsMessage setFileUrl(String fileUrl) { this.fileUrl = fileUrl; return this; }

    // Builder 内部类
    public static class Builder {
        private String type;
        private Long userId;
        private String userName;
        private Long imageId;
        private Integer angle;
        private String message;
        private Long timestamp;
        private List<UserInfo> userList;
        private String fileUrl;

        public Builder type(String type) { this.type = type; return this; }
        public Builder userId(Long userId) { this.userId = userId; return this; }
        public Builder userName(String userName) { this.userName = userName; return this; }
        public Builder imageId(Long imageId) { this.imageId = imageId; return this; }
        public Builder angle(Integer angle) { this.angle = angle; return this; }
        public Builder message(String message) { this.message = message; return this; }
        public Builder timestamp(Long timestamp) { this.timestamp = timestamp; return this; }
        public Builder userList(List<UserInfo> userList) { this.userList = userList; return this; }
        public Builder fileUrl(String fileUrl) { this.fileUrl = fileUrl; return this; }

        public WsMessage build() {
            return new WsMessage(this);
        }
    }

    /**
     * 用户信息内部类
     */
    public static class UserInfo {
        private Long id;
        private String name;
        private Boolean isEditor;
        private Boolean isMe;

        public UserInfo() {}

        public UserInfo(Long id, String name, Boolean isEditor, Boolean isMe) {
            this.id = id;
            this.name = name;
            this.isEditor = isEditor;
            this.isMe = isMe;
        }

        public Long getId() { return id; }
        public UserInfo setId(Long id) { this.id = id; return this; }

        public String getName() { return name; }
        public UserInfo setName(String name) { this.name = name; return this; }

        public Boolean getIsEditor() { return isEditor; }
        public UserInfo setIsEditor(Boolean isEditor) { this.isEditor = isEditor; return this; }

        public Boolean getIsMe() { return isMe; }
        public UserInfo setIsMe(Boolean isMe) { this.isMe = isMe; return this; }
    }

    // 工厂方法
    public static WsMessage join(Long userId, String userName, Long imageId) {
        return builder()
                .type("JOIN")
                .userId(userId)
                .userName(userName)
                .imageId(imageId)
                .message("用户加入")
                .timestamp(System.currentTimeMillis())
                .build();
    }

    public static WsMessage leave(Long userId, String userName, Long imageId) {
        return builder()
                .type("LEAVE")
                .userId(userId)
                .userName(userName)
                .imageId(imageId)
                .message("用户离开")
                .timestamp(System.currentTimeMillis())
                .build();
    }

    public static WsMessage startEdit(Long userId, String userName, Long imageId) {
        return builder()
                .type("START_EDIT")
                .userId(userId)
                .userName(userName)
                .imageId(imageId)
                .message("用户开始编辑")
                .timestamp(System.currentTimeMillis())
                .build();
    }

    public static WsMessage rotate(Long userId, String userName, Long imageId, Integer angle) {
        return builder()
                .type("ROTATE")
                .userId(userId)
                .userName(userName)
                .imageId(imageId)
                .angle(angle)
                .message("图片旋转同步")
                .timestamp(System.currentTimeMillis())
                .build();
    }

    public static WsMessage save(Long userId, String userName, Long imageId) {
        return builder()
                .type("SAVE")
                .userId(userId)
                .userName(userName)
                .imageId(imageId)
                .message("图片保存成功")
                .timestamp(System.currentTimeMillis())
                .build();
    }

    public static WsMessage reject(Long imageId) {
        return builder()
                .type("REJECT")
                .imageId(imageId)
                .message("当前图片正在编辑中")
                .timestamp(System.currentTimeMillis())
                .build();
    }

    public static WsMessage autoUnlock(Long imageId) {
        return builder()
                .type("AUTO_UNLOCK")
                .imageId(imageId)
                .message("编辑者异常断开，编辑锁已释放")
                .timestamp(System.currentTimeMillis())
                .build();
    }

    public static WsMessage editExit(Long userId, String userName, Long imageId) {
        return builder()
                .type("EDIT_EXIT")
                .userId(userId)
                .userName(userName)
                .imageId(imageId)
                .message("编辑者退出编辑模式")
                .timestamp(System.currentTimeMillis())
                .build();
    }
}
