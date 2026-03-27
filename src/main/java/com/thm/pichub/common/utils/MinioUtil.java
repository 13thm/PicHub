package com.thm.pichub.common.utils;

import io.minio.*;
import io.minio.messages.Bucket;
import io.minio.messages.Item;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;

@Component
@RequiredArgsConstructor
public class MinioUtil {

    private final MinioClient minioClient;

    @Value("${minio.bucketName}")
    private String bucketName;

    // ======================== 桶操作 ========================

    @SneakyThrows
    public boolean bucketExists(String bucketName) {
        return minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
    }

    @SneakyThrows
    public void createBucket(String bucketName) {
        if (!bucketExists(bucketName)) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
        }
    }

    @SneakyThrows
    public List<Bucket> getAllBuckets() {
        return minioClient.listBuckets();
    }

    // ======================== 文件操作 ========================

    /**
     * 【新增方法】支持 InputStream 上传
     * 用于处理非 MultipartFile 的场景（如 URL 下载流、Base64 流）
     *
     * @param inputStream 文件输入流
     * @param fileName    文件名（包含后缀）
     * @param fileSize    文件大小（字节），MinIO 上传流必须知道大小
     * @param contentType 文件类型 (如 "image/jpeg")，如果不确定可传 null
     */
    @SneakyThrows
    public String uploadFile(InputStream inputStream, String fileName, long fileSize, String contentType) {
        // 1. 确保桶存在
        createBucket(bucketName);

        // 2. 构建上传参数
        PutObjectArgs.Builder builder = PutObjectArgs.builder()
                .bucket(bucketName)
                .object(fileName)
                .stream(inputStream, fileSize, -1); // -1 表示未知部分大小，但总大小必须已知

        // 3. 设置 Content-Type (如果有的话)
        if (contentType != null && !contentType.isEmpty()) {
            builder.contentType(contentType);
        }

        // 4. 执行上传
        minioClient.putObject(builder.build());

        return fileName;
    }

    /**
     * 【重载方法】简化调用，适配你的抽象类
     * 如果你的抽象类中无法获取 fileSize，可以使用这个，但建议尽量获取大小
     */
    public String uploadFile(InputStream inputStream, String fileName) {
        // 注意：这里无法准确获取流大小，如果必须精确大小，请使用上面的方法
        // 这里做一个假设或者抛出异常提示使用者使用带 size 的方法
        // 为了适配你的代码，我暂时假设一个默认值或尝试 available (不推荐用于生产大文件)
        try {
            long size = inputStream.available();
            return uploadFile(inputStream, fileName, size, "application/octet-stream");
        } catch (Exception e) {
            throw new RuntimeException("无法获取流大小，请使用带 fileSize 参数的 uploadFile 方法", e);
        }
    }

    /**
     * 原有的 MultipartFile 上传方法
     */
    @SneakyThrows
    public String uploadFile(MultipartFile file, String fileName) {
        createBucket(bucketName);
        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(fileName)
                        .stream(file.getInputStream(), file.getSize(), -1)
                        .contentType(file.getContentType())
                        .build()
        );
        return fileName;
    }

    /**
     * 原有的 MultipartFile 上传方法（自动生成文件名）
     */
    public String uploadFile(MultipartFile file) {
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        return uploadFile(file, fileName);
    }

    // ======================== 其他工具方法 ========================

    @SneakyThrows
    public InputStream downloadFile(String fileName) {
        return minioClient.getObject(
                GetObjectArgs.builder()
                        .bucket(bucketName)
                        .object(fileName)
                        .build()
        );
    }

    @SneakyThrows
    public void deleteFile(String fileName) {
        minioClient.removeObject(
                RemoveObjectArgs.builder()
                        .bucket(bucketName)
                        .object(fileName)
                        .build()
        );
    }

    @SneakyThrows
    public String getFileUrl(String fileName) {
        return minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .bucket(bucketName)
                        .object(fileName)
                        .method(io.minio.http.Method.GET)
                        .build()
        );
    }

    @SneakyThrows
    public boolean isFileExist(String fileName) {
        try {
            minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(bucketName)
                            .object(fileName)
                            .build()
            );
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @SneakyThrows
    public Iterable<Result<Item>> getFileList() {
        return minioClient.listObjects(
                ListObjectsArgs.builder()
                        .bucket(bucketName)
                        .build()
        );
    }
}