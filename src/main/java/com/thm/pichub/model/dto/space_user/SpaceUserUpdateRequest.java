package com.thm.pichub.model.dto.space_user;

import lombok.Data;

@Data
public class SpaceUserUpdateRequest {
    private Long id;
    private Long spaceId;
    private Long userId;
    private String spaceRole;
}
