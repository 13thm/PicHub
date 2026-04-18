package com.thm.pichub.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.thm.pichub.model.entity.Space;
import com.thm.pichub.model.vo.MySpaceVO;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 空间数据库操作
 */
public interface SpaceMapper extends BaseMapper<Space> {

    /**
     * 查询用户的空间列表（包含用户权限）
     *
     * @param userId 用户ID
     * @return 我的空间列表
     */
    List<MySpaceVO> selectMySpacesByUserId(@Param("userId") Long userId);
}
