package com.thm.pichub.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 空间招募表（广场展示的空间招人信息）
 *
 * @author thm
 * @date 2024
 */
@Data
@TableName("space_recruit")
@ApiModel(description = "空间招募表")
public class SpaceRecruit implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * id
     */
    @ApiModelProperty(value = "id")
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 空间 id
     */
    @ApiModelProperty(value = "空间 id")
    private Long spaceId;

    /**
     * 发布人 id（空间管理员）
     */
    @ApiModelProperty(value = "发布人 id（空间管理员）")
    private Long userId;

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

    /**
     * 已经接受申请人数
     */
    @ApiModelProperty(value = "已经接受申请人数")
    private Integer applyCount;

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
