package com.thm.pichub.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.thm.pichub.model.dto.space.*;
import com.thm.pichub.model.entity.Space;
import com.thm.pichub.model.vo.MySpaceVO;
import com.thm.pichub.model.vo.SpaceVO;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * 空间服务
 */
public interface SpaceService extends IService<Space> {

    /**
     * 新增空间
     */
    long addSpace(SpaceAddRequest spaceAddRequest, HttpServletRequest request);

    /**
     * 删除空间
     */
    boolean deleteSpace(Long id, HttpServletRequest request);

    /**
     * 更新空间
     */
    boolean updateSpace(SpaceUpdateRequest spaceUpdateRequest, HttpServletRequest request);

    /**
     * 根据 id 获取空间
     */
    Space getSpaceById(long id);

    /**
     * 根据 id 获取空间VO
     */
    SpaceVO getSpaceVOById(long id);

    /**
     * 获取空间VO列表
     */
    List<SpaceVO> getSpaceVOList(List<Space> spaceList);

    /**
     * 分页查询条件
     */
    QueryWrapper<Space> getQueryWrapper(SpaceQueryRequest spaceQueryRequest);

    /**
     * 分页获取空间VO列表
     */
    Page<SpaceVO> listSpaceVOByPage(SpaceQueryRequest spaceQueryRequest, HttpServletRequest request);

    /**
     * 获取用户加入的空间列表（包含权限信息）
     */
    List<MySpaceVO> listMySpaces(HttpServletRequest request);
}
