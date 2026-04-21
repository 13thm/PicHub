package com.thm.pichub.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 招募申请表（用户通过招募帖申请加入空间）
 *
 * @author thm
 * @date 2024
 */
@Data
@TableName("space_recruit_apply")
@ApiModel(description = "招募申请表")
public class SpaceRecruitApply implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * id
     */
    @ApiModelProperty(value = "id")
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 招募帖子 id
     */
    @ApiModelProperty(value = "招募帖子 id")
    private Long recruitId;

    /**
     * 空间 id
     */
    @ApiModelProperty(value = "空间 id")
    private Long spaceId;

    /**
     * 申请人 id
     */
    @ApiModelProperty(value = "申请人 id")
    private Long userId;

    /**
     * 申请理由
     */
    @ApiModelProperty(value = "申请理由")
    private String applyReason;

    /**
     * 申请状态：0-待审核 1-已通过 2-已拒绝
     */
    @ApiModelProperty(value = "申请状态：0-待审核 1-已通过 2-已拒绝")
    private Integer applyStatus;

    /**
     * 审核意见
     */
    @ApiModelProperty(value = "审核意见")
    private String reviewMessage;

    /**
     * 审核人 id
     */
    @ApiModelProperty(value = "审核人 id")
    private Long reviewerId;

    /**
     * 审核时间
     */
    @ApiModelProperty(value = "审核时间")
    private Date reviewTime;

    /**
     * 创建时间
     */
    @ApiModelProperty(value = "创建时间")
    @TableField(fill = FieldFill.INSERT)
    private Date createTime;

    /**
     * 编辑时间
     */
    @ApiModelProperty(value = "编辑时间")
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Date editTime;

    /**
     * 更新时间
     */
    @ApiModelProperty(value = "更新时间")
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Date updateTime;

    /**
     * 是否删除
     */
    @ApiModelProperty(value = "是否删除")
    @TableLogic
    private Integer isDelete;
}
