package com.thm.pichub.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.thm.pichub.model.dto.space_recruit_apply.SpaceRecruitApplyAddRequest;
import com.thm.pichub.model.dto.space_recruit_apply.SpaceRecruitApplyQueryRequest;
import com.thm.pichub.model.dto.space_recruit_apply.SpaceRecruitApplyReviewRequest;
import com.thm.pichub.model.entity.SpaceRecruitApply;
import com.thm.pichub.model.vo.SpaceRecruitApplyVO;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * 招募申请服务
 *
 * @author thm
 * @date 2024
 */
public interface SpaceRecruitApplyService extends IService<SpaceRecruitApply> {

    /**
     * 申请加入空间
     */
    Long addApply(SpaceRecruitApplyAddRequest spaceRecruitApplyAddRequest, HttpServletRequest request);

    /**
     * 审批申请
     */
    boolean reviewApply(SpaceRecruitApplyReviewRequest spaceRecruitApplyReviewRequest, HttpServletRequest request);

    /**
     * 根据 id 获取申请
     */
    SpaceRecruitApply getApplyById(long id);

    /**
     * 根据 id 获取申请VO
     */
    SpaceRecruitApplyVO getApplyVOById(long id);

    /**
     * 分页查询条件
     */
    QueryWrapper<SpaceRecruitApply> getQueryWrapper(SpaceRecruitApplyQueryRequest spaceRecruitApplyQueryRequest);

    /**
     * 分页获取申请列表
     */
    IPage<SpaceRecruitApplyVO> listApplyVOByPage(SpaceRecruitApplyQueryRequest spaceRecruitApplyQueryRequest);

    /**
     * 获取我的申请列表
     */
    List<SpaceRecruitApplyVO> listMyApplies(HttpServletRequest request);

    /**
     * 获取待审批数量
     */
    Long getPendingCount(Long spaceId, Long recruitId);

    /**
     * 检查用户是否已申请该招募
     */
    boolean hasApplied(Long recruitId, Long userId);
}
