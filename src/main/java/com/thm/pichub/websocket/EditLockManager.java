package com.thm.pichub.websocket;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 编辑锁管理器
 * 控制图片只能一人编辑
 */
@Slf4j
@Component
public class EditLockManager {

    /**
     * 图片编辑锁映射
     * Key: 图片ID, Value: 编辑锁
     */
    private final Map<Long, EditLock> editLocks = new ConcurrentHashMap<>();

    /**
     * 尝试获取编辑锁
     *
     * @param imageId   图片ID
     * @param userId    用户ID
     * @param userName  用户名
     * @param sessionId WebSocket会话ID
     * @return true-获取成功, false-已被占用
     */
    public boolean tryLock(Long imageId, Long userId, String userName, String sessionId) {
        synchronized (this) {
            EditLock lock = editLocks.get(imageId);

            // 如果没有锁或未锁定，允许获取
            if (lock == null || !lock.isEditing()) {
                lock = new EditLock(userId, userName, sessionId);
                editLocks.put(imageId, lock);
                log.info("用户 {}({}) 成功获取图片 {} 的编辑锁", userName, userId, imageId);
                return true;
            }

            // 如果已经被锁定，检查是否是同一用户
            if (lock.getSessionId().equals(sessionId)) {
                log.info("用户 {}({}) 已拥有图片 {} 的编辑锁", userName, userId, imageId);
                return true;
            }

            log.info("图片 {} 的编辑权被用户 {}({}) 占用，拒绝",
                    imageId, lock.getEditorName(), lock.getEditorId());
            return false;
        }
    }

    /**
     * 释放编辑锁
     *
     * @param imageId 图片ID
     */
    public void unlock(Long imageId) {
        synchronized (this) {
            EditLock lock = editLocks.get(imageId);
            if (lock != null) {
                log.info("释放图片 {} 的编辑锁，编辑者: {}({})",
                        imageId, lock.getEditorName(), lock.getEditorId());
                editLocks.remove(imageId);
            }
        }
    }

    /**
     * 检查会话是否是图片的编辑者，如果是则释放锁
     *
     * @param sessionId WebSocket会话ID
     */
    public void autoUnlockOnDisconnect(String sessionId) {
        synchronized (this) {
            for (Map.Entry<Long, EditLock> entry : editLocks.entrySet()) {
                EditLock lock = entry.getValue();
                if (lock.isEditing() && sessionId.equals(lock.getSessionId())) {
                    Long imageId = entry.getKey();
                    log.info("检测到编辑者 异常断开，自动释放图片 {} 的编辑锁", imageId);
                    editLocks.remove(imageId);
                    break;
                }
            }
        }
    }

    /**
     * 获取图片的编辑锁
     *
     * @param imageId 图片ID
     * @return 编辑锁，不存在则返回null
     */
    public EditLock getEditLock(Long imageId) {
        return editLocks.get(imageId);
    }

    /**
     * 检查图片是否正在被编辑
     *
     * @param imageId 图片ID
     * @return true-正在编辑, false-未编辑
     */
    public boolean isEditing(Long imageId) {
        EditLock lock = editLocks.get(imageId);
        return lock != null && lock.isEditing();
    }

    /**
     * 检查会话是否是图片的编辑者
     *
     * @param imageId   图片ID
     * @param sessionId 会话ID
     * @return true-是编辑者, false-不是编辑者
     */
    public boolean isEditor(Long imageId, String sessionId) {
        EditLock lock = editLocks.get(imageId);
        return lock != null && lock.isEditing() && sessionId.equals(lock.getSessionId());
    }

    /**
     * 获取图片当前编辑者ID
     *
     * @param imageId 图片ID
     * @return 编辑者ID，如果没有编辑者则返回null
     */
    public Long getEditorId(Long imageId) {
        EditLock lock = editLocks.get(imageId);
        if (lock != null && lock.isEditing()) {
            return lock.getEditorId();
        }
        return null;
    }
}
