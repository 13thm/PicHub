package com.thm.pichub.model.dto.space_recruit_apply;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.thm.pichub.model.entity.SpaceRecruitApply;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;

/**
 * 查询招募申请请求
 *
 * @author thm
 * @date 2024
 */
@Data
@EqualsAndHashCode(callSuper = false)
public class SpaceRecruitApplyQueryRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * id
     */
    private Long id;

    /**
     * 招募帖子 id
     */
    private Long recruitId;

    /**
     * 空间 id
     */
    private Long spaceId;

    /**
     * 申请人 id
     */
    private Long userId;

    /**
     * 申请状态：0-待审核 1-已通过 2-已拒绝
     */
    private Integer applyStatus;

    /**
     * 当前页码
     */
    private long current = 1;

    /**
     * 每页大小
     */
    private long pageSize = 10;

    /**
     * 排序字段
     */
    private String sortField;

    /**
     * 排序顺序：ascend/descend
     */
    private String sortOrder;

    /**
     * 获取查询条件
     *
     * @return 查询条件
     */
    public QueryWrapper<SpaceRecruitApply> getQueryWrapper() {
        QueryWrapper<SpaceRecruitApply> queryWrapper = new QueryWrapper<>();

        if (id != null) {
            queryWrapper.eq("id", id);
        }
        if (recruitId != null) {
            queryWrapper.eq("recruitId", recruitId);
        }
        if (spaceId != null) {
            queryWrapper.eq("spaceId", spaceId);
        }
        if (userId != null) {
            queryWrapper.eq("userId", userId);
        }
        if (applyStatus != null) {
            queryWrapper.eq("applyStatus", applyStatus);
        }

        if (StrUtil.isNotBlank(sortField)) {
            queryWrapper.orderBy(StrUtil.isNotBlank(sortField), "ascend".equals(sortOrder), sortField);
        } else {
            queryWrapper.orderByDesc("createTime");
        }

        return queryWrapper;
    }
}
