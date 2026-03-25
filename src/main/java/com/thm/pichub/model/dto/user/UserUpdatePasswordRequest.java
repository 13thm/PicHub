package com.thm.pichub.model.dto.user;

import lombok.Data;

import java.io.Serializable;

/**
 * 用户修改密码请求
 */
@Data
public class UserUpdatePasswordRequest implements Serializable {

    /**
     * 旧密码
     */
    private String oldPassword;

    /**
     * 新密码
     */
    private String newPassword;

    /**
     * 确认新密码
     */
    private String confirmPassword;

    private static final long serialVersionUID = 1L;
}