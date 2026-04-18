package com.thm.pichub.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.thm.pichub.model.dto.space_user.*;
import com.thm.pichub.model.entity.SpaceUser;
import com.thm.pichub.model.vo.SpaceUserVO;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * 空间用户服务
 */
public interface SpaceUserService extends IService<SpaceUser> {

    /**
     * 添加空间成员
     */
    long addSpaceUser(SpaceUserAddRequest spaceUserAddRequest, HttpServletRequest request);

    /**
     * 删除空间成员
     */
    boolean deleteSpaceUser(Long id, HttpServletRequest request);

    /**
     * 更新空间成员
     */
    boolean updateSpaceUser(SpaceUserUpdateRequest spaceUserUpdateRequest, HttpServletRequest request);

    /**
     * 根据 id 获取空间成员
     */
    SpaceUser getSpaceUserById(long id);

    /**
     * 根据 id 获取空间成员VO
     */
    SpaceUserVO getSpaceUserVOById(long id);

    /**
     * 获取空间成员VO列表
     */
    List<SpaceUserVO> getSpaceUserVOList(List<SpaceUser> spaceUserList);

    /**
     * 分页查询条件
     */
    QueryWrapper<SpaceUser> getQueryWrapper(SpaceUserQueryRequest spaceUserQueryRequest);

    /**
     * 分页获取空间成员VO列表
     */
    Page<SpaceUserVO> listSpaceUserVOByPage(SpaceUserQueryRequest spaceUserQueryRequest);

    /**
     * 判断用户是否有上传\删除的权限
     */
    boolean isSpacePermission(Long spaceId, Long userId);

    /**
     * 获取权限
     */
    String SpacePermission(Long spaceId, Long userId);

}
