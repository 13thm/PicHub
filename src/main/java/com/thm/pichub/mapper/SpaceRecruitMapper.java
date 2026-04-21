package com.thm.pichub.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.thm.pichub.model.entity.SpaceRecruit;
import com.thm.pichub.model.vo.SpaceRecruitVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 空间招募 Mapper
 *
 * @author thm
 * @date 2024
 */
@Mapper
public interface SpaceRecruitMapper extends BaseMapper<SpaceRecruit> {

    /**
     * 根据空间ID获取招募信息
     *
     * @param spaceId 空间ID
     * @return 招募VO
     */
    SpaceRecruitVO selectBySpaceId(@Param("spaceId") Long spaceId);

    /**
     * 根据空间ID列表获取招募信息列表
     *
     * @param spaceIds 空间ID列表
     * @return 招募VO列表
     */
    List<SpaceRecruitVO> selectBySpaceIds(@Param("spaceIds") List<Long> spaceIds);

    /**
     * 查询用户的招募列表
     *
     * @param userId 用户ID
     * @return 招募VO列表
     */
    List<SpaceRecruitVO> selectByUserId(@Param("userId") Long userId);
}
