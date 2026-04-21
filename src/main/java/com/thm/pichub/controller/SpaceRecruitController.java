package com.thm.pichub.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.thm.pichub.common.BaseResponse;
import com.thm.pichub.common.DeleteRequest;
import com.thm.pichub.common.ResultUtils;
import com.thm.pichub.common.exception.BusinessException;
import com.thm.pichub.common.exception.ErrorCode;
import com.thm.pichub.model.dto.space_recruit.SpaceRecruitAddRequest;
import com.thm.pichub.model.dto.space_recruit.SpaceRecruitQueryRequest;
import com.thm.pichub.model.dto.space_recruit.SpaceRecruitUpdateRequest;
import com.thm.pichub.model.entity.SpaceRecruit;
import com.thm.pichub.model.vo.SpaceRecruitVO;
import com.thm.pichub.service.SpaceRecruitService;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * 空间招募接口
 *
 * @author thm
 * @date 2024
 */
@Slf4j
@RestController
@RequestMapping("/spaceRecruit")
@RequiredArgsConstructor
public class SpaceRecruitController {

    private final SpaceRecruitService spaceRecruitService;

    /**
     * 新增招募
     */
    @PostMapping("/add")
    @ApiOperation("新增招募")
    public BaseResponse<Long> addRecruit(@RequestBody SpaceRecruitAddRequest spaceRecruitAddRequest,
                                         HttpServletRequest request) {
        if (spaceRecruitAddRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        Long result = spaceRecruitService.addRecruit(spaceRecruitAddRequest, request);
        return ResultUtils.success(result);
    }

    /**
     * 删除招募
     */
    @PostMapping("/delete")
    @ApiOperation("删除招募")
    public BaseResponse<Boolean> deleteRecruit(@RequestBody DeleteRequest deleteRequest,
                                               HttpServletRequest request) {
        if (deleteRequest == null || deleteRequest.getId() == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        Boolean result = spaceRecruitService.deleteRecruit(deleteRequest.getId(), request);
        return ResultUtils.success(result);
    }

    /**
     * 更新招募
     */
    @PostMapping("/update")
    @ApiOperation("更新招募")
    public BaseResponse<Boolean> updateRecruit(@RequestBody SpaceRecruitUpdateRequest spaceRecruitUpdateRequest,
                                               HttpServletRequest request) {
        if (spaceRecruitUpdateRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        Boolean result = spaceRecruitService.updateRecruit(spaceRecruitUpdateRequest, request);
        return ResultUtils.success(result);
    }

    /**
     * 根据 id 获取招募
     */
    @GetMapping("/get/{id}")
    @ApiOperation("根据 id 获取招募")
    public BaseResponse<SpaceRecruit> getRecruitById(@PathVariable long id) {
        SpaceRecruit recruit = spaceRecruitService.getRecruitById(id);
        if (recruit == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR);
        }
        return ResultUtils.success(recruit);
    }

    /**
     * 分页获取招募列表（广场可见）
     */
    @PostMapping("/list/page/vo")
    @ApiOperation("分页获取招募列表")
    public BaseResponse<Page<SpaceRecruitVO>> listRecruitVOByPage(@RequestBody SpaceRecruitQueryRequest spaceRecruitQueryRequest) {
        if (spaceRecruitQueryRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        long current = spaceRecruitQueryRequest.getCurrent();
        long size = spaceRecruitQueryRequest.getPageSize();
        Page<SpaceRecruitVO> recruitVOPage = spaceRecruitService.listRecruitVOByPage(spaceRecruitQueryRequest);
        return ResultUtils.success(recruitVOPage);
    }

    /**
     * 获取我发布的招募列表
     */
    @PostMapping("/my/list")
    @ApiOperation("获取我发布的招募列表")
    public BaseResponse<List<SpaceRecruitVO>> listMyRecruits(HttpServletRequest request) {
        List<SpaceRecruitVO> list = spaceRecruitService.listMyRecruits(request);
        return ResultUtils.success(list);
    }

    /**
     * 根据空间ID获取招募
     */
    @GetMapping("/get/bySpace/{spaceId}")
    @ApiOperation("根据空间ID获取招募")
    public BaseResponse<SpaceRecruitVO> getRecruitBySpaceId(@PathVariable Long spaceId) {
        if (spaceId == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        SpaceRecruitVO recruitVO = spaceRecruitService.getRecruitBySpaceId(spaceId);
        return ResultUtils.success(recruitVO);
    }

    /**
     * 分页查询招募（管理员）
     */
    @PostMapping("/query")
    @ApiOperation("分页查询招募")
    public BaseResponse<Page<SpaceRecruitVO>> queryRecruit(@RequestBody SpaceRecruitQueryRequest spaceRecruitQueryRequest) {
        if (spaceRecruitQueryRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        Page<SpaceRecruitVO> recruitVOPage = spaceRecruitService.listRecruitByPage(spaceRecruitQueryRequest);
        return ResultUtils.success(recruitVOPage);
    }
}
