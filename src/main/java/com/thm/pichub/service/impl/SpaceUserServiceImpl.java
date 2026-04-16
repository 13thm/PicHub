package com.thm.pichub.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.thm.pichub.common.exception.BusinessException;
import com.thm.pichub.common.exception.ErrorCode;
import com.thm.pichub.mapper.SpaceUserMapper;
import com.thm.pichub.model.dto.space_user.*;
import com.thm.pichub.model.entity.Space;
import com.thm.pichub.model.entity.SpaceUser;
import com.thm.pichub.model.entity.User;
import com.thm.pichub.model.vo.SpaceUserVO;
import com.thm.pichub.model.vo.user.LoginUserVO;
import com.thm.pichub.service.SpaceService;
import com.thm.pichub.service.SpaceUserService;
import com.thm.pichub.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 空间用户服务实现
 */
@Service
@Slf4j
public class SpaceUserServiceImpl extends ServiceImpl<SpaceUserMapper, SpaceUser> implements SpaceUserService {

    @Resource
    @org.springframework.context.annotation.Lazy
    private SpaceService spaceService;

    @Resource
    private UserService userService;

    @Override
    public long addSpaceUser(SpaceUserAddRequest spaceUserAddRequest, HttpServletRequest request) {
        if (spaceUserAddRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }

        Long spaceId = spaceUserAddRequest.getSpaceId();
        Long userId = spaceUserAddRequest.getUserId();

        // 校验空间是否存在
        Space space = spaceService.getById(spaceId);
        if (space == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "空间不存在");
        }

        // 权限校验：仅空间创建者可以拉人进空间
        LoginUserVO loginUser = userService.getLoginUser(request);
        if (!loginUser.getId().equals(space.getUserId()) && !"admin".equals(loginUser.getUserRole())) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR, "无权管理此空间成员");
        }

        // 校验用户是否存在
        User user = userService.getById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "用户不存在");
        }

        // 检查用户是否已在空间中
        QueryWrapper<SpaceUser> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("spaceId", spaceId);
        queryWrapper.eq("userId", userId);
        SpaceUser existSpaceUser = this.baseMapper.selectOne(queryWrapper);
        if (existSpaceUser != null) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "用户已在该空间中");
        }

        // 创建空间成员
        SpaceUser spaceUser = new SpaceUser();
        BeanUtils.copyProperties(spaceUserAddRequest, spaceUser);

        // 设置默认角色
        if (spaceUser.getSpaceRole() == null) {
            spaceUser.setSpaceRole("viewer");
        }

        boolean save = this.save(spaceUser);
        if (!save) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR);
        }
        return spaceUser.getId();
    }

    @Override
    public boolean deleteSpaceUser(Long id, HttpServletRequest request) {
        if (id <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }

        SpaceUser spaceUser = this.getById(id);
        if (spaceUser == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "空间成员不存在");
        }

        // 查询空间信息
        Space space = spaceService.getById(spaceUser.getSpaceId());
        if (space == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "空间不存在");
        }

        // 权限校验：仅空间创建者可以踢出成员
        com.thm.pichub.model.vo.user.LoginUserVO loginUser = userService.getLoginUser(request);
        if (!loginUser.getId().equals(space.getUserId()) && !"admin".equals(loginUser.getUserRole())) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR, "无权管理此空间成员");
        }

        // 不能踢出创建者
        if (spaceUser.getUserId().equals(space.getUserId())) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "不能踢出空间创建者");
        }

        return this.removeById(id);
    }

    @Override
    public boolean updateSpaceUser(SpaceUserUpdateRequest spaceUserUpdateRequest, HttpServletRequest request) {
        if (spaceUserUpdateRequest == null || spaceUserUpdateRequest.getId() == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }

        SpaceUser spaceUser = this.getById(spaceUserUpdateRequest.getId());
        if (spaceUser == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "空间成员不存在");
        }

        // 查询空间信息
        Space space = spaceService.getById(spaceUser.getSpaceId());
        if (space == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "空间不存在");
        }

        // 权限校验：仅空间创建者可以更新成员角色
        com.thm.pichub.model.vo.user.LoginUserVO loginUser = userService.getLoginUser(request);
        if (!loginUser.getId().equals(space.getUserId()) && !"admin".equals(loginUser.getUserRole())) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR, "无权管理此空间成员");
        }

        SpaceUser updateSpaceUser = new SpaceUser();
        BeanUtils.copyProperties(spaceUserUpdateRequest, updateSpaceUser);
        return this.updateById(updateSpaceUser);
    }

    @Override
    public SpaceUser getSpaceUserById(long id) {
        if (id <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        return this.getById(id);
    }

    @Override
    public SpaceUserVO getSpaceUserVOById(long id) {
        SpaceUserVO spaceUserVO = this.baseMapper.selectSpaceUserVOById(id);
        return spaceUserVO;
    }

    @Override
    public List<SpaceUserVO> getSpaceUserVOList(List<SpaceUser> spaceUserList) {
        if (spaceUserList == null || spaceUserList.isEmpty()) {
            return null;
        }
        return spaceUserList.stream().map(this::getSpaceUserVO).collect(Collectors.toList());
    }

    @Override
    public QueryWrapper<SpaceUser> getQueryWrapper(SpaceUserQueryRequest spaceUserQueryRequest) {
        QueryWrapper<SpaceUser> queryWrapper = new QueryWrapper<>();
        if (spaceUserQueryRequest == null) {
            return queryWrapper;
        }

        Long spaceId = spaceUserQueryRequest.getSpaceId();
        Long userId = spaceUserQueryRequest.getUserId();
        String spaceRole = spaceUserQueryRequest.getSpaceRole();
        String sortField = spaceUserQueryRequest.getSortField();
        String sortOrder = spaceUserQueryRequest.getSortOrder();

        if (spaceId != null) {
            queryWrapper.eq("spaceId", spaceId);
        }
        if (userId != null) {
            queryWrapper.eq("userId", userId);
        }
        if (StringUtils.isNotBlank(spaceRole)) {
            queryWrapper.eq("spaceRole", spaceRole);
        }
        queryWrapper.orderBy(StrUtil.isNotEmpty(sortField), StrUtil.equals(sortOrder, "ascend"), sortField);
        return queryWrapper;
    }

    @Override
    public Page<SpaceUserVO> listSpaceUserVOByPage(SpaceUserQueryRequest spaceUserQueryRequest) {
        long current = spaceUserQueryRequest.getCurrent();
        long pageSize = spaceUserQueryRequest.getPageSize();

        Long spaceId = spaceUserQueryRequest.getSpaceId();
        Long userId = spaceUserQueryRequest.getUserId();
        String spaceRole = spaceUserQueryRequest.getSpaceRole();
        String sortField = spaceUserQueryRequest.getSortField();
        String sortOrder = spaceUserQueryRequest.getSortOrder();

        // 处理排序方向
        if ("ascend".equals(sortOrder)) {
            sortOrder = "ASC";
        } else if ("descend".equals(sortOrder)) {
            sortOrder = "DESC";
        }
        // 默认排序字段
        if (sortField == null || sortField.isEmpty()) {
            sortField = "createTime";
            sortOrder = "DESC";
        }

        Page<SpaceUserVO> spaceUserVOPage = new Page<>(current, pageSize);
        IPage<SpaceUserVO> result = baseMapper.selectSpaceUserVOPage(spaceUserVOPage, spaceId, userId, spaceRole, sortField, sortOrder);

        spaceUserVOPage.setRecords(result.getRecords());
        spaceUserVOPage.setTotal(result.getTotal());

        return spaceUserVOPage;
    }

    @Override
    public boolean isSpaceAdmin(Long spaceId, Long userId) {
        if (spaceId == null || userId == null) {
            return false;
        }

        // 查询空间信息
        Space space = spaceService.getById(spaceId);
        if (space != null && space.getUserId().equals(userId)) {
            return true;
        }

        // 查询空间成员信息
        QueryWrapper<SpaceUser> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("spaceId", spaceId);
        queryWrapper.eq("userId", userId);
        SpaceUser spaceUser = this.baseMapper.selectOne(queryWrapper);

        return spaceUser != null && "admin".equals(spaceUser.getSpaceRole());
    }

    private SpaceUserVO getSpaceUserVO(SpaceUser spaceUser) {
        if (spaceUser == null) {
            return null;
        }
        SpaceUserVO spaceUserVO = new SpaceUserVO();
        BeanUtils.copyProperties(spaceUser, spaceUserVO);

        // 查询用户信息
        User user = userService.getById(spaceUser.getUserId());
        if (user != null) {
            spaceUserVO.setUserAccount(user.getUserAccount());
            spaceUserVO.setUserName(user.getUserName());
        }

        return spaceUserVO;
    }
}
