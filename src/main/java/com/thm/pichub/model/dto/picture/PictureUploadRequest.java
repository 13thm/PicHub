package com.thm.pichub.model.dto.picture;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

/**
 * 图片上传请求
 */
@Data
public class PictureUploadRequest {

    /**
     * 图片文件
     */
    @NotNull(message = "图片文件不能为空")
    private MultipartFile file;

    /**
     * 图片名称
     */
    @NotBlank(message = "图片名称不能为空")
    private String name;

    /**
     * 简介
     */
    private String introduction;

    /**
     * 分类
     */
    private String category;

    /**
     * 标签（JSON数组字符串）
     */
    private String tags;
}