package com.thm.pichub.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.thm.pichub.common.BaseResponse;
import com.thm.pichub.common.DeleteRequest;
import com.thm.pichub.common.ResultUtils;
import com.thm.pichub.common.exception.BusinessException;
import com.thm.pichub.common.exception.ErrorCode;
import com.thm.pichub.model.dto.picture.PictureQueryRequest;
import com.thm.pichub.model.dto.picture.PictureUpdateRequest;
import com.thm.pichub.model.dto.picture.ReviewPictureRequest;
import com.thm.pichub.model.entity.User;
import com.thm.pichub.model.vo.picture.PictureVO;
import com.thm.pichub.model.vo.user.LoginUserVO;
import com.thm.pichub.service.PictureService;
import com.thm.pichub.service.UserService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * 图片接口
 */
@RestController
@RequestMapping("/picture")
public class PictureController {

    @Resource
    private PictureService pictureService;

    @Resource
    private UserService userService;

    /**
     * 上传图片
     */
    @PostMapping("/upload")
    public BaseResponse<Long> uploadPicture(
            @RequestParam("file") MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam(value = "introduction", required = false) String introduction,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "tags", required = false) String tags,
            HttpServletRequest request) {
        Long pictureId = pictureService.uploadPicture(file, name, introduction, category, tags, request);
        return ResultUtils.success(pictureId);
    }

    /**
     * 审核图片（仅管理员）
     */
    @PostMapping("/review")
    public BaseResponse<Boolean> reviewPicture(@RequestBody ReviewPictureRequest reviewRequest,
                                               HttpServletRequest request) {
        Long pictureId = reviewRequest.getId();
        Integer reviewStatus = reviewRequest.getReviewStatus();
        String reviewMessage = reviewRequest.getReviewMessage();

        // 1. 仅管理员可审核
        LoginUserVO loginUser = userService.getLoginUser(request);
        if (!"admin".equals(loginUser.getUserRole())) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }

        // 2. 调用 service
        boolean result = pictureService.reviewPicture(pictureId, reviewStatus, reviewMessage, loginUser.getId());
        return ResultUtils.success(result);
    }

    /**
     * 下载图片
     */
    @GetMapping("/download/{pictureId}")
    public void downloadPicture(@PathVariable Long pictureId, HttpServletResponse response) {
        try {
            InputStream inputStream = pictureService.downloadPicture(pictureId);
            
            // 设置响应头
            response.setContentType("application/octet-stream");
            response.setHeader("Content-Disposition", "attachment; filename=\"image.jpg\"");
            
            // 写入响应流
            try (OutputStream outputStream = response.getOutputStream()) {
                byte[] buffer = new byte[1024];
                int len;
                while ((len = inputStream.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, len);
                }
                outputStream.flush();
            }
            inputStream.close();
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "下载失败");
        }
    }

    /**
     * 修改图片信息
     */
    @PostMapping("/update")
    public BaseResponse<Boolean> updatePicture(@RequestBody PictureUpdateRequest pictureUpdateRequest) {
        if (pictureUpdateRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        boolean result = pictureService.updatePicture(pictureUpdateRequest);
        return ResultUtils.success(result);
    }

    /**
     * 删除图片
     */
    @PostMapping("/delete")
    public BaseResponse<Boolean> deletePicture(@RequestBody DeleteRequest deleteRequest, HttpServletRequest request) {
        if (deleteRequest == null || deleteRequest.getId() == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        boolean result = pictureService.deletePicture(deleteRequest.getId(), request);
        return ResultUtils.success(result);
    }

    /**
     * 分页获取图片列表
     */
    @PostMapping("/list/page/vo")
    public BaseResponse<Page<PictureVO>> listPictureVOByPage(@RequestBody PictureQueryRequest pictureQueryRequest) {
        Page<PictureVO> pictureVOPage = pictureService.listPictureVOByPage(pictureQueryRequest);
        return ResultUtils.success(pictureVOPage);
    }
}