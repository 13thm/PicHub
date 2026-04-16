package com.thm.pichub.model.dto.space_user;

import lombok.Data;

@Data
public class SpaceUserQueryRequest {
    private Long spaceId;
    private Long userId;
    private String spaceRole;
    private long current;
    private long pageSize;
    private String sortField;
    private String sortOrder;
}
