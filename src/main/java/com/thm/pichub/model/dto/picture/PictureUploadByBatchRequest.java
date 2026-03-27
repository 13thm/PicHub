package com.thm.pichub.model.dto.picture;

import lombok.Data;

import java.util.List;

@Data
public class PictureUploadByBatchRequest {
    /**
     * 搜索关键字
     */
    private String search;

    /**  
     * 获取的url列表
     */  
    private List<String> urls;

}