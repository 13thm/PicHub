package com.thm.pichub.model.dto.space_recruit;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;

/**
 * 创建招募请求
 *
 * @author thm
 * @date 2024
 */
@Data
public class SpaceRecruitAddRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 空间 id
     */
    @ApiModelProperty(value = "空间 id", required = true)
    private Long spaceId;

    /**
     * 招募标题
     */
    @ApiModelProperty(value = "招募标题", required = true)
    private String title;

    /**
     * 招募介绍/要求
     */
    @ApiModelProperty(value = "招募介绍/要求")
    private String content;

    /**
     * 最多接受人数
     */
    @ApiModelProperty(value = "最多接受人数")
    private Integer maxApplyCount;
}
