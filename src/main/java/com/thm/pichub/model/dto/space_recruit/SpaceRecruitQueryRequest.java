package com.thm.pichub.model.dto.space_recruit;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.thm.pichub.model.entity.SpaceRecruit;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;

/**
 * 查询招募请求
 *
 * @author thm
 * @date 2024
 */
@Data
@EqualsAndHashCode(callSuper = false)
public class SpaceRecruitQueryRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * id
     */
    private Long id;

    /**
     * 空间 id
     */
    private Long spaceId;

    /**
     * 发布人 id
     */
    private Long userId;

    /**
     * 招募标题
     */
    private String title;

    /**
     * 招募状态：0-招募中 1-已招满 2-已关闭
     */
    private Integer recruitStatus;

    /**
     * 搜索文本
     */
    private String searchText;

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
    public QueryWrapper<SpaceRecruit> getQueryWrapper() {
        QueryWrapper<SpaceRecruit> queryWrapper = new QueryWrapper<>();

        if (id != null) {
            queryWrapper.eq("id", id);
        }
        if (spaceId != null) {
            queryWrapper.eq("spaceId", spaceId);
        }
        if (userId != null) {
            queryWrapper.eq("userId", userId);
        }
        if (StrUtil.isNotBlank(title)) {
            queryWrapper.like("title", title);
        }
        if (recruitStatus != null) {
            queryWrapper.eq("recruitStatus", recruitStatus);
        }
        if (StrUtil.isNotBlank(searchText)) {
            queryWrapper.and(qw -> qw.like("title", searchText).or().like("content", searchText));
        }

        if (StrUtil.isNotBlank(sortField)) {
            queryWrapper.orderBy(StrUtil.isNotBlank(sortField), "ascend".equals(sortOrder), sortField);
        } else {
            queryWrapper.orderByDesc("createTime");
        }

        return queryWrapper;
    }
}
