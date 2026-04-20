package com.thm.pichub.controller;

import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.thm.pichub.common.BaseResponse;
import com.thm.pichub.common.constant.UserConstant;
import com.thm.pichub.common.ResultUtils;
import com.thm.pichub.common.exception.BusinessException;
import com.thm.pichub.common.exception.ErrorCode;
import com.thm.pichub.common.utils.MinioUtil;
import com.thm.pichub.model.entity.Picture;
import com.thm.pichub.model.entity.Space;
import com.thm.pichub.model.entity.User;
import com.thm.pichub.service.PictureService;
import com.thm.pichub.service.SpaceService;
import com.thm.pichub.service.SpaceUserService;
import com.thm.pichub.websocket.*;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.util.Date;

/**
 * 图片编辑控制器
 * 提供图片编辑相关的 HTTP 接口
 */
@Slf4j
@RestController
@RequestMapping("/image/edit")
public class ImageEditController {

    @Autowired
    private EditLockManager editLockManager;

    @Autowired
    private ChannelManager channelManager;

    @Autowired
    private PictureService pictureService;

    @Autowired
    private MinioUtil minioUtil;

    @Autowired
    private SpaceUserService spaceUserService;

    @Autowired
    private SpaceService spaceService;

    /**
     * 保存编辑后的图片
     * 接收旋转后的图片文件并更新到 MinIO
     * 使用相同文件名覆盖，不改变MinIO地址
     *
     * @param imageId 图片ID
     * @param file    旋转后的图片文件
     * @return 是否成功
     */
    @PostMapping("/save")
    @ApiOperation("保存编辑后的图片")
    public BaseResponse<Boolean> saveImage(
            @RequestParam Long imageId,
            @RequestParam MultipartFile file,
            HttpServletRequest request) {

        // 1. 参数校验
        if (imageId == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "图片ID不能为空");
        }

        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "图片文件不能为空");
        }

        // 2. 获取当前登录用户
        User loginUser = (User) request.getSession().getAttribute(UserConstant.USER_LOGIN_STATE);
        if (loginUser == null) {
            throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
        }
        Long userId = loginUser.getId();

        // 3. 查询原图信息
        Picture picture = pictureService.getById(imageId);
        if (picture == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "图片不存在");
        }

        // 4. 校验编辑权限
        Long spaceId = picture.getSpaceId();
        if (spaceId != null) {
            // 空间图片：检查空间权限
            Space space = spaceService.getById(spaceId);
            if (space == null) {
                throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "空间不存在");
            }
            boolean hasPermission = spaceUserService.isSpacePermission(spaceId, userId);
            if (!hasPermission && !userId.equals(space.getUserId())) {
                throw new BusinessException(ErrorCode.NO_AUTH_ERROR, "无权编辑此图片");
            }
        } else {
            // 广场图片：检查所有者权限
            if (!picture.getUserId().equals(userId) && !"admin".equals(loginUser.getUserRole())) {
                throw new BusinessException(ErrorCode.NO_AUTH_ERROR, "无权编辑此图片");
            }
        }

        try {
            log.info("保存编辑后的图片: imageId={}, 原始文件大小={}bytes", imageId, picture.getPicSize());

            // 5. 提取原文件名，使用相同文件名上传覆盖
            String fileName = extractFileNameFromUrl(picture.getUrl());
            log.info("使用相同文件名覆盖上传: {}", fileName);

            // 6. 删除旧文件（如果存在）
            if (minioUtil.isFileExist(fileName)) {
                minioUtil.deleteFile(fileName);
                log.info("已删除旧文件: {}", fileName);
            }

            // 7. 上传新文件到 MinIO（覆盖同文件名）
            minioUtil.uploadFile(file, fileName);
            String fileUrl = minioUtil.getFileUrl(fileName);

            log.info("覆盖上传完成: imageId={}, fileName={}, url={}", imageId, fileName, fileUrl);

            // 8. 更新数据库（URL不需要更新，因为是一样的）
            LambdaUpdateWrapper<Picture> updateWrapper = new LambdaUpdateWrapper<>();
            updateWrapper.eq(Picture::getId, imageId);
            updateWrapper.set(Picture::getPicSize, file.getSize());
            updateWrapper.set(Picture::getPicFormat, file.getContentType().split("/")[1]);
            updateWrapper.set(Picture::getEditTime, new Date());

            boolean updateSuccess = pictureService.update(updateWrapper);
            if (!updateSuccess) {
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, "图片更新失败");
            }

            // 9. 如果是空间图片，更新空间大小统计
            if (spaceId != null) {
                Space space = spaceService.getById(spaceId);
                if (space != null) {
                    long sizeDiff = file.getSize() - picture.getPicSize();
                    space.setTotalSize(space.getTotalSize() + sizeDiff);
                    spaceService.updateById(space);
                }
            }

            // 10. 释放编辑锁并重置角度
            editLockManager.unlock(imageId);
            channelManager.resetAngle(imageId);

            // 11. 广播保存完成消息
            WsMessage message = WsMessage.builder()
                    .type("image_saved")
                    .imageId(imageId)
                    .userId(userId)
                    .userName(loginUser.getUserName())
                    .timestamp(System.currentTimeMillis())
                    .build();
            channelManager.broadcastToChannel(imageId, message);

            log.info("图片保存成功: imageId={}", imageId);

            // 返回成功
            return ResultUtils.success(true);

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("保存图片失败: imageId={}", imageId, e);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "保存图片失败");
        }
    }

    /**
     * 从 MinIO URL 中提取文件名（去除查询参数）
     */
    private String extractFileNameFromUrl(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }
        // 去除查询参数（?后面的内容）
        String[] urlParts = url.split("\\?");
        String pathWithoutQuery = urlParts[0];
        // 从路径中提取文件名
        String[] pathParts = pathWithoutQuery.split("/");
        return pathParts[pathParts.length - 1];
    }

    /**
     * 获取图片当前编辑状态
     *
     * @param imageId 图片ID
     * @return 编辑状态
     */
    @GetMapping("/status/{imageId}")
    @ApiOperation("获取图片编辑状态")
    public BaseResponse<EditLockVO> getImageStatus(@PathVariable Long imageId) {

        if (imageId == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "图片ID不能为空");
        }

        EditLockVO status = new EditLockVO();
        status.setImageId(imageId);
        status.setAngle(channelManager.getAngle(imageId));

        EditLock lock = editLockManager.getEditLock(imageId);
        if (lock != null && lock.isEditing()) {
            status.setEditing(true);
            status.setEditorId(lock.getEditorId());
            status.setEditorName(lock.getEditorName());
        } else {
            status.setEditing(false);
        }

        return ResultUtils.success(status);
    }

    /**
     * 通过 WebSocket 获取图片状态时使用
     * 这个接口主要用于前端初始化时获取当前图片的状态
     *
     * @param imageId 图片ID
     * @return 编辑状态
     */
    @GetMapping("/current-angle/{imageId}")
    @ApiOperation("获取图片当前旋转角度")
    public BaseResponse<Integer> getCurrentAngle(@PathVariable Long imageId) {

        if (imageId == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "图片ID不能为空");
        }

        Integer angle = channelManager.getAngle(imageId);
        return ResultUtils.success(angle);
    }

    /**
     * 退出编辑模式（不保存）
     * 用于用户取消编辑时释放编辑锁
     *
     * @param imageId 图片ID
     * @param request HttpServletRequest
     * @return 是否成功
     */
    @PostMapping("/unlock")
    @ApiOperation("退出编辑模式")
    public BaseResponse<Boolean> unlockEdit(
            @RequestParam Long imageId,
            HttpServletRequest request) {

        if (imageId == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "图片ID不能为空");
        }

        // 获取当前登录用户
        User loginUser = (User) request.getSession().getAttribute(UserConstant.USER_LOGIN_STATE);
        if (loginUser == null) {
            throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
        }
        Long userId = loginUser.getId();

        // 检查是否是编辑者
        EditLock lock = editLockManager.getEditLock(imageId);
        if (lock == null || !lock.isEditing()) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "当前没有用户在编辑此图片");
        }

        if (!lock.getEditorId().equals(userId)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR, "您不是此图片的编辑者");
        }

        // 释放编辑锁并重置角度
        editLockManager.unlock(imageId);
        channelManager.resetAngle(imageId);

        // 广播退出编辑消息
        WsMessage message = WsMessage.builder()
                .type("EDIT_EXIT")
                .imageId(imageId)
                .userId(userId)
                .userName(loginUser.getUserName())
                .timestamp(System.currentTimeMillis())
                .build();
        channelManager.broadcastToChannel(imageId, message);

        log.info("用户 {}({}) 退出图片 {} 编辑模式", loginUser.getUserName(), userId, imageId);

        return ResultUtils.success(true);
    }
}
