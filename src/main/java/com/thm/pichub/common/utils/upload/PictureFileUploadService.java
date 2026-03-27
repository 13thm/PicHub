package com.thm.pichub.common.utils.upload;

import com.thm.pichub.common.exception.BusinessException;
import com.thm.pichub.common.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@Service
public class PictureFileUploadService extends AbstractPictureUploadService {

    public PictureFileUploadService() {
    }

    @Override
    protected UploadSourceData downloadFileAndGetMeta(Object... params) {
        // 1. 从参数中提取 MultipartFile
        if (params == null || params.length == 0 || !(params[0] instanceof MultipartFile)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "文件参数缺失或类型错误");
        }
        MultipartFile file = (MultipartFile) params[0];

        try {
            if (file.isEmpty()) {
                throw new BusinessException(ErrorCode.PARAMS_ERROR, "上传文件为空");
            }

            InputStream inputStream = file.getInputStream();
            String fileName = file.getOriginalFilename();
            long size = file.getSize();

            String contentType = file.getContentType();
            String format = "jpg"; // 默认
            if (contentType != null && contentType.contains("/")) {
                format = contentType.split("/")[1];
            }

            return new UploadSourceData(inputStream, fileName, size, format, contentType);

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "文件流处理异常: " + e.getMessage());
        }
    }
}