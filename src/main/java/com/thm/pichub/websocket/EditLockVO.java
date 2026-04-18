package com.thm.pichub.websocket;

import lombok.Data;

/**
 * 编辑锁状态响应
 */
@Data
public class EditLockVO {

    /**
     * 图片ID
     */
    private Long imageId;

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
     * 当前旋转角度: 0, 90, 180, 270
     */
    private Integer angle;
}
