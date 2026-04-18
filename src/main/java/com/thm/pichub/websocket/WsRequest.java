package com.thm.pichub.websocket;

import lombok.Data;

import java.io.Serializable;

/**
 * WebSocket 请求数据传输对象
 */
@Data
public class WsRequest implements Serializable {

    /**
     * 指令类型
     * join: 加入图片频道
     * leave: 离开频道
     * edit: 请求编辑图片
     * rotate: 旋转图片
     * save: 保存并退出编辑
     */
    private String action;

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
     * 旋转方向: left(左旋90度), right(右旋90度)
     */
    private String direction;
}
