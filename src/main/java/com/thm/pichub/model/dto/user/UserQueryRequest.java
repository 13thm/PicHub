package com.thm.pichub.model.dto.user;

import lombok.Data;

@Data
public class UserQueryRequest {
    private String searchText;
    private long current;
    private long pageSize;
    private String sortField;
    private String sortOrder;
}