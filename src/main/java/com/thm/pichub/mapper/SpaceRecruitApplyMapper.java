package com.thm.pichub.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.thm.pichub.model.entity.SpaceRecruitApply;
import com.thm.pichub.model.vo.SpaceRecruitApplyVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 招募申请 Mapper
 *
 * @author thm
 * @date 2024
 */
@Mapper
public interface SpaceRecruitApplyMapper extends BaseMapper<SpaceRecruitApply> {

    /**
     * 分页查询申请列表
     *
     * @param page       分页对象
     * @param recruitId  招募ID
     * @param spaceId    空间ID
     * @param userId     申请人ID
     * @param applyStatus 申请状态
     * @param sortField  排序字段
     * @param sortOrder  排序顺序
     * @return 申请VO分页
     */
    IPage<SpaceRecruitApplyVO> selectApplyVOPage(Page page,
                                                   @Param("recruitId") Long recruitId,
                                                   @Param("spaceId") Long spaceId,
                                                   @Param("userId") Long userId,
                                                   @Param("applyStatus") Integer applyStatus,
                                                   @Param("sortField") String sortField,
                                                   @Param("sortOrder") String sortOrder);

    /**
     * 根据ID查询申请详情
     *
     * @param id 申请ID
     * @return 申请VO
     */
    SpaceRecruitApplyVO selectApplyVOById(@Param("id") Long id);

    /**
     * 查询用户的申请列表
     *
     * @param userId 用户ID
     * @return 申请VO列表
     */
    List<SpaceRecruitApplyVO> selectByUserId(@Param("userId") Long userId);

    /**
     * 统计待审批数量
     *
     * @param spaceId 空间ID
     * @param recruitId 招募ID
     * @return 待审批数量
     */
    Long countPendingApply(@Param("spaceId") Long spaceId, @Param("recruitId") Long recruitId);
}
