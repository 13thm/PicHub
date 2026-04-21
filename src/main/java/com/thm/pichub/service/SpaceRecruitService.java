package com.thm.pichub.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.thm.pichub.model.dto.space_recruit.SpaceRecruitAddRequest;
import com.thm.pichub.model.dto.space_recruit.SpaceRecruitQueryRequest;
import com.thm.pichub.model.dto.space_recruit.SpaceRecruitUpdateRequest;
import com.thm.pichub.model.entity.SpaceRecruit;
import com.thm.pichub.model.vo.SpaceRecruitVO;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * 空间招募服务
 *
 * @author thm
 * @date 2024
 */
public interface SpaceRecruitService extends IService<SpaceRecruit> {

    /**
     * 发布招募
     */
    Long addRecruit(SpaceRecruitAddRequest spaceRecruitAddRequest, HttpServletRequest request);

    /**
     * 删除招募
     */
    boolean deleteRecruit(Long id, HttpServletRequest request);

    /**
     * 更新招募
     */
    boolean updateRecruit(SpaceRecruitUpdateRequest spaceRecruitUpdateRequest, HttpServletRequest request);

    /**
     * 根据 id 获取招募
     */
    SpaceRecruit getRecruitById(long id);

    /**
     * 根据 id 获取招募VO
     */
    SpaceRecruitVO getRecruitVOById(long id);

    /**
     * 获取招募VO列表
     */
    List<SpaceRecruitVO> getRecruitVOList(List<SpaceRecruit> spaceRecruitList);

    /**
     * 分页查询条件
     */
    QueryWrapper<SpaceRecruit> getQueryWrapper(SpaceRecruitQueryRequest spaceRecruitQueryRequest);

    /**
     * 分页获取招募VO列表（广场可见）
     */
    Page<SpaceRecruitVO> listRecruitVOByPage(SpaceRecruitQueryRequest spaceRecruitQueryRequest);

    /**
     * 获取我发布的招募列表
     */
    List<SpaceRecruitVO> listMyRecruits(HttpServletRequest request);

    /**
     * 根据空间ID获取招募
     */
    SpaceRecruitVO getRecruitBySpaceId(Long spaceId);

    /**
     * 分页获取招募列表（管理员）
     */
    Page<SpaceRecruitVO> listRecruitByPage(SpaceRecruitQueryRequest spaceRecruitQueryRequest);
}
