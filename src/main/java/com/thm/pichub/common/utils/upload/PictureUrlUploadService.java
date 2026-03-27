package com.thm.pichub.common.utils.upload;

import com.thm.pichub.common.exception.BusinessException;
import com.thm.pichub.common.exception.ErrorCode;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@Service
public class PictureUrlUploadService extends AbstractPictureUploadService {

    public PictureUrlUploadService() {
    }

    @Override
    protected UploadSourceData downloadFileAndGetMeta(Object... params) {
        // 1. 从参数中提取 URL 字符串
        if (params == null || params.length == 0 || !(params[0] instanceof String)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "URL参数缺失或类型错误");
        }
        String fileUrlStr = (String) params[0];

        try {
            if (fileUrlStr == null || fileUrlStr.isEmpty()) {
                throw new BusinessException(ErrorCode.PARAMS_ERROR, "图片URL不能为空");
            }

            URL url = new URL(fileUrlStr);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(10000);
            connection.setRequestProperty("User-Agent", "Mozilla/5.0");

            if (connection.getResponseCode() != 200) {
                throw new BusinessException(ErrorCode.PARAMS_ERROR, "图片下载失败，状态码: " + connection.getResponseCode());
            }

            InputStream inputStream = connection.getInputStream();
            String fileName = url.getPath().substring(url.getPath().lastIndexOf('/') + 1);
            if (fileName.isEmpty()) fileName = "default_image.jpg";

            long size = connection.getContentLengthLong();
            String contentType = connection.getContentType(); // 例如 image/jpeg

            String format = "jpg";
            if (contentType != null && contentType.contains("/")) {
                format = contentType.split("/")[1];
            }

            return new UploadSourceData(inputStream, fileName, size, format, contentType);

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "URL下载异常: " + e.getMessage());
        }
    }
}