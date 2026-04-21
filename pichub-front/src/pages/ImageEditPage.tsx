import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getImageStatusUsingGet } from "@/api/imageEditController";
import { useUser } from "@/contexts/UserContext";
import {
  useWebSocketEditor,
  WsMessage,
  EditLockStatus,
  User,
  Message,
  WsMessageType,
} from "@/hooks/useWebSocketEditor";
import "./ImageEditPage.css";

interface PictureVO {
  id?: number;
  name?: string;
  url?: string;
  thumbnailUrl?: string;
  category?: string;
  tags?: string;
  introduction?: string;
  picSize?: number;
  picFormat?: string;
}

// 消息类型图标映射
const MESSAGE_ICONS: Record<string, string> = {
  JOIN: "👋",
  LEAVE: "🚪",
  START_EDIT: "✏️",
  ROTATE: "🔄",
  SAVE: "💾",
  REJECT: "❌",
  AUTO_UNLOCK: "⚠️",
  EDIT_EXIT: "✋",
};

export default function ImageEditPage() {
  const navigate = useNavigate();
  const { pictureId } = useParams<{ pictureId: string }>();
  const location = useLocation();
  const { loginUser } = useUser();

  const [picture, setPicture] = useState<PictureVO | null>(null);
  const [loading, setLoading] = useState(true);

  // 编辑状态
  const [isEditing, setIsEditing] = useState(false);
  const [isCurrentEditor, setIsCurrentEditor] = useState(false);
  const [editorName, setEditorName] = useState<string>("");
  const [rotationAngle, setRotationAngle] = useState(0);
  const [saving, setSaving] = useState(false);

  // 消息和用户
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [showToast, setShowToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // 记录已处理的消息ID，防止重复添加
  const processedMessageIdsRef = useRef<Set<string>>(new Set());

  // 记录是否已经加入过频道
  const hasJoinedRef = useRef(false);

  const ws = useWebSocketEditor({
    userId: loginUser?.id || 0,
    userName: loginUser?.userName || "",
    imageId: Number(pictureId),
    onMessage: handleWsMessage,
    onConnected: () => {
      console.log("WebSocket connected");
    },
    onDisconnected: () => {
      console.log("WebSocket disconnected");
    },
  });

  // 从路由状态获取图片信息（从列表页传递）
  useEffect(() => {
    const passedPicture = location.state as { picture?: PictureVO };
    if (passedPicture?.picture) {
      setPicture(passedPicture.picture);
      setLoading(false);
    }
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

  // 获取图片详细信息
  useEffect(() => {
    const fetchPicture = async () => {
      if (!pictureId) return;
      setLoading(true);
      try {
        const res = await getImageStatusUsingGet({ imageId: Number(pictureId) });
        if (res.code === 0 && res.data) {
          const status = res.data as EditLockStatus;
          setIsEditing(status.editing || false);
          setEditorName(status.editorName || "");
          setIsCurrentEditor(status.editorId === loginUser?.id);
          setRotationAngle(status.angle || 0);

          if (status.editing && status.editorId !== loginUser?.id) {
            addMessage(
              "SYSTEM",
              `当前图片正在被 ${status.editorName} 编辑中`
            );
          }
        }
      } catch (err) {
        console.error("获取图片状态失败", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPicture();
  }, [pictureId, loginUser]);

  // 图片ID变化时重置加入状态
  useEffect(() => {
    hasJoinedRef.current = false;
  }, [pictureId]);

  // WebSocket 连接成功后加入频道
  useEffect(() => {
    if (ws.isConnected && pictureId && loginUser && !hasJoinedRef.current) {
      hasJoinedRef.current = true;
      ws.joinChannel(Number(pictureId));
    }
  }, [ws.isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  // 页面卸载或刷新时自动退出编辑模式
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 如果当前是编辑者，需要先退出编辑模式
      if (isCurrentEditor && isEditing && pictureId) {
        console.log('🔄 页面即将卸载，准备退出编辑模式');

        // 提示用户有未保存的更改
        e.preventDefault();
        e.returnValue = '';

        // 使用 sendBeacon 同步发送请求，不等待响应
        try {
          const url = '/api/image/edit/unlock?imageId=' + String(pictureId);
          navigator.sendBeacon(url, '');
          console.log('✅ 已发送退出编辑请求（beforeunload）');
        } catch (err) {
          console.error('❌ 发送退出编辑请求失败:', err);
        }
      }
    };

    const handleVisibilityChange = () => {
      // 当页面隐藏时也执行退出逻辑（适用于移动端切换应用等场景）
      if (document.visibilityState === 'hidden' && isCurrentEditor && isEditing && pictureId) {
        console.log('🔄 页面已隐藏，准备退出编辑模式');
        try {
          const url = '/api/image/edit/unlock?imageId=' + String(pictureId);
          navigator.sendBeacon(url, '');
          console.log('✅ 已发送退出编辑请求（visibilitychange）');
        } catch (err) {
          console.error('❌ 发送退出编辑请求失败:', err);
        }
      }
    };

    // 定义退出编辑模式的函数
    const autoUnlock = () => {
      if (isCurrentEditor && isEditing && pictureId) {
        console.log('🔄 自动退出编辑模式（组件卸载）');
        try {
          const url = '/api/image/edit/unlock?imageId=' + String(pictureId);
          navigator.sendBeacon(url, '');
          console.log('✅ 已发送退出编辑请求（组件卸载）');
        } catch (err) {
          console.error('❌ 发送退出编辑请求失败:', err);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload, { capture: true });
    window.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      console.log('🔄 组件卸载，执行自动退出编辑逻辑');
      window.removeEventListener('beforeunload', handleBeforeUnload, { capture: true } as any);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      // 组件卸载时也执行退出逻辑（处理路由跳转）
      autoUnlock();
    };
  }, [isCurrentEditor, isEditing, pictureId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 添加消息（去重）
  const addMessage = useCallback((type: WsMessageType, content: string, userName?: string, messageId?: string) => {
    const actualMessageId = messageId || `${Date.now()}-${Math.random()}`;

    // 检查是否已处理过此消息
    if (processedMessageIdsRef.current.has(actualMessageId)) {
      return;
    }

    // 标记为已处理
    processedMessageIdsRef.current.add(actualMessageId);

    // 限制已处理消息集合大小
    if (processedMessageIdsRef.current.size > 1000) {
      const firstId = processedMessageIdsRef.current.keys().next().value;
      processedMessageIdsRef.current.delete(firstId);
    }

    const newMessage: Message = {
      id: actualMessageId,
      type,
      content,
      timestamp: Date.now(),
      userName,
    };
    setMessages((prev) => [newMessage, ...prev].slice(0, 50));
  }, []);

  // 处理 WebSocket 消息
  function handleWsMessage(message: WsMessage) {
    console.log('========== WebSocket Message ==========');
    console.log('Type:', message.type);
    console.log('UserId:', message.userId, 'LoginUser:', loginUser?.id);
    console.log('ImageId:', message.imageId, 'CurrentImageId:', pictureId);
    console.log('========================================');

    switch (message.type) {
      case "USER_LIST":
        // 收到在线用户列表
        if (message.userList && message.imageId === Number(pictureId)) {
          console.log('✅ USER_LIST 收到，用户数:', message.userList.length);

          // 从后端转换用户列表
          const users: User[] = message.userList.map(u => ({
            id: u.id ? Number(u.id) : 0,
            name: u.name || "未知用户",
            isMe: u.isMe || false,
            isEditor: u.isEditor || false,
          }));

          setOnlineUsers(users);

          // 如果有编辑者，更新编辑状态
          const editor = users.find(u => u.isEditor);
          if (editor) {
            setIsEditing(true);
            setIsCurrentEditor(editor.isMe);
            setEditorName(editor.name);
          } else {
            setIsEditing(false);
            setIsCurrentEditor(false);
            setEditorName("");
          }
        }
        break;

      case "JOIN":
        // 用户加入频道
        if (message.userId && message.userName && message.imageId === Number(pictureId)) {
          console.log('✅ JOIN 收到:', message.userName);
          const userId = Number(message.userId);
          const isMe = userId === Number(loginUser?.id);

          // 检查用户是否已存在，避免重复添加
          setOnlineUsers(prev => {
            const exists = prev.some(u => u.id === userId);
            if (exists) {
              return prev;
            }
            return [...prev, { id: userId, name: message.userName!, isMe, isEditor: false }];
          });

          // 添加系统消息（但不对自己显示）
          if (!isMe) {
            addMessage('JOIN', `${message.userName} 加入了查看`);
          }
        }
        break;

      case "LEAVE":
        // 用户离开频道
        if (message.userId && message.userName && message.imageId === Number(pictureId)) {
          console.log('✅ LEAVE 收到:', message.userName);
          addMessage('LEAVE', `${message.userName} 离开了查看`);

          // 从在线用户列表中移除
          setOnlineUsers(prev => prev.filter(u => u.id !== Number(message.userId)));
        }
        break;

      case "START_EDIT":
        if (message.userId && message.userName && message.imageId === Number(pictureId)) {
          console.log('✅ START_EDIT 收到');
          const amIEditor = Number(message.userId) === Number(loginUser?.id);
          setEditorName(message.userName);
          setIsEditing(true);
          setIsCurrentEditor(amIEditor);
          console.log('🔑 isCurrentEditor:', amIEditor);

          // 更新在线用户编辑状态
          setOnlineUsers((prev) =>
            prev.map(u => ({
              ...u,
              isEditor: Number(u.id) === Number(message.userId),
            }))
          );

          if (!amIEditor) {
            addMessage("START_EDIT", `${message.userName} 开始编辑`, message.userName);
          } else {
            addMessage("SYSTEM", "你已进入编辑模式");
          }
        }
        break;

      case "ROTATE":
        if (message.angle !== undefined && message.imageId === Number(pictureId)) {
          setRotationAngle(message.angle);
          addMessage("ROTATE", `图片旋转到 ${message.angle} 度`, message.userName);
        }
        break;

      case "SAVE":
        throw new Error("SAVE 消息已被 image_saved 替代");

      case "image_saved":
        // 收到图片保存通知（从后端广播的消息，在图片保存完成后发送）
        console.log('🎉 收到 image_saved 消息:', message);

        if (message.imageId && message.imageId === Number(pictureId)) {
          // 使用后端传来的URL，但添加时间戳强制刷新（因为是覆盖上传，URL不变）
          const baseUrl = message.fileUrl?.split('?')[0] || picture?.url?.split('?')[0] || '';
          const timestamp = Date.now();
          const newUrl = `${baseUrl}?t=${timestamp}`;
          const newThumbUrl = picture?.thumbnailUrl
            ? `${picture.thumbnailUrl.split('?')[0]}?t=${timestamp}`
            : newUrl;

          setPicture(prev => prev ? {
            ...prev,
            url: newUrl,
            thumbnailUrl: newThumbUrl
          } : null);

          console.log('📸 图片URL已从广播消息更新:', newUrl);

          // 清除旋转角度
          setRotationAngle(0);

          // 退出编辑模式
          setIsEditing(false);
          setIsCurrentEditor(false);
          setEditorName("");

          // 更新在线用户编辑状态
          setOnlineUsers((prev) =>
            prev.map(u => ({
              ...u,
              isEditor: false,
            }))
          );

          // 添加保存消息
          addMessage("SAVE", `${message.userName} 保存了图片`);

          // 显示更新提示
          showToastMsg("图片已更新", "success");
        }
        break;

      case "REJECT":
        if (message.imageId === Number(pictureId)) {
          showToastMsg("当前图片正在编辑中，请稍后再试", "error");
          addMessage("REJECT", "进入编辑模式被拒绝");
        }
        break;

      case "AUTO_UNLOCK":
        if (message.imageId === Number(pictureId)) {
          setIsEditing(false);
          setIsCurrentEditor(false);
          setEditorName("");
          setRotationAngle(0);
          setOnlineUsers((prev) =>
            prev.map(u => ({
              ...u,
              isEditor: false,
            }))
          );
          addMessage("AUTO_UNLOCK", "编辑者异常断开，编辑锁已释放");
          showToastMsg("编辑者异常断开，编辑锁已释放", "success");
        }
        break;

      case "EDIT_EXIT":
        // 编辑者退出编辑模式（不保存）
        if (message.imageId === Number(pictureId)) {
          setIsEditing(false);
          setIsCurrentEditor(false);
          setEditorName("");
          setRotationAngle(0);

          // 更新在线用户编辑状态
          setOnlineUsers((prev) =>
            prev.map(u => ({
              ...u,
              isEditor: false,
            }))
          );

          if (message.userName) {
            addMessage("EDIT_EXIT", `${message.userName} 退出了编辑模式`);
          }
        }
        break;
    }
  }

  // 获取当前编辑者ID
  const getEditorId = useCallback(() => {
    const editor = onlineUsers.find(u => u.isEditor);
    return editor?.id;
  }, [onlineUsers]);

  // 进入编辑模式
  const handleEnterEdit = () => {
    if (!pictureId || !ws.isConnected) {
      showToastMsg("连接中，请稍等...", "error");
      return;
    }
    ws.requestEdit(Number(pictureId));
  };

  // 旋转图片
  const handleRotate = (direction: "left" | "right") => {
    if (!isCurrentEditor) {
      showToastMsg("您不是此图片的编辑者", "error");
      return;
    }

    const newAngle = direction === "left"
      ? (rotationAngle - 90 + 360) % 360
      : (rotationAngle + 90) % 360;
    setRotationAngle(newAngle);
    ws.rotate(direction, Number(pictureId));
  };

  // 保存图片
  const handleSave = async () => {
    if (!isCurrentEditor) {
      showToastMsg("您不是此图片的编辑者", "error");
      return;
    }

    if (rotationAngle === 0) {
      showToastMsg("无需保存", "error");
      return;
    }

    if (!picture?.url) {
      showToastMsg("图片URL不存在", "error");
      return;
    }

    setSaving(true);

    try {
      // 使用 Canvas 旋转图片
      console.log('📸 开始旋转图片，角度:', rotationAngle, '原始URL:', picture.url);
      const rotatedBlob = await rotateImage(picture.url, rotationAngle);
      console.log('📸 Canvas旋转完成，Blob大小:', rotatedBlob.size);

      // 将Blob转换为File，使用正确的文件名
      const originalName = picture?.name || 'image.jpg';
      const cleanName = originalName.replace(/\.[^/.]+$/, '');
      const fileName = `${cleanName}.jpg`;
      const file = new File([rotatedBlob], fileName, { type: 'image/jpeg' });

      console.log('📸 准备上传文件:', fileName, '大小:', file.size);

      const { saveImageUsingPost } = await import("@/api/imageEditController");
      const res = await saveImageUsingPost(
        { imageId: Number(pictureId) },
        {},
        file
      ) as any;

      console.log('📸 保存响应:', res);

      if (res.code === 0) {
        // 后端保存成功
        console.log('✅ 后端保存成功，等待广播消息刷新图片');

        // 不在这里刷新图片，等待后端广播 image_saved 消息
        // 所有用户（包括编辑者）都通过 WebSocket 消息来刷新图片

        showToastMsg("保存成功", "success");
      } else {
        console.error('❌ 保存失败:', res);
        showToastMsg("保存失败", "error");
      }
    } catch (error) {
      console.error('❌ 保存异常:', error);
      showToastMsg("保存失败", "error");
    } finally {
      setSaving(false);
    }
  };

  // 使用 Canvas 旋转图片
  const rotateImage = async (imageSrc: string, angle: number): Promise<Blob> => {
    console.log('Canvas旋转开始, 角度:', angle);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // 根据旋转角度调整画布尺寸
        let newWidth = img.width;
        let newHeight = img.height;
        if (angle === 90 || angle === 270) {
          newWidth = img.height;
          newHeight = img.width;
        }

        canvas.width = newWidth;
        canvas.height = newHeight;

        // 旋转画布
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((angle * Math.PI) / 180);

        // 绘制图片
        ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create_blob"));
            }
          },
          "image/jpeg",
          0.9
        );
      };

      img.onerror = (e) => {
        console.error('图片加载失败:', e);
        reject(new Error("Failed to load image"));
      };
      img.src = imageSrc;
    });
  };

  // 退出编辑模式
  const handleLeaveEdit = async () => {
    if (!isCurrentEditor || !pictureId) {
      return;
    }

    setSaving(true);

    try {
      const { unlockEditUsingPost } = await import("@/api/imageEditController");
      const res = await unlockEditUsingPost({ imageId: Number(pictureId) }) as any;

      if (res.code === 0) {
        // 后端会广播 EDIT_EXIT 消息，前端会自动更新状态
        showToastMsg("已退出编辑模式", "success");
      } else {
        showToastMsg("退出失败", "error");
      }
    } catch (error) {
      console.error('❌ 退出编辑失败:', error);
      showToastMsg("退出失败", "error");
    } finally {
      setSaving(false);
    }
  };

  // 定义一个用于自动退出编辑模式的函数（不显示toast）
  const autoUnlockExit = async () => {
    if (!pictureId) {
      return;
    }

    try {
      const { unlockEditUsingPost } = await import("@/api/imageEditController");
      const res = await unlockEditUsingPost({ imageId: Number(pictureId) }) as any;

      if (res.code === 0) {
        console.log('✅ 自动退出编辑模式成功');
      }
    } catch (error) {
      console.error('❌ 自动退出编辑失败:', error);
    }
  };

  // 返回列表
  const handleBack = async () => {
    // 如果是编辑者，先退出编辑模式
    if (isCurrentEditor && isEditing) {
      await autoUnlockExit();
    }

    // 离开频道
    if (ws.isConnected) {
      ws.leaveChannel(Number(pictureId));
    }

    // 导航返回
    navigate(-1);
  };

  // 显示提示消息
  const showToastMsg = (text: string, type: "success" | "error") => {
    setShowToast({ text, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("zh-CN", { hour12: false });
  };

  if (loading) {
    return <div className="image-edit-page"><div className="loading">加载中...</div></div>;
  }

  return (
    <div className="image-edit-page">
      {/* 调试信息栏 */}
      <div className="debug-bar">
        <span>WS: {ws.isConnected ? "✅" : "❌"}</span>
        <span>|</span>
        <span>编辑中: {isEditing ? "✅" : "❌"}</span>
        <span>|</span>
        <span>我的编辑: {isCurrentEditor ? "✅" : "❌"}</span>
        <span>|</span>
        <span>角度: {rotationAngle}°</span>
      </div>

      {/* 连接状态 */}
      <div className="connection-status">
        {ws.isConnected ? (
          <span className="status-connected">✅ 已连接</span>
        ) : ws.isReconnecting ? (
          <span className="status-reconnecting">🔄 重新连接中...</span>
        ) : (
          <span className="status-disconnected">❌ 连接已断开</span>
        )}
      </div>

      {/* 头部 */}
      <header className="edit-header">
        <h1>{picture?.name || "图片编辑"}</h1>
        <button onClick={handleBack} className="back-btn">← 返回列表</button>
      </header>

      <div className="edit-content">
        {/* 主内容区 */}
        <div className="edit-main">
          {/* 图片预览 */}
          <div className="image-container">
            <img
              key={picture?.url}  // 使用 URL 作为 key，强制重新渲染
              src={picture?.url}
              alt={picture?.name}
              className="image-preview"
              style={{
                transform: `rotate(${rotationAngle}deg)`,
                transition: "transform 0.3s ease",
              }}
              onLoad={() => console.log('✅ 图片加载成功:', picture?.url)}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                console.error('❌ 图片加载失败:', picture?.url);
                target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="300" height="200" fill="%23e0e0e0"/><text x="150" y="100" text-anchor="middle" dy=".3em" fill="%23999">加载失败</text></svg>';
              }}
            />
          </div>

          {/* 操作区域 */}
          <div className="action-area">
            {!isEditing ? (
              <button onClick={handleEnterEdit} className="btn-large btn-primary" disabled={!ws.isConnected && !ws.isReconnecting}>
                ✏️ 进入编辑模式
              </button>
            ) : isCurrentEditor ? (
              <div className="editor-controls">
                <div className="control-title">编辑操作</div>
                <div className="rotation-buttons">
                  <button onClick={() => handleRotate("left")} className="btn-medium btn-secondary">← 左旋 90°</button>
                  <button onClick={() => handleRotate("right")} className="btn-medium btn-secondary">右旋 90° →</button>
                </div>
                <div className="action-buttons">
                  <button onClick={handleSave} className="btn-medium btn-primary" disabled={saving}>
                    💾 {saving ? "保存中..." : "保存"}
                  </button>
                  <button onClick={handleLeaveEdit} className="btn-medium btn-danger" disabled={saving}>
                    ✋ {saving ? "退出中..." : "退出编辑"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="waiting-message">✏️ <strong>{editorName}</strong> 正在编辑中</div>
            )}
          </div>
        </div>

        {/* 右侧：消息 */}
        <div className="edit-sidebar">
          {/* 在线用户 */}
          <div className="online-users">
            <div className="users-title">👤 在线用户 ({onlineUsers.length})</div>
            <div className="users-list">
              {onlineUsers.map((user) => (
                <div key={user.id} className="user-item">
                  {user.name}
                  {user.isMe && <span className="user-me">（我）</span>}
                  {user.isEditor && <span className="user-editor">✏️</span>}
                </div>
              ))}
            </div>
          </div>

          {/* 消息列表 */}
          <div className="message-panel">
            <div className="message-header">📝 系统消息</div>
            <div className="message-list">
              {messages.length === 0 ? (
                <div className="message-empty">暂无消息</div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="message-item">
                    <span className="message-icon">{MESSAGE_ICONS[msg.type] || "📌"}</span>
                    <span className="message-content">{msg.content}</span>
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast 提示 */}
      {showToast && (
        <div className={`toast toast-${showToast.type}`}>
          {showToast.text}
        </div>
      )}
    </div>
  );
}
