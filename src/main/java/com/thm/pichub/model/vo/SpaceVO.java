package com.thm.pichub.model.vo;

import lombok.Data;

import java.util.Date;

@Data
public class SpaceVO {
    private Long id;
    private String spaceName;
    private Integer spaceLevel;
    private Integer spaceType;
    private Long maxSize;
    private Long maxCount;
    private Long totalSize;
    private Long totalCount;
    private Long userId;
    private Date editTime;
    private Date createTime;
}
