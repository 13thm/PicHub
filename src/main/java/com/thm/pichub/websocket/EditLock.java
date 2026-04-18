package com.thm.pichub.websocket;

import lombok.Data;

/**
 * 编辑锁实体类
 */
@Data
public class EditLock {

    /**
     * 是否编辑中
     */
    private boolean editing;

    /**
     * 编辑者ID
     */
    private Long editorId;

    /**
     * 编辑者名称
     */
    private String editorName;

    /**
     * WebSocket 会话ID
     */
    private String sessionId;

    /**
     * 锁定时间
     */
    private Long lockTime;

    public EditLock() {
        this.editing = false;
    }

    public EditLock(Long editorId, String editorName, String sessionId) {
        this.editing = true;
        this.editorId = editorId;
        this.editorName = editorName;
        this.sessionId = sessionId;
        this.lockTime = System.currentTimeMillis();
    }

    public void lock(Long editorId, String editorName, String sessionId) {
        this.editing = true;
        this.editorId = editorId;
        this.editorName = editorName;
        this.sessionId = sessionId;
        this.lockTime = System.currentTimeMillis();
    }

    public void unlock() {
        this.editing = false;
        this.editorId = null;
        this.editorName = null;
        this.sessionId = null;
        this.lockTime = null;
    }
}
