-- 创建库
create database if not exists picHub_db;

-- 切换库
use picHub_db;

-- 用户表
create table if not exists user
(
    id           bigint auto_increment comment 'id' primary key,
    userAccount  varchar(256)                           not null comment '账号',
    userPassword varchar(512)                           not null comment '密码',
    userName     varchar(256)                           null comment '用户昵称',
    userAvatar   varchar(1024)                          null comment '用户头像',
    userProfile  varchar(512)                           null comment '用户简介',
    userRole     varchar(256) default 'user'            not null comment '用户角色：user/admin',
    editTime     datetime     default CURRENT_TIMESTAMP not null comment '编辑时间',
    createTime   datetime     default CURRENT_TIMESTAMP not null comment '创建时间',
    updateTime   datetime     default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    isDelete     tinyint      default 0                 not null comment '是否删除',
    UNIQUE KEY uk_userAccount (userAccount),
    INDEX idx_userName (userName)
    ) comment '用户' collate = utf8mb4_unicode_ci;



-- 图片表 (包含审核状态和缩略图字段的完整版本)
CREATE TABLE IF NOT EXISTS picture (
    -- 基础信息
                                       id           BIGINT AUTO_INCREMENT COMMENT 'id' PRIMARY KEY,
                                       url          VARCHAR(512)                       NOT NULL COMMENT '图片 url',
                                       thumbnailUrl VARCHAR(512)                       NULL COMMENT '缩略图 url',
                                       name         VARCHAR(128)                       NOT NULL COMMENT '图片名称',
                                       introduction VARCHAR(512)                       NULL COMMENT '简介',
                                       category     VARCHAR(64)                        NULL COMMENT '分类',
                                       tags         VARCHAR(512)                       NULL COMMENT '标签（JSON 数组）',

    -- 图片属性
                                       picSize      BIGINT                             NULL COMMENT '图片体积',
                                       picWidth     INT                                NULL COMMENT '图片宽度',
                                       picHeight    INT                                NULL COMMENT '图片高度',
                                       picScale     DOUBLE                             NULL COMMENT '图片宽高比例',
                                       picFormat    VARCHAR(32)                        NULL COMMENT '图片格式',

    -- 审核相关
                                       reviewStatus INT          DEFAULT 0             NOT NULL COMMENT '审核状态：0-待审核; 1-通过; 2-拒绝',
                                       reviewMessage VARCHAR(512)                      NULL COMMENT '审核信息',
                                       reviewerId   BIGINT                             NULL COMMENT '审核人 ID',
                                       reviewTime   DATETIME                           NULL COMMENT '审核时间',

    -- 用户与时间
                                       userId       BIGINT                             NOT NULL COMMENT '创建用户 id',
                                       createTime   DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '创建时间',
                                       editTime     DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT '编辑时间',
                                       updateTime   DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                                       isDelete     TINYINT  DEFAULT 0                 NOT NULL COMMENT '是否删除',

    -- 索引定义
                                       INDEX idx_name (name),
                                       INDEX idx_introduction (introduction),
                                       INDEX idx_category (category),
                                       INDEX idx_tags (tags),
                                       INDEX idx_userId (userId),
                                       INDEX idx_reviewStatus (reviewStatus)
) COMMENT '图片' COLLATE = utf8mb4_unicode_ci;