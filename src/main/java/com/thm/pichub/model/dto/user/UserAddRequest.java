package com.thm.pichub.model.dto.user;

import lombok.Data;

@Data
public class UserAddRequest {
    private String userAccount;
    private String userName;
    private String userAvatar;
    private String userProfile;
    private String userRole;
}