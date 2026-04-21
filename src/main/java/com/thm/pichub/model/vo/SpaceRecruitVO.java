package com.thm.pichub.model.vo;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 空间招募 VO
 *
 * @author thm
 * @date 2024
 */
@Data
public class SpaceRecruitVO implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "id")
    private Long id;

    @ApiModelProperty(value = "空间 id")
    private Long spaceId;

    @ApiModelProperty(value = "空间名称")
    private String spaceName;

    @ApiModelProperty(value = "空间级别：0-普通版 1-专业版 2-旗舰版")
    private Integer spaceLevel;

    @ApiModelProperty(value = "空间类型：0-私有 1-团队")
    private Integer spaceType;

    @ApiModelProperty(value = "发布人 id")
    private Long userId;

    @ApiModelProperty(value = "发布人名称")
    private String publisherName;

    @ApiModelProperty(value = "发布人账号")
    private String publisherAccount;

    @ApiModelProperty(value = "招募标题")
    private String title;

    @ApiModelProperty(value = "招募介绍/要求")
    private String content;

    @ApiModelProperty(value = "招募状态：0-招募中 1-已招满 2-已关闭")
    private Integer recruitStatus;

    @ApiModelProperty(value = "最多接受人数")
    private Integer maxApplyCount;

    @ApiModelProperty(value = "已经接受申请人数")
    private Integer applyCount;

    @ApiModelProperty(value = "当前待审批人数")
    private Long pendingCount;

    @ApiModelProperty(value = "总申请人数")
    private Long totalApplyCount;

    @ApiModelProperty(value = "创建时间")
    private Date createTime;

    @ApiModelProperty(value = "编辑时间")
    private Date editTime;
}
