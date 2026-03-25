package com.thm.pichub.model.vo.user;

import lombok.Data;

import java.util.Date;

@Data
public class LoginUserVO {
    private Long id;
    private String userAccount;
    private String userName;
    private String userAvatar;
    private String userProfile;
    private String userRole;
    private Date createTime;
}