package com.thm.pichub.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.thm.pichub.common.BaseResponse;
import com.thm.pichub.common.DeleteRequest;
import com.thm.pichub.common.ResultUtils;
import com.thm.pichub.common.exception.BusinessException;
import com.thm.pichub.common.exception.ErrorCode;
import com.thm.pichub.model.dto.space.SpaceAddRequest;
import com.thm.pichub.model.dto.space.SpaceQueryRequest;
import com.thm.pichub.model.dto.space.SpaceUpdateRequest;
import com.thm.pichub.model.entity.Space;
import com.thm.pichub.model.vo.SpaceVO;
import com.thm.pichub.service.SpaceService;
import com.thm.pichub.service.UserService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

/**
 * 空间接口
 */
@RestController
@RequestMapping("/space")
public class SpaceController {

    @Resource
    private SpaceService spaceService;

    @Resource
    private UserService userService;

    /**
     * 新增空间
     */
    @PostMapping("/add")
    public BaseResponse<Long> addSpace(@RequestBody SpaceAddRequest spaceAddRequest, HttpServletRequest request) {
        if (spaceAddRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        long result = spaceService.addSpace(spaceAddRequest, request);
        return ResultUtils.success(result);
    }

    /**
     * 删除空间
     */
    @PostMapping("/delete")
    public BaseResponse<Boolean> deleteSpace(@RequestBody DeleteRequest deleteRequest, HttpServletRequest request) {
        if (deleteRequest == null || deleteRequest.getId() == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        boolean result = spaceService.deleteSpace(deleteRequest.getId(), request);
        return ResultUtils.success(result);
    }

    /**
     * 更新空间
     */
    @PostMapping("/update")
    public BaseResponse<Boolean> updateSpace(@RequestBody SpaceUpdateRequest spaceUpdateRequest, HttpServletRequest request) {
        if (spaceUpdateRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        boolean result = spaceService.updateSpace(spaceUpdateRequest, request);
        return ResultUtils.success(result);
    }

    /**
     * 根据 id 获取空间
     */
    @GetMapping("/get/{id}")
    public BaseResponse<Space> getSpaceById(@PathVariable long id) {
        Space space = spaceService.getSpaceById(id);
        return ResultUtils.success(space);
    }

    /**
     * 根据 id 获取空间VO
     */
    @GetMapping("/get/vo/{id}")
    public BaseResponse<SpaceVO> getSpaceVOById(@PathVariable long id) {
        SpaceVO spaceVO = spaceService.getSpaceVOById(id);
        return ResultUtils.success(spaceVO);
    }

    /**
     * 分页获取空间列表
     */
    @PostMapping("/list/page/vo")
    public BaseResponse<Page<SpaceVO>> listSpaceVOByPage(@RequestBody SpaceQueryRequest spaceQueryRequest,
                                                          HttpServletRequest request) {
        if (spaceQueryRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        Page<SpaceVO> spaceVOPage = spaceService.listSpaceVOByPage(spaceQueryRequest, request);
        return ResultUtils.success(spaceVOPage);
    }
}
