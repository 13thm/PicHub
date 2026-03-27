package com.thm.pichub.model.dto.picture;

import lombok.Data;

@Data
public class PictureGetUrl {

    /**
     * 搜索词
     */
    private String searchText;

    /**
     * 抓取数量
     */
    private Integer count = 10;
}
