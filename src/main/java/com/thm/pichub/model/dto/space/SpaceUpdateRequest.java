package com.thm.pichub.model.dto.space;

import lombok.Data;

@Data
public class SpaceUpdateRequest {
    private Long id;
    private String spaceName;
    private Integer spaceLevel;
    private Integer spaceType;
    private Long maxSize;
    private Long maxCount;
}
