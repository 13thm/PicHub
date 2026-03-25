package com.thm.pichub.model.dto.user;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private Long id;
    private String userName;
    private String userAvatar;
    private String userProfile;
    private String userRole;
    private String userPassword;
}