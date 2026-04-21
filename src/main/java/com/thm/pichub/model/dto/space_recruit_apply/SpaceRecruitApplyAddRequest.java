package com.thm.pichub.model.dto.space_recruit_apply;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;

/**
 * 申请加入空间请求
 *
 * @author thm
 * @date 2024
 */
@Data
public class SpaceRecruitApplyAddRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 招募帖子 id
     */
    @ApiModelProperty(value = "招募帖子 id", required = true)
    private Long recruitId;

    /**
     * 申请理由
     */
    @ApiModelProperty(value = "申请理由")
    private String applyReason;
}
