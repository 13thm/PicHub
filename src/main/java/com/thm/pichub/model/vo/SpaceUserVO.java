package com.thm.pichub.model.vo;

import lombok.Data;

import java.util.Date;

@Data
public class SpaceUserVO {
    private Long id;
    private Long spaceId;
    private Long userId;
    private String spaceRole;
    private Date createTime;

    // 用户信息
    private String userAccount;
    private String userName;
}
