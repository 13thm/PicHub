package com.thm.pichub.websocket;

import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

/**
 * 图片旋转工具类
 * 使用 thumbnailator 库进行图片旋转
 */
@Slf4j
@Component
public class ImageRotateUtil {

    /**
     * 旋转图片
     *
     * @param imageData 原始图片数据
     * @param angle     旋转角度（90, 180, 270）
     * @return 旋转后的图片数据
     */
    public byte[] rotateImage(byte[] imageData, int angle) throws IOException {
        if (imageData == null || imageData.length == 0) {
            throw new IllegalArgumentException("图片数据不能为空");
        }

        // 验证角度
        if (angle != 0 && angle != 90 && angle != 180 && angle != 270) {
            throw new IllegalArgumentException("旋转角度只能是 0、90、180、270");
        }

        // 如果角度为0，直接返回原始数据
        if (angle == 0) {
            return imageData;
        }

        log.info("开始旋转图片: angle={}度", angle);

        try {
            // 使用 thumbnailator 进行图片旋转
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

            Thumbnails.of(new ByteArrayInputStream(imageData))
                    .scale(1.0)
                    .rotate(angle)
                    .toOutputStream(outputStream);

            byte[] result = outputStream.toByteArray();
            log.info("图片旋转成功: 原始大小={}KB, 旋转后大小={}KB",
                    imageData.length / 1024, result.length / 1024);

            return result;

        } catch (IOException e) {
            log.error("图片旋转失败: angle={}度", angle, e);
            throw new IOException("图片旋转失败: " + e.getMessage(), e);
        }
    }

    /**
     * 旋转图片（指定旋转方向）
     *
     * @param imageData  原始图片数据
     * @param direction  方向: left-左旋90度, right-右旋90度
     * @param currentAngle 当前角度
     * @return 旋转后的图片数据
     */
    public byte[] rotateImage(byte[] imageData, String direction, int currentAngle) throws IOException {
        int newAngle;

        switch (direction) {
            case "left":
                // 左旋 90 度
                newAngle = (currentAngle - 90 + 360) % 360;
                break;
            case "right":
                // 右旋 90 度
                newAngle = (currentAngle + 90) % 360;
                break;
            default:
                throw new IllegalArgumentException("不支持的旋转方向: " + direction);
        }

        return rotateImage(imageData, newAngle);
    }
}
