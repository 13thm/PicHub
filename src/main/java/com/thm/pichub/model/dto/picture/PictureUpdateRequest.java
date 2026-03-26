package com.thm.pichub.model.dto.picture;

import lombok.Data;

import javax.validation.constraints.NotNull;

/**
 * 图片更新请求
 */
@Data
public class PictureUpdateRequest {

    /**
     * 图片ID
     */
    @NotNull(message = "图片ID不能为空")
    private Long id;

    /**
     * 图片名称
     */
    private String name;

    /**
     * 简介
     */
    private String introduction;

    /**
     * 分类
     */
    private String category;

    /**
     * 标签（JSON数组字符串）
     */
    private String tags;

    /**
     * 审核状态：0-待审核; 1-通过; 2-拒绝
     */
    private Integer reviewStatus;

    /**
     * 审核信息
     */
    private String reviewMessage;
}