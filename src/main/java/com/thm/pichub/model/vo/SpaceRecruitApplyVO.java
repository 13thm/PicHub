package com.thm.pichub.model.vo;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 招募申请 VO
 *
 * @author thm
 * @date 2024
 */
@Data
public class SpaceRecruitApplyVO implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "id")
    private Long id;

    @ApiModelProperty(value = "招募帖子 id")
    private Long recruitId;

    @ApiModelProperty(value = "空间 id")
    private Long spaceId;

    @ApiModelProperty(value = "空间名称")
    private String spaceName;

    @ApiModelProperty(value = "招募标题")
    private String recruitTitle;

    @ApiModelProperty(value = "申请人 id")
    private Long userId;

    @ApiModelProperty(value = "申请人账号")
    private String userAccount;

    @ApiModelProperty(value = "申请人名称")
    private String applicantName;

    @ApiModelProperty(value = "申请人头像")
    private String userAvatar;

    @ApiModelProperty(value = "申请理由")
    private String applyReason;

    @ApiModelProperty(value = "申请状态：0-待审核 1-已通过 2-已拒绝")
    private Integer applyStatus;

    @ApiModelProperty(value = "审核意见")
    private String reviewMessage;

    @ApiModelProperty(value = "审核人 id")
    private Long reviewerId;

    @ApiModelProperty(value = "审核人名称")
    private String reviewerName;

    @ApiModelProperty(value = "审核时间")
    private Date reviewTime;

    @ApiModelProperty(value = "创建时间")
    private Date createTime;
}
