package com.thm.pichub.model.dto.picture;

import lombok.Data;

/**
 * 图片查询请求
 */
@Data
public class PictureQueryRequest {

    /**
     * 当前页
     */
    private long current = 1;

    /**
     * 页大小
     */
    private long pageSize = 10;

    /**
     * 图片名称
     */
    private String name;

    /**
     * 分类
     */
    private String category;

    /**
     * 标签
     */
    private String tags;

    /**
     * 查询字段
     */
    private String searchField;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 审核状态
     */
    private Integer reviewStatus;

    /**
     * 排序字段
     */
    private String sortField;

    /**
     * 排序顺序（ascend/descend）
     */
    private String sortOrder;
}