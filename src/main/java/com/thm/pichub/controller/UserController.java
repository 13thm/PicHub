package com.thm.pichub.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.thm.pichub.common.BaseResponse;
import com.thm.pichub.common.DeleteRequest;
import com.thm.pichub.common.ResultUtils;
import com.thm.pichub.common.exception.BusinessException;
import com.thm.pichub.common.exception.ErrorCode;
import com.thm.pichub.model.dto.user.*;
import com.thm.pichub.model.entity.User;
import com.thm.pichub.model.vo.user.LoginUserVO;
import com.thm.pichub.model.vo.user.UserVO;
import com.thm.pichub.service.UserService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * 用户接口
 */
@RestController
@RequestMapping("/user")
public class UserController {

    @Resource
    private UserService userService;

    // 1. 用户注册
    @PostMapping("/register")
    public BaseResponse<Long> userRegister(@RequestBody UserRegisterRequest userRegisterRequest) {
        long result = userService.userRegister(userRegisterRequest);
        return ResultUtils.success(result);
    }

    // 2. 用户登录
    @PostMapping("/login")
    public BaseResponse<LoginUserVO> userLogin(@RequestBody UserLoginRequest userLoginRequest, HttpServletRequest request) {
        LoginUserVO loginUserVO = userService.userLogin(userLoginRequest, request);
        return ResultUtils.success(loginUserVO);
    }

    // 3. 获取当前登录用户
    @GetMapping("/get/login")
    public BaseResponse<LoginUserVO> getLoginUser(HttpServletRequest request) {
        return ResultUtils.success(userService.getLoginUser(request));
    }

    // 4. 用户注销
    @PostMapping("/logout")
    public BaseResponse<Boolean> userLogout(HttpServletRequest request) {
        return ResultUtils.success(userService.userLogout(request));
    }

    // 5. 管理员创建用户
    @PostMapping("/add")
    public BaseResponse<Long> addUser(@RequestBody UserAddRequest userAddRequest) {
        return ResultUtils.success(userService.addUser(userAddRequest));
    }

    // 6. 根据 id 获取用户（仅管理员）
    @GetMapping("/get/{id}")
    public BaseResponse<User> getUserById(@PathVariable long id) {
        User user = userService.getUserById(id);
        return ResultUtils.success(user);
    }

    // 7. 根据 id 获取包装类
    @GetMapping("/get/vo/{id}")
    public BaseResponse<UserVO> getUserVOById(@PathVariable long id) {
        UserVO userVO = userService.getUserVOById(id);
        return ResultUtils.success(userVO);
    }

    // 8. 删除用户
    @PostMapping("/delete")
    public BaseResponse<Boolean> deleteUser(@RequestBody DeleteRequest deleteRequest) {
        return ResultUtils.success(userService.deleteUser(deleteRequest.getId()));
    }

    // 9. 更新用户
    @PostMapping("/update")
    public BaseResponse<Boolean> updateUser(@RequestBody UserUpdateRequest userUpdateRequest) {
        return ResultUtils.success(userService.updateUser(userUpdateRequest));
    }

    // 10. 分页获取用户封装列表（仅管理员）
    @PostMapping("/list/page/vo")
    public BaseResponse<Page<UserVO>> listUserVOByPage(@RequestBody UserQueryRequest userQueryRequest) {
        long current = userQueryRequest.getCurrent();
        long size = userQueryRequest.getPageSize();
        Page<User> userPage = userService.page(new Page<>(current, size), userService.getQueryWrapper(userQueryRequest));
        Page<UserVO> userVOPage = new Page<>(current, size, userPage.getTotal());
        List<UserVO> userVOList = userService.getUserVOList(userPage.getRecords());
        userVOPage.setRecords(userVOList);
        return ResultUtils.success(userVOPage);
    }

    // 11. 修改密码
    @PostMapping("/update/password")
    public BaseResponse<Boolean> updateUserPassword(@RequestBody UserUpdatePasswordRequest userUpdatePasswordRequest,
                                                    HttpServletRequest request) {
        if (userUpdatePasswordRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        // 获取当前登录用户
        LoginUserVO loginUser = userService.getLoginUser(request);
        boolean result = userService.updateUserPassword(loginUser.getId(), userUpdatePasswordRequest);
        return ResultUtils.success(result);
    }
}