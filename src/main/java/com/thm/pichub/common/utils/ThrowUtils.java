package com.thm.pichub.common.utils;

import com.thm.pichub.common.exception.BusinessException;
import com.thm.pichub.common.exception.ErrorCode;

/**
 * 抛出异常工具类
 */
public class ThrowUtils {

    /**
     * 如果条件成立，抛出异常
     */
    public static void throwIf(boolean condition, ErrorCode errorCode) {
        if (condition) {
            throw new BusinessException(errorCode);
        }
    }

    /**
     * 如果条件成立，抛出异常
     */
    public static void throwIf(boolean condition, ErrorCode errorCode, String message) {
        if (condition) {
            throw new BusinessException(errorCode, message);
        }
    }

    /**
     * 如果对象为空，抛出参数错误异常
     */
    public static <T> void throwIfNull(T obj, ErrorCode errorCode) {
        if (obj == null) {
            throw new BusinessException(errorCode);
        }
    }

    /**
     * 如果对象为空，抛出参数错误异常
     */
    public static <T> void throwIfNull(T obj, ErrorCode errorCode, String message) {
        if (obj == null) {
            throw new BusinessException(errorCode, message);
        }
    }
}
