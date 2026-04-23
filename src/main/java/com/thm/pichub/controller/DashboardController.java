package com.thm.pichub.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.thm.pichub.common.BaseResponse;
import com.thm.pichub.common.ResultUtils;
import com.thm.pichub.model.entity.Picture;
import com.thm.pichub.model.entity.Space;
import com.thm.pichub.model.entity.User;
import com.thm.pichub.model.vo.DashboardStatsVO;
import com.thm.pichub.service.PictureService;
import com.thm.pichub.service.SpaceService;
import com.thm.pichub.service.UserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.util.List;

/**
 * 管理面板统计接口
 */
@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Resource
    private UserService userService;

    @Resource
    private PictureService pictureService;

    @Resource
    private SpaceService spaceService;

    /**
     * 获取统计数据
     */
    @GetMapping("/stats")
    public BaseResponse<DashboardStatsVO> getStats() {
        DashboardStatsVO stats = new DashboardStatsVO();

        // 统计用户总数
        QueryWrapper<User> userQueryWrapper = new QueryWrapper<>();
        Long userCount = userService.count(userQueryWrapper);
        stats.setUserCount(userCount);

        // 统计图片总数
        QueryWrapper<Picture> pictureQueryWrapper = new QueryWrapper<>();
        Long pictureCount = pictureService.count(pictureQueryWrapper);
        stats.setPictureCount(pictureCount);

        // 统计空间使用总量（字节）
        QueryWrapper<Space> spaceQueryWrapper = new QueryWrapper<>();
        spaceQueryWrapper.select("IFNULL(SUM(totalSize), 0) as totalSize");
        Long spaceSize = 0L;
        List<Space> spaces = spaceService.list(spaceQueryWrapper);
        for (Space space : spaces) {
            if (space.getTotalSize() != null) {
                spaceSize += space.getTotalSize();
            }
        }
        stats.setSpaceSize(spaceSize);

        // 统计待审核图片数
        QueryWrapper<Picture> pendingQueryWrapper = new QueryWrapper<>();
        pendingQueryWrapper.eq("reviewStatus", 0);
        Long pendingReview = pictureService.count(pendingQueryWrapper);
        stats.setPendingReview(pendingReview);

        return ResultUtils.success(stats);
    }
}
