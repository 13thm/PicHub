package com.thm.pichub.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.thm.pichub.common.BaseResponse;
import com.thm.pichub.common.ResultUtils;
import com.thm.pichub.common.exception.BusinessException;
import com.thm.pichub.common.exception.ErrorCode;
import com.thm.pichub.common.utils.ThrowUtils;
import com.thm.pichub.model.dto.space_recruit_apply.SpaceRecruitApplyAddRequest;
import com.thm.pichub.model.dto.space_recruit_apply.SpaceRecruitApplyQueryRequest;
import com.thm.pichub.model.dto.space_recruit_apply.SpaceRecruitApplyReviewRequest;
import com.thm.pichub.model.entity.SpaceRecruitApply;
import com.thm.pichub.model.vo.SpaceRecruitApplyVO;
import com.thm.pichub.service.SpaceRecruitApplyService;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * 招募申请接口
 *
 * @author thm
 * @date 2024
 */
@Slf4j
@RestController
@RequestMapping("/spaceRecruitApply")
@RequiredArgsConstructor
public class SpaceRecruitApplyController {

    private final SpaceRecruitApplyService spaceRecruitApplyService;

    /**
     * 申请加入空间
     */
    @PostMapping("/add")
    @ApiOperation("申请加入空间")
    public BaseResponse<Long> addApply(@RequestBody SpaceRecruitApplyAddRequest spaceRecruitApplyAddRequest,
                                       HttpServletRequest request) {
        if (spaceRecruitApplyAddRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        Long result = spaceRecruitApplyService.addApply(spaceRecruitApplyAddRequest, request);
        return ResultUtils.success(result);
    }

    /**
     * 审批申请
     */
    @PostMapping("/review")
    @ApiOperation("审批申请")
    public BaseResponse<Boolean> reviewApply(@Validated @RequestBody SpaceRecruitApplyReviewRequest reviewRequest,
                                             HttpServletRequest request) {
        if (reviewRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        Boolean result = spaceRecruitApplyService.reviewApply(reviewRequest, request);
        return ResultUtils.success(result);
    }

    /**
     * 分页获取申请列表
     */
    @PostMapping("/query")
    @ApiOperation("分页获取申请列表")
    public BaseResponse<IPage<SpaceRecruitApplyVO>> listApplyVOByPage(@RequestBody SpaceRecruitApplyQueryRequest spaceRecruitApplyQueryRequest) {
        if (spaceRecruitApplyQueryRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        long current = spaceRecruitApplyQueryRequest.getCurrent();
        long size = spaceRecruitApplyQueryRequest.getPageSize();
        IPage<SpaceRecruitApplyVO> applyVOPage = spaceRecruitApplyService.listApplyVOByPage(spaceRecruitApplyQueryRequest);
        return ResultUtils.success(applyVOPage);
    }

    /**
     * 获取我的申请列表
     */
    @PostMapping("/my/list")
    @ApiOperation("获取我的申请列表")
    public BaseResponse<List<SpaceRecruitApplyVO>> listMyApplies(HttpServletRequest request) {
        List<SpaceRecruitApplyVO> list = spaceRecruitApplyService.listMyApplies(request);
        return ResultUtils.success(list);
    }

    /**
     * 获取待审批数量
     */
    @GetMapping("/pending/count")
    @ApiOperation("获取待审批数量")
    public BaseResponse<Long> getPendingCount(@RequestParam(required = false) Long spaceId,
                                              @RequestParam(required = false) Long recruitId,
                                              HttpServletRequest request) {
        Long count = spaceRecruitApplyService.getPendingCount(spaceId, recruitId);
        return ResultUtils.success(count);
    }

    /**
     * 根据 id 获取申请
     */
    @GetMapping("/get/{id}")
    @ApiOperation("根据 id 获取申请")
    public BaseResponse<SpaceRecruitApply> getApplyById(@PathVariable long id) {
        SpaceRecruitApply apply = spaceRecruitApplyService.getApplyById(id);
        ThrowUtils.throwIf(apply == null, ErrorCode.NOT_FOUND_ERROR);
        return ResultUtils.success(apply);
    }
}
