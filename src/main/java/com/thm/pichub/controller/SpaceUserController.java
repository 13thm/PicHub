package com.thm.pichub.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.thm.pichub.common.BaseResponse;
import com.thm.pichub.common.DeleteRequest;
import com.thm.pichub.common.ResultUtils;
import com.thm.pichub.common.exception.BusinessException;
import com.thm.pichub.common.exception.ErrorCode;
import com.thm.pichub.model.dto.space_user.SpaceUserAddRequest;
import com.thm.pichub.model.dto.space_user.SpaceUserQueryRequest;
import com.thm.pichub.model.dto.space_user.SpaceUserUpdateRequest;
import com.thm.pichub.model.entity.SpaceUser;
import com.thm.pichub.model.vo.SpaceUserVO;
import com.thm.pichub.service.SpaceUserService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

/**
 * 空间用户接口
 */
@RestController
@RequestMapping("/spaceUser")
public class SpaceUserController {

    @Resource
    private SpaceUserService spaceUserService;

    /**
     * 添加空间成员
     */
    @PostMapping("/add")
    public BaseResponse<Long> addSpaceUser(@RequestBody SpaceUserAddRequest spaceUserAddRequest,
                                            HttpServletRequest request) {
        if (spaceUserAddRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        long result = spaceUserService.addSpaceUser(spaceUserAddRequest, request);
        return ResultUtils.success(result);
    }

    /**
     * 删除空间成员
     */
    @PostMapping("/delete")
    public BaseResponse<Boolean> deleteSpaceUser(@RequestBody DeleteRequest deleteRequest,
                                                  HttpServletRequest request) {
        if (deleteRequest == null || deleteRequest.getId() == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        boolean result = spaceUserService.deleteSpaceUser(deleteRequest.getId(), request);
        return ResultUtils.success(result);
    }

    /**
     * 更新空间成员
     */
    @PostMapping("/update")
    public BaseResponse<Boolean> updateSpaceUser(@RequestBody SpaceUserUpdateRequest spaceUserUpdateRequest,
                                                  HttpServletRequest request) {
        if (spaceUserUpdateRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        boolean result = spaceUserService.updateSpaceUser(spaceUserUpdateRequest, request);
        return ResultUtils.success(result);
    }

    /**
     * 根据 id 获取空间成员
     */
    @GetMapping("/get/{id}")
    public BaseResponse<SpaceUser> getSpaceUserById(@PathVariable long id) {
        SpaceUser spaceUser = spaceUserService.getSpaceUserById(id);
        return ResultUtils.success(spaceUser);
    }

    /**
     * 根据 id 获取空间成员VO
     */
    @GetMapping("/get/vo/{id}")
    public BaseResponse<SpaceUserVO> getSpaceUserVOById(@PathVariable long id) {
        SpaceUserVO spaceUserVO = spaceUserService.getSpaceUserVOById(id);
        return ResultUtils.success(spaceUserVO);
    }

    /**
     * 分页获取空间成员列表
     */
    @PostMapping("/list/page/vo")
    public BaseResponse<Page<SpaceUserVO>> listSpaceUserVOByPage(@RequestBody SpaceUserQueryRequest spaceUserQueryRequest) {
        if (spaceUserQueryRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        Page<SpaceUserVO> spaceUserVOPage = spaceUserService.listSpaceUserVOByPage(spaceUserQueryRequest);
        return ResultUtils.success(spaceUserVOPage);
    }

    /**
     * 判断用户的权限
     */
    @GetMapping("/SpacePermission")
    public BaseResponse<String> isSpacePermission(Long spaceId, Long userId) {
        return ResultUtils.success(spaceUserService.SpacePermission(spaceId, userId));
    }
}
