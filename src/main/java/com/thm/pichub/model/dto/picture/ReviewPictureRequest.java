package com.thm.pichub.model.dto.picture;

import lombok.Data;
import javax.validation.constraints.NotNull;
import java.io.Serializable;

@Data
public class ReviewPictureRequest implements Serializable {

    /**
     * 图片 id
     */
    @NotNull(message = "图片 id 不能为空")
    private Long id;

    /**
     * 审核状态 1-通过 2-拒绝
     */
    @NotNull(message = "审核状态不能为空")
    private Integer reviewStatus;

    /**
     * 审核信息
     */
    private String reviewMessage;
}