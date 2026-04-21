package com.thm.pichub.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.thm.pichub.common.constant.UserConstant;
import com.thm.pichub.common.exception.BusinessException;
import com.thm.pichub.common.exception.ErrorCode;
import com.thm.pichub.common.utils.ThrowUtils;
import com.thm.pichub.model.entity.Space;
import com.thm.pichub.model.entity.SpaceRecruit;
import com.thm.pichub.model.entity.SpaceUser;
import com.thm.pichub.model.entity.User;
import com.thm.pichub.model.dto.space_recruit.SpaceRecruitAddRequest;
import com.thm.pichub.model.dto.space_recruit.SpaceRecruitQueryRequest;
import com.thm.pichub.model.dto.space_recruit.SpaceRecruitUpdateRequest;
import com.thm.pichub.model.vo.SpaceRecruitVO;
import com.thm.pichub.mapper.SpaceRecruitMapper;
import com.thm.pichub.service.SpaceRecruitService;
import com.thm.pichub.service.SpaceService;
import com.thm.pichub.service.SpaceUserService;
import com.thm.pichub.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 空间招募服务实现
 *
 * @author thm
 * @date 2024
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class SpaceRecruitServiceImpl extends ServiceImpl<SpaceRecruitMapper, SpaceRecruit> implements SpaceRecruitService {

    private final SpaceService spaceService;
    private final UserService userService;
    private final SpaceUserService spaceUserService;

    @Override
    public Long addRecruit(SpaceRecruitAddRequest spaceRecruitAddRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(spaceRecruitAddRequest == null, ErrorCode.PARAMS_ERROR);

        Long userId = getUserId(request);

        // 检查空间是否存在
        Space space = spaceService.getById(spaceRecruitAddRequest.getSpaceId());
        ThrowUtils.throwIfNull(space, ErrorCode.NOT_FOUND_ERROR, "空间不存在");

        // 检查用户是否为空间创建者
        if (!space.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR, "只有空间创建者可以发布招募");
        }

        // 检查该空间是否已有招募帖
        SpaceRecruitVO existingRecruit = getRecruitBySpaceId(space.getId());
        ThrowUtils.throwIf(existingRecruit != null, ErrorCode.OPERATION_ERROR, "该空间已发布招募帖");

        SpaceRecruit recruit = new SpaceRecruit();
        BeanUtil.copyProperties(spaceRecruitAddRequest, recruit);
        recruit.setUserId(userId);
        recruit.setRecruitStatus(0); // 默认招募中
        if (recruit.getMaxApplyCount() == null) {
            recruit.setMaxApplyCount(5); // 默认5人
        }

        boolean saved = this.save(recruit);
        ThrowUtils.throwIf(!saved, ErrorCode.OPERATION_ERROR);

        return recruit.getId();
    }

    @Override
    public boolean deleteRecruit(Long id, HttpServletRequest request) {
        ThrowUtils.throwIfNull(id, ErrorCode.PARAMS_ERROR);

        SpaceRecruit recruit = this.getById(id);
        ThrowUtils.throwIfNull(recruit, ErrorCode.NOT_FOUND_ERROR, "招募帖不存在");

        Long userId = getUserId(request);
        boolean isAdmin = isAdmin(request);

        // 只有发布者或管理员可以删除
        if (!recruit.getUserId().equals(userId) && !isAdmin) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR, "无权删除此招募帖");
        }

        return this.removeById(id);
    }

    @Override
    public boolean updateRecruit(SpaceRecruitUpdateRequest spaceRecruitUpdateRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(spaceRecruitUpdateRequest == null, ErrorCode.PARAMS_ERROR);
        Long id = spaceRecruitUpdateRequest.getId();
        ThrowUtils.throwIfNull(id, ErrorCode.PARAMS_ERROR);

        SpaceRecruit recruit = this.getById(id);
        ThrowUtils.throwIfNull(recruit, ErrorCode.NOT_FOUND_ERROR, "招募帖不存在");

        Long userId = getUserId(request);

        // 只有发布者可以更新
        if (!recruit.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR, "无权修改此招募帖");
        }

        SpaceRecruit updateRecruit = new SpaceRecruit();
        BeanUtil.copyProperties(spaceRecruitUpdateRequest, updateRecruit);

        return this.updateById(updateRecruit);
    }

    @Override
    public SpaceRecruit getRecruitById(long id) {
        return this.getById(id);
    }

    @Override
    public SpaceRecruitVO getRecruitVOById(long id) {
        SpaceRecruit recruit = this.getById(id);
        ThrowUtils.throwIfNull(recruit, ErrorCode.NOT_FOUND_ERROR);
        return getRecruitVO(recruit);
    }

    @Override
    public List<SpaceRecruitVO> getRecruitVOList(List<SpaceRecruit> spaceRecruitList) {
        if (spaceRecruitList == null || spaceRecruitList.isEmpty()) {
            return null;
        }
        return spaceRecruitList.stream().map(this::getRecruitVO).collect(Collectors.toList());
    }

    @Override
    public QueryWrapper<SpaceRecruit> getQueryWrapper(SpaceRecruitQueryRequest spaceRecruitQueryRequest) {
        QueryWrapper<SpaceRecruit> queryWrapper = new QueryWrapper<>();
        if (spaceRecruitQueryRequest == null) {
            return queryWrapper;
        }

        if (spaceRecruitQueryRequest.getId() != null) {
            queryWrapper.eq("id", spaceRecruitQueryRequest.getId());
        }
        if (spaceRecruitQueryRequest.getSpaceId() != null) {
            queryWrapper.eq("spaceId", spaceRecruitQueryRequest.getSpaceId());
        }
        if (spaceRecruitQueryRequest.getUserId() != null) {
            queryWrapper.eq("userId", spaceRecruitQueryRequest.getUserId());
        }
        if (StrUtil.isNotBlank(spaceRecruitQueryRequest.getTitle())) {
            queryWrapper.like("title", spaceRecruitQueryRequest.getTitle());
        }
        if (spaceRecruitQueryRequest.getRecruitStatus() != null) {
            queryWrapper.eq("recruitStatus", spaceRecruitQueryRequest.getRecruitStatus());
        }
        if (StrUtil.isNotBlank(spaceRecruitQueryRequest.getSearchText())) {
            queryWrapper.and(qw -> qw.like("title", spaceRecruitQueryRequest.getSearchText())
                    .or().like("content", spaceRecruitQueryRequest.getSearchText()));
        }

        if (StrUtil.isNotBlank(spaceRecruitQueryRequest.getSortField())) {
            queryWrapper.orderBy(StrUtil.isNotBlank(spaceRecruitQueryRequest.getSortField()),
                    "ascend".equals(spaceRecruitQueryRequest.getSortOrder()),
                    spaceRecruitQueryRequest.getSortField());
        } else {
            queryWrapper.orderByDesc("createTime");
        }

        return queryWrapper;
    }

    @Override
    public Page<SpaceRecruitVO> listRecruitVOByPage(SpaceRecruitQueryRequest spaceRecruitQueryRequest) {
        long current = spaceRecruitQueryRequest.getCurrent();
        long size = spaceRecruitQueryRequest.getPageSize();

        QueryWrapper<SpaceRecruit> queryWrapper = getQueryWrapper(spaceRecruitQueryRequest);
        // 广场只显示正在招募中的帖子
        queryWrapper.eq("recruitStatus", 0);

        Page<SpaceRecruit> recruitPage = this.page(new Page<>(current, size), queryWrapper);
        Page<SpaceRecruitVO> recruitVOPage = new Page<>(current, size, recruitPage.getTotal());
        recruitVOPage.setRecords(getRecruitVOList(recruitPage.getRecords()));

        return recruitVOPage;
    }

    @Override
    public List<SpaceRecruitVO> listMyRecruits(HttpServletRequest request) {
        Long userId = getUserId(request);
        return baseMapper.selectByUserId(userId);
    }

    @Override
    public SpaceRecruitVO getRecruitBySpaceId(Long spaceId) {
        ThrowUtils.throwIfNull(spaceId, ErrorCode.PARAMS_ERROR);
        return baseMapper.selectBySpaceId(spaceId);
    }

    @Override
    public Page<SpaceRecruitVO> listRecruitByPage(SpaceRecruitQueryRequest spaceRecruitQueryRequest) {
        long current = spaceRecruitQueryRequest.getCurrent();
        long size = spaceRecruitQueryRequest.getPageSize();

        QueryWrapper<SpaceRecruit> queryWrapper = getQueryWrapper(spaceRecruitQueryRequest);
        Page<SpaceRecruit> recruitPage = this.page(new Page<>(current, size), queryWrapper);
        Page<SpaceRecruitVO> recruitVOPage = new Page<>(current, size, recruitPage.getTotal());
        recruitVOPage.setRecords(getRecruitVOList(recruitPage.getRecords()));

        return recruitVOPage;
    }

    /**
     * 获取招募VO
     */
    private SpaceRecruitVO getRecruitVO(SpaceRecruit recruit) {
        SpaceRecruitVO vo = new SpaceRecruitVO();
        BeanUtil.copyProperties(recruit, vo);

        // 获取空间信息
        if (recruit.getSpaceId() != null) {
            Space space = spaceService.getById(recruit.getSpaceId());
            if (space != null) {
                vo.setSpaceName(space.getSpaceName());
                vo.setSpaceLevel(space.getSpaceLevel());
                vo.setSpaceType(space.getSpaceType());
            }
        }

        // 获取发布人信息
        if (recruit.getUserId() != null) {
            User publisher = userService.getById(recruit.getUserId());
            if (publisher != null) {
                vo.setPublisherName(publisher.getUserName());
                vo.setPublisherAccount(publisher.getUserAccount());
            }
        }

        return vo;
    }

    /**
     * 获取当前登录用户ID
     */
    private Long getUserId(HttpServletRequest request) {
        User loginUser = (User) request.getSession().getAttribute(UserConstant.USER_LOGIN_STATE);
        ThrowUtils.throwIfNull(loginUser, ErrorCode.NOT_LOGIN_ERROR);
        return loginUser.getId();
    }

    /**
     * 判断是否为管理员
     */
    private boolean isAdmin(HttpServletRequest request) {
        User loginUser = (User) request.getSession().getAttribute(UserConstant.USER_LOGIN_STATE);
        return loginUser != null && "admin".equals(loginUser.getUserRole());
    }
}
