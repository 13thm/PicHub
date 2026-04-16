package com.thm.pichub.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.thm.pichub.model.entity.SpaceUser;
import com.thm.pichub.model.vo.SpaceUserVO;
import org.apache.ibatis.annotations.Param;

/**
 * 空间用户数据库操作
 */
public interface SpaceUserMapper extends BaseMapper<SpaceUser> {

    /**
     * 分页查询空间成员VO（关联用户信息）
     */
    IPage<SpaceUserVO> selectSpaceUserVOPage(Page<?> page, @Param("spaceId") Long spaceId,
                                               @Param("userId") Long userId,
                                               @Param("spaceRole") String spaceRole,
                                               @Param("sortField") String sortField,
                                               @Param("sortOrder") String sortOrder);

    /**
     * 根据ID查询空间成员VO（关联用户信息）
     */
    SpaceUserVO selectSpaceUserVOById(@Param("id") Long id);
}
