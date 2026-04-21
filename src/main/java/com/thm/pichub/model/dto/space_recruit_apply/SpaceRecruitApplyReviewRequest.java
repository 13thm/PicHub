package com.thm.pichub.model.dto.space_recruit_apply;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.NotNull;
import java.io.Serializable;

/**
 * 审批申请请求
 *
 * @author thm
 * @date 2024
 */
@Data
public class SpaceRecruitApplyReviewRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 申请 id
     */
    @ApiModelProperty(value = "申请 id", required = true)
    @NotNull(message = "申请 id 不能为空")
    private Long id;

    /**
     * 审核状态：0-待审核 1-已通过 2-已拒绝
     */
    @ApiModelProperty(value = "审核状态：1-已通过 2-已拒绝", required = true)
    @NotNull(message = "审核状态不能为空")
    private Integer applyStatus;

    /**
     * 审核意见
     */
    @ApiModelProperty(value = "审核意见")
    private String reviewMessage;
}
