package com.thm.pichub.model.dto.space;

import lombok.Data;

@Data
public class SpaceAddRequest {
    private String spaceName;
    private Integer spaceLevel;
    private Integer spaceType;
    private Long maxSize;
    private Long maxCount;
}
