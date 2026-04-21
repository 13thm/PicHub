package com.thm.pichub.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.thm.pichub.common.constant.UserConstant;
import com.thm.pichub.common.exception.ErrorCode;
import com.thm.pichub.common.utils.ThrowUtils;
import com.thm.pichub.mapper.SpaceRecruitApplyMapper;
import com.thm.pichub.model.dto.space_recruit_apply.SpaceRecruitApplyAddRequest;
import com.thm.pichub.model.dto.space_recruit_apply.SpaceRecruitApplyQueryRequest;
import com.thm.pichub.model.dto.space_recruit_apply.SpaceRecruitApplyReviewRequest;
import com.thm.pichub.model.entity.SpaceRecruit;
import com.thm.pichub.model.entity.SpaceRecruitApply;
import com.thm.pichub.model.entity.SpaceUser;
import com.thm.pichub.model.entity.User;
import com.thm.pichub.model.vo.SpaceRecruitApplyVO;
import com.thm.pichub.service.SpaceRecruitApplyService;
import com.thm.pichub.service.SpaceRecruitService;
import com.thm.pichub.service.SpaceUserService;
import com.thm.pichub.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import java.util.Date;
import java.util.List;

/**
 * 招募申请服务实现
 *
 * @author thm
 * @date 2024
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class SpaceRecruitApplyServiceImpl extends ServiceImpl<SpaceRecruitApplyMapper, SpaceRecruitApply> implements SpaceRecruitApplyService {

    private final SpaceRecruitService spaceRecruitService;
    private final UserService userService;
    private final SpaceUserService spaceUserService;

    @Override
    public Long addApply(SpaceRecruitApplyAddRequest spaceRecruitApplyAddRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(spaceRecruitApplyAddRequest == null, ErrorCode.PARAMS_ERROR);

        Long userId = getUserId(request);

        // 检查招募是否存在
        SpaceRecruit recruit = spaceRecruitService.getById(spaceRecruitApplyAddRequest.getRecruitId());
        ThrowUtils.throwIf(recruit == null, ErrorCode.NOT_FOUND_ERROR, "招募不存在");
        ThrowUtils.throwIf(recruit.getRecruitStatus() != 0, ErrorCode.OPERATION_ERROR, "该招募已关闭或已招满");

        // 检查是否已经申请过
        ThrowUtils.throwIf(hasApplied(recruit.getId(), userId), ErrorCode.OPERATION_ERROR, "您已申请过该招募");

        // 检查是否已是空间成员
        boolean isMember = spaceUserService.isMember(recruit.getSpaceId(), userId);
        ThrowUtils.throwIf(isMember, ErrorCode.OPERATION_ERROR, "您已是该空间成员");

        SpaceRecruitApply apply = new SpaceRecruitApply();
        BeanUtil.copyProperties(spaceRecruitApplyAddRequest, apply);
        apply.setSpaceId(recruit.getSpaceId());
        apply.setUserId(userId);
        apply.setApplyStatus(0); // 待审核

        boolean saved = this.save(apply);
        ThrowUtils.throwIf(!saved, ErrorCode.OPERATION_ERROR);

        return apply.getId();
    }

    @Override
    public boolean reviewApply(SpaceRecruitApplyReviewRequest reviewRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(reviewRequest == null, ErrorCode.PARAMS_ERROR);
        ThrowUtils.throwIf(reviewRequest.getId() == null, ErrorCode.PARAMS_ERROR);
        ThrowUtils.throwIf(reviewRequest.getApplyStatus() == null, ErrorCode.PARAMS_ERROR);
        ThrowUtils.throwIf(reviewRequest.getApplyStatus() == 0, ErrorCode.PARAMS_ERROR, "状态不能为待审核");

        SpaceRecruitApply apply = this.getById(reviewRequest.getId());
        ThrowUtils.throwIf(apply == null, ErrorCode.NOT_FOUND_ERROR, "申请不存在");
        ThrowUtils.throwIf(apply.getApplyStatus() != 0, ErrorCode.OPERATION_ERROR, "该申请已审核");

        // 获取招募信息
        SpaceRecruit recruit = spaceRecruitService.getById(apply.getRecruitId());
        ThrowUtils.throwIf(recruit == null, ErrorCode.NOT_FOUND_ERROR);

        // 检查权限：只有空间创建者可以审批
        Long userId = getUserId(request);
        ThrowUtils.throwIf(!recruit.getUserId().equals(userId), ErrorCode.NO_AUTH_ERROR, "无权审批该申请");

        // 执行审批
        boolean approved = reviewRequest.getApplyStatus() == 1;

        if (approved) {
            // 审批通过：添加用户到空间
            SpaceUser spaceUser = new SpaceUser();
            spaceUser.setSpaceId(apply.getSpaceId());
            spaceUser.setUserId(apply.getUserId());
            spaceUser.setSpaceRole("viewer"); // 默认为查看者

            boolean added = spaceUserService.save(spaceUser);
            ThrowUtils.throwIf(!added, ErrorCode.OPERATION_ERROR, "添加空间成员失败");

            // 更新招募的已接受人数
            SpaceRecruit updateRecruit = new SpaceRecruit();
            updateRecruit.setId(recruit.getId());
            int currentApplyCount = recruit.getApplyCount() != null ? recruit.getApplyCount() : 0;
            updateRecruit.setApplyCount(currentApplyCount + 1);

            // 检查是否达到上限，达到则更新状态为已招满
            int maxCount = recruit.getMaxApplyCount() != null ? recruit.getMaxApplyCount() : 0;
            if (maxCount > 0 && currentApplyCount + 1 >= maxCount) {
                updateRecruit.setRecruitStatus(1); // 已招满
                log.info("招募已满员，recruitId: {}", recruit.getId());
            }

            spaceRecruitService.updateById(updateRecruit);
        }

        // 更新申请状态
        SpaceRecruitApply updateApply = new SpaceRecruitApply();
        updateApply.setId(apply.getId());
        updateApply.setApplyStatus(reviewRequest.getApplyStatus());
        updateApply.setReviewMessage(reviewRequest.getReviewMessage());
        updateApply.setReviewerId(userId);
        updateApply.setReviewTime(new Date());

        return this.updateById(updateApply);
    }

    @Override
    public SpaceRecruitApply getApplyById(long id) {
        return this.getById(id);
    }

    @Override
    public SpaceRecruitApplyVO getApplyVOById(long id) {
        SpaceRecruitApplyVO vo = baseMapper.selectApplyVOById(id);
        ThrowUtils.throwIf(vo == null, ErrorCode.NOT_FOUND_ERROR);
        return vo;
    }

    @Override
    public QueryWrapper<SpaceRecruitApply> getQueryWrapper(SpaceRecruitApplyQueryRequest spaceRecruitApplyQueryRequest) {
        QueryWrapper<SpaceRecruitApply> queryWrapper = new QueryWrapper<>();
        if (spaceRecruitApplyQueryRequest == null) {
            return queryWrapper;
        }

        if (spaceRecruitApplyQueryRequest.getId() != null) {
            queryWrapper.eq("id", spaceRecruitApplyQueryRequest.getId());
        }
        if (spaceRecruitApplyQueryRequest.getRecruitId() != null) {
            queryWrapper.eq("recruitId", spaceRecruitApplyQueryRequest.getRecruitId());
        }
        if (spaceRecruitApplyQueryRequest.getSpaceId() != null) {
            queryWrapper.eq("spaceId", spaceRecruitApplyQueryRequest.getSpaceId());
        }
        if (spaceRecruitApplyQueryRequest.getUserId() != null) {
            queryWrapper.eq("userId", spaceRecruitApplyQueryRequest.getUserId());
        }
        if (spaceRecruitApplyQueryRequest.getApplyStatus() != null) {
            queryWrapper.eq("applyStatus", spaceRecruitApplyQueryRequest.getApplyStatus());
        }

        if (spaceRecruitApplyQueryRequest.getSortField() != null && !spaceRecruitApplyQueryRequest.getSortField().isEmpty()) {
            queryWrapper.orderBy(StrUtil.isNotBlank(spaceRecruitApplyQueryRequest.getSortField()),
                    "ascend".equals(spaceRecruitApplyQueryRequest.getSortOrder()),
                    spaceRecruitApplyQueryRequest.getSortField());
        } else {
            queryWrapper.orderByDesc("createTime");
        }

        return queryWrapper;
    }

    @Override
    public IPage<SpaceRecruitApplyVO> listApplyVOByPage(SpaceRecruitApplyQueryRequest spaceRecruitApplyQueryRequest) {
        long current = spaceRecruitApplyQueryRequest.getCurrent();
        long size = spaceRecruitApplyQueryRequest.getPageSize();

        IPage<SpaceRecruitApplyVO> voPage = baseMapper.selectApplyVOPage(
                new Page<>(current, size),
                spaceRecruitApplyQueryRequest.getRecruitId(),
                spaceRecruitApplyQueryRequest.getSpaceId(),
                spaceRecruitApplyQueryRequest.getUserId(),
                spaceRecruitApplyQueryRequest.getApplyStatus(),
                spaceRecruitApplyQueryRequest.getSortField(),
                spaceRecruitApplyQueryRequest.getSortOrder()
        );

        return voPage;
    }

    @Override
    public List<SpaceRecruitApplyVO> listMyApplies(HttpServletRequest request) {
        Long userId = getUserId(request);
        return baseMapper.selectByUserId(userId);
    }

    @Override
    public Long getPendingCount(Long spaceId, Long recruitId) {
        return baseMapper.countPendingApply(spaceId, recruitId);
    }

    @Override
    public boolean hasApplied(Long recruitId, Long userId) {
        QueryWrapper<SpaceRecruitApply> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("recruitId", recruitId);
        queryWrapper.eq("userId", userId);
        return this.count(queryWrapper) > 0;
    }

    /**
     * 获取当前登录用户ID
     */
    private Long getUserId(HttpServletRequest request) {
        User loginUser = (User) request.getSession().getAttribute(UserConstant.USER_LOGIN_STATE);
        ThrowUtils.throwIf(loginUser == null, ErrorCode.NOT_LOGIN_ERROR);
        return loginUser.getId();
    }
}
