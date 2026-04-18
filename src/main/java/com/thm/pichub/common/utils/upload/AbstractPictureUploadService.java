package com.thm.pichub.common.utils.upload;

import com.thm.pichub.common.exception.BusinessException;
import com.thm.pichub.common.exception.ErrorCode;
import com.thm.pichub.common.constant.UserConstant;
import com.thm.pichub.common.utils.MinioUtil;
import com.thm.pichub.model.entity.Picture;
import com.thm.pichub.model.entity.Space;
import com.thm.pichub.model.entity.User;
import com.thm.pichub.service.PictureService;
import com.thm.pichub.service.SpaceService;
import com.thm.pichub.service.SpaceUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import java.io.InputStream;
import java.util.Date;

/**
 * 图片上传抽象服务类 - 模板方法模式
 */
@Service
public abstract class AbstractPictureUploadService {

    @Autowired
    protected PictureService pictureService;

    @Autowired
    protected MinioUtil minioUtil;

    @Autowired
    protected SpaceService spaceService;

    @Autowired
    protected SpaceUserService spaceUserService;

    /**
     * 核心模板方法
     * @param params 可变参数，子类通过解析这个参数获取 MultipartFile 或 URL
     */
    public final Long executeUpload(HttpServletRequest request, String name, String introduction, String category, String tags, Long spaceId, Object... params) {
        // 1. 获取当前登录用户
        User loginUser = (User) request.getSession().getAttribute(UserConstant.USER_LOGIN_STATE);
        if (loginUser == null) {
            throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
        }
        Long userId = loginUser.getId();

        // 2. 如果传入了空间ID，需要校验空间容量和权限
        Space space = null;
        if (spaceId != null) {
            // 2.1 查询空间是否存在
            space = spaceService.getById(spaceId);
            if (space == null) {
                throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "空间不存在");
            }

            // 2.2 校验用户是否有权限上传到此空间
            boolean hasPermission = spaceUserService.isSpacePermission(spaceId, userId);
            if (!hasPermission && !userId.equals(space.getUserId()) && !"admin".equals(loginUser.getUserRole())) {
                throw new BusinessException(ErrorCode.NO_AUTH_ERROR, "无权上传到此空间");
            }
        }

        // 3. 获取文件流和元数据 (将 params 传给子类)
        UploadSourceData sourceData = downloadFileAndGetMeta(params);

        // 3.1 如果是空间图片，检查空间容量
        if (spaceId != null && space != null) {
            long picSize = sourceData.getFileSize();
            // 检查大小
            if (space.getTotalSize() + picSize > space.getMaxSize()) {
                throw new BusinessException(ErrorCode.PARAMS_ERROR, "空间容量不足，无法上传");
            }
            // 检查数量
            if (space.getTotalCount() + 1 > space.getMaxCount()) {
                throw new BusinessException(ErrorCode.PARAMS_ERROR, "空间图片数量已达上限");
            }
        }

        String fileName = null;
        try {
            // 4. 上传到 MinIO
            // 注意：这里调用了 MinioUtil 中新增的 InputStream 方法
            fileName = minioUtil.uploadFile(sourceData.getInputStream(), sourceData.getFileName(), sourceData.getFileSize(), sourceData.getContentType());
            String fileUrl = minioUtil.getFileUrl(fileName);

            // 5. 构建实体
            Picture picture = new Picture();
            picture.setUrl(fileUrl);
            picture.setName(name);
            picture.setIntroduction(introduction);
            picture.setCategory(category);
            picture.setTags(tags);
            picture.setPicSize(sourceData.getFileSize());
            picture.setPicFormat(sourceData.getFileFormat());
            picture.setReviewStatus(0);
            picture.setUserId(userId);
            picture.setSpaceId(spaceId); // 设置空间ID
            picture.setCreateTime(new Date());
            picture.setEditTime(new Date());
            picture.setIsDelete(0);

            // 6. 保存数据库
            boolean save = pictureService.save(picture);

            if (!save) {
                minioUtil.deleteFile(fileName);
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, "图片上传失败：数据库保存失败");
            }

            // 7. 如果是空间图片，更新空间的统计信息
            if (spaceId != null && space != null) {
                long picSize = sourceData.getFileSize();
                space.setTotalSize(space.getTotalSize() + picSize);
                space.setTotalCount(space.getTotalCount() + 1L);
                spaceService.updateById(space);
            }

            return picture.getId();

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "上传处理异常: ");
        } finally {
            if (sourceData.getInputStream() != null) {
                try {
                    sourceData.getInputStream().close();
                } catch (Exception ignored) {}
            }
        }
    }

    /**
     * 抽象方法：子类实现具体的文件获取逻辑
     */
    protected abstract UploadSourceData downloadFileAndGetMeta(Object... params);

    /**
     * 内部数据类
     */
    public static class UploadSourceData {
        private InputStream inputStream;
        private String fileName;
        private long fileSize;
        private String fileFormat; // 后缀，如 jpg
        private String contentType; // 完整类型，如 image/jpeg

        public UploadSourceData(InputStream inputStream, String fileName, long fileSize, String fileFormat, String contentType) {
            this.inputStream = inputStream;
            this.fileName = fileName;
            this.fileSize = fileSize;
            this.fileFormat = fileFormat;
            this.contentType = contentType;
        }

        public InputStream getInputStream() { return inputStream; }
        public String getFileName() { return fileName; }
        public long getFileSize() { return fileSize; }
        public String getFileFormat() { return fileFormat; }
        public String getContentType() { return contentType; }
    }
}