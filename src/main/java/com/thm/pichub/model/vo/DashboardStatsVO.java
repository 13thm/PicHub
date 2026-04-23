package com.thm.pichub.model.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * 管理面板统计数据
 */
@Data
public class DashboardStatsVO implements Serializable {

    /**
     * 用户总数
     */
    private Long userCount;

    /**
     * 图片总数
     */
    private Long pictureCount;

    /**
     * 空间使用（字节）
     */
    private Long spaceSize;

    /**
     * 待审核图片数
     */
    private Long pendingReview;

    private static final long serialVersionUID = 1L;
}
