package com.thm.pichub.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.thm.pichub.common.exception.BusinessException;
import com.thm.pichub.common.exception.ErrorCode;
import com.thm.pichub.mapper.SpaceMapper;
import com.thm.pichub.model.dto.space.SpaceAddRequest;
import com.thm.pichub.model.dto.space.SpaceQueryRequest;
import com.thm.pichub.model.dto.space.SpaceUpdateRequest;
import com.thm.pichub.model.entity.Space;
import com.thm.pichub.model.entity.SpaceUser;
import com.thm.pichub.model.vo.SpaceVO;
import com.thm.pichub.model.vo.user.LoginUserVO;
import com.thm.pichub.service.SpaceService;
import com.thm.pichub.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.stream.Collectors;

import static com.thm.pichub.common.constant.Constant.INIT_TOTAL_COUNT;
import static com.thm.pichub.common.constant.Constant.INIT_TOTAL_SIZE;

/**
 * 空间服务实现
 */
@Service
@Slf4j
public class SpaceServiceImpl extends ServiceImpl<SpaceMapper, Space> implements SpaceService {

    @Resource
    private UserService userService;

    @Resource
    @org.springframework.context.annotation.Lazy
    private com.thm.pichub.service.SpaceUserService spaceUserService;

    @Override
    public long addSpace(SpaceAddRequest spaceAddRequest, HttpServletRequest request) {
        if (spaceAddRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }

        // 获取当前登录用户
        LoginUserVO loginUser = userService.getLoginUser(request);

        // 创建空间
        Space space = new Space();
        BeanUtils.copyProperties(spaceAddRequest, space);

        // 设置默认值
        if (space.getSpaceLevel() == null) {
            space.setSpaceLevel(0);
        }
        if (space.getSpaceType() == null) {
            space.setSpaceType(0);
        }

        // 设置创建用户
        space.setUserId(loginUser.getId());
        space.setTotalSize(INIT_TOTAL_SIZE);
        space.setTotalCount(INIT_TOTAL_COUNT);

        boolean save = this.save(space);
        if (!save) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR);
        }

        // 同步添加创建者为空间成员（admin角色）
        SpaceUser spaceUser = new SpaceUser();
        spaceUser.setSpaceId(space.getId());
        spaceUser.setUserId(loginUser.getId());
        spaceUser.setSpaceRole("admin");
        spaceUserService.save(spaceUser);

        return space.getId();
    }

    @Override
    public boolean deleteSpace(Long id, HttpServletRequest request) {
        if (id <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }

        Space space = this.getById(id);
        if (space == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "空间不存在");
        }

        // 获取当前登录用户
        LoginUserVO loginUser = userService.getLoginUser(request);

        // 只有空间创建者或管理员可删除
        if (!loginUser.getId().equals(space.getUserId()) && !"admin".equals(loginUser.getUserRole())) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR, "无权删除此空间");
        }

        return this.removeById(id);
    }

    @Override
    public boolean updateSpace(SpaceUpdateRequest spaceUpdateRequest, HttpServletRequest request) {
        if (spaceUpdateRequest == null || spaceUpdateRequest.getId() == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }

        Space space = this.getById(spaceUpdateRequest.getId());
        if (space == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "空间不存在");
        }

        // 获取当前登录用户
        LoginUserVO loginUser = userService.getLoginUser(request);

        // 只有空间创建者或管理员可更新
        if (!loginUser.getId().equals(space.getUserId()) && !"admin".equals(loginUser.getUserRole())) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR, "无权修改此空间");
        }

        Space updateSpace = new Space();
        BeanUtils.copyProperties(spaceUpdateRequest, updateSpace);
        return this.updateById(updateSpace);
    }

    @Override
    public Space getSpaceById(long id) {
        if (id <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        return this.getById(id);
    }

    @Override
    public SpaceVO getSpaceVOById(long id) {
        Space space = this.getById(id);
        return this.getSpaceVO(space);
    }

    @Override
    public List<SpaceVO> getSpaceVOList(List<Space> spaceList) {
        if (spaceList == null || spaceList.isEmpty()) {
            return null;
        }
        return spaceList.stream().map(this::getSpaceVO).collect(Collectors.toList());
    }

    @Override
    public QueryWrapper<Space> getQueryWrapper(SpaceQueryRequest spaceQueryRequest) {
        QueryWrapper<Space> queryWrapper = new QueryWrapper<>();
        if (spaceQueryRequest == null) {
            return queryWrapper;
        }

        String searchText = spaceQueryRequest.getSearchText();
        String spaceName = spaceQueryRequest.getSpaceName();
        Integer spaceLevel = spaceQueryRequest.getSpaceLevel();
        Integer spaceType = spaceQueryRequest.getSpaceType();
        Long userId = spaceQueryRequest.getUserId();
        String sortField = spaceQueryRequest.getSortField();
        String sortOrder = spaceQueryRequest.getSortOrder();

        if (StringUtils.isNotBlank(searchText)) {
            queryWrapper.and(q -> q.like("spaceName", searchText));
        }
        if (StringUtils.isNotBlank(spaceName)) {
            queryWrapper.like("spaceName", spaceName);
        }
        if (spaceLevel != null) {
            queryWrapper.eq("spaceLevel", spaceLevel);
        }
        if (spaceType != null) {
            queryWrapper.eq("spaceType", spaceType);
        }
        if (userId != null) {
            queryWrapper.eq("userId", userId);
        }
        queryWrapper.orderBy(StrUtil.isNotEmpty(sortField), StrUtil.equals(sortOrder, "ascend"), sortField);
        return queryWrapper;
    }

    @Override
    public Page<SpaceVO> listSpaceVOByPage(SpaceQueryRequest spaceQueryRequest, HttpServletRequest request) {
        long current = spaceQueryRequest.getCurrent();
        long pageSize = spaceQueryRequest.getPageSize();

        // 获取当前登录用户
        LoginUserVO loginUser = userService.getLoginUser(request);

        // 如果不是管理员，只能查看自己创建的空间
        if (!"admin".equals(loginUser.getUserRole())) {
            spaceQueryRequest.setUserId(loginUser.getId());
        }

        Page<Space> spacePage = this.page(new Page<>(current, pageSize), this.getQueryWrapper(spaceQueryRequest));
        Page<SpaceVO> spaceVOPage = new Page<>(current, pageSize, spacePage.getTotal());
        List<SpaceVO> spaceVOList = this.getSpaceVOList(spacePage.getRecords());
        spaceVOPage.setRecords(spaceVOList);
        return spaceVOPage;
    }

    private SpaceVO getSpaceVO(Space space) {
        if (space == null) {
            return null;
        }
        SpaceVO spaceVO = new SpaceVO();
        BeanUtils.copyProperties(space, spaceVO);
        return spaceVO;
    }
}
