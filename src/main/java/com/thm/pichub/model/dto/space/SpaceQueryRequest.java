package com.thm.pichub.model.dto.space;

import lombok.Data;

@Data
public class SpaceQueryRequest {
    private String searchText;
    private String spaceName;
    private Integer spaceLevel;
    private Integer spaceType;
    private Long userId;
    private long current;
    private long pageSize;
    private String sortField;
    private String sortOrder;
}
