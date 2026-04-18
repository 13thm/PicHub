package com.thm.pichub.websocket;

import com.thm.pichub.common.BaseResponse;
import com.thm.pichub.common.ResultUtils;
import com.thm.pichub.common.exception.BusinessException;
import com.thm.pichub.common.exception.ErrorCode;
import com.thm.pichub.service.PictureService;
import com.thm.pichub.service.UserService;
import com.thm.pichub.service.impl.PictureServiceImpl;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

/**
 * 图片编辑控制器
 * 提供图片编辑相关的 HTTP 接口
 */
@Slf4j
@RestController
@RequestMapping("/image/edit")
@Api(tags = "图片编辑管理")
public class ImageEditController {

    @Resource
    private EditLockManager editLockManager;

    @Resource
    private ChannelManager channelManager;

    @Resource
    private PictureService pictureService;

    @Resource
    private UserService userService;

    @Resource
    private ImageRotateUtil imageRotateUtil;

    /**
     * 保存编辑后的图片
     * 接收旋转后的图片文件并更新到 MinIO
     *
     * @param imageId 图片ID
     * @param file    旋转后的图片文件
     * @return 是否成功
     */
    @PostMapping("/save")
    @ApiOperation("保存编辑后的图片")
    public BaseResponse<Boolean> saveImage(
            @RequestParam Long imageId,
            @RequestParam MultipartFile file) {

        if (imageId == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "图片ID不能为空");
        }

        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "图片文件不能为空");
        }

        try {
            log.info("保存编辑后的图片: imageId={}, fileName={}", imageId, file.getOriginalFilename());

            // TODO: 上传到 MinIO 并更新数据库中的图片 URL
            // 这里需要调用你的 MinIO 上传逻辑

            // 示例：将文件转换为字节数组（实际实现可能需要调整）
            byte[] fileBytes = file.getBytes();

            // TODO: 调用 MinioUtil 上传文件
            // String newUrl = minioUtil.uploadFile(...);

            log.info("图片保存成功: imageId={}", imageId);
            return ResultUtils.success(true);

        } catch (IOException e) {
            log.error("保存图片失败: imageId={}", imageId, e);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "保存图片失败");
        }
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
}
