package com.thm.pichub.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.IService;
import com.thm.pichub.model.dto.user.*;
import com.thm.pichub.model.entity.User;
import com.thm.pichub.model.vo.user.LoginUserVO;
import com.thm.pichub.model.vo.user.UserVO;


import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
* 用户服务
*/
public interface UserService extends IService<User> {

    /**
     * 用户注册
     */
    long userRegister(UserRegisterRequest userRegisterRequest);

    /**
     * 用户登录
     */
    LoginUserVO userLogin(UserLoginRequest userLoginRequest, HttpServletRequest request);

    /**
     * 获取当前登录用户
     */
    LoginUserVO getLoginUser(HttpServletRequest request);

    /**
     * 用户注销
     */
    boolean userLogout(HttpServletRequest request);

    /**
     * 管理员创建用户
     */
    long addUser(UserAddRequest userAddRequest);

    /**
     * 删除用户
     */
    boolean deleteUser(Long id);

    /**
     * 更新用户
     */
    boolean updateUser(UserUpdateRequest userUpdateRequest);

    /**
     * 根据 id 获取用户（仅管理员）
     */
    User getUserById(long id);

    /**
     * 根据 id 获取包装类
     */
    UserVO getUserVOById(long id);

    /**
     * 获取用户包装列表
     */
    List<UserVO> getUserVOList(List<User> userList);

    /**
     * 分页查询条件
     */
    QueryWrapper<User> getQueryWrapper(UserQueryRequest userQueryRequest);

    /**
     * 修改密码
     * @param userId 用户ID
     * @param userUpdatePasswordRequest 修改密码请求
     * @return 是否成功
     */
    boolean updateUserPassword(Long userId, UserUpdatePasswordRequest userUpdatePasswordRequest);
}