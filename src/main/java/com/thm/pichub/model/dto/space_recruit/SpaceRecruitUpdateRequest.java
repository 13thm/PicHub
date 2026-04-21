package com.thm.pichub.model.dto.space_recruit;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;

/**
 * 更新招募请求
 *
 * @author thm
 * @date 2024
 */
@Data
public class SpaceRecruitUpdateRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * id
     */
    @ApiModelProperty(value = "id", required = true)
    private Long id;

    /**
     * 招募标题
     */
    @ApiModelProperty(value = "招募标题")
    private String title;

    /**
     * 招募介绍/要求
     */
    @ApiModelProperty(value = "招募介绍/要求")
    private String content;

    /**
     * 招募状态：0-招募中 1-已招满 2-已关闭
     */
    @ApiModelProperty(value = "招募状态：0-招募中 1-已招满 2-已关闭")
    private Integer recruitStatus;

    /**
     * 最多接受人数
     */
    @ApiModelProperty(value = "最多接受人数")
    private Integer maxApplyCount;
}
