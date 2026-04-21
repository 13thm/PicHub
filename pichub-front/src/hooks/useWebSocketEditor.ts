// @ts-ignore
/* eslint-disable */
import { useRef, useCallback, useState, useEffect } from 'react';

// 用户信息
export interface User {
  id: number;
  name: string;
  isMe: boolean;
  isEditor: boolean;
}

// WebSocket 消息类型
export type WsMessageType =
  | 'USER_LIST'
  | 'JOIN'
  | 'LEAVE'
  | 'START_EDIT'
  | 'ROTATE'
  | 'SAVE'
  | 'image_saved'
  | 'REJECT'
  | 'AUTO_UNLOCK'
  | 'EDIT_EXIT'
  | 'SYSTEM';

// WebSocket 消息
export interface WsMessage {
  type: WsMessageType;
  userId?: number;
  userName?: string;
  imageId?: number;
  angle?: number;
  message?: string;
  timestamp?: number;
  userList?: User[];
  fileUrl?: string;  // 文件URL，用于图片保存后广播新URL
}

// WebSocket 请求
export interface WsRequest {
  action: 'join' | 'leave' | 'edit' | 'rotate' | 'save';
  userId: number;
  userName: string;
  imageId: number;
  direction?: 'left' | 'right';
}

// 编辑锁状态
export interface EditLockStatus {
  imageId: number;
  editing: boolean;
  editorId?: number;
  editorName?: string;
  angle: number;
}

// 消息项
export interface Message {
  id: string;
  type: WsMessageType;
  content: string;
  timestamp: number;
  userName?: string;
}

interface UseWebSocketEditorOptions {
  userId: number;
  userName: string;
  imageId: number;
  onMessage?: (message: WsMessage) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Event) => void;
}

export const useWebSocketEditor = (options: UseWebSocketEditorOptions) => {
  const { userId, userName, imageId, onMessage, onConnected, onDisconnected, onError } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueueRef = useRef<WsRequest[]>([]);

  // 获取WebSocket URL
  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const hostname = window.location.hostname;
    // 开发环境使用 8080 端口，生产环境使用当前端口
    const port = import.meta.env.DEV ? '8080' : window.location.port;
    const wsUrl = `${protocol}//${hostname}:${port}/api/ws/image-edit`;
    console.log('WebSocket URL:', wsUrl);
    return wsUrl;
  }, []);

  // 保存连接配置到 ref
  const configRef = useRef({ getWebSocketUrl, onConnected, onDisconnected, onError, onMessage, userId, userName });

  // 更新配置
  useEffect(() => {
    configRef.current = { getWebSocketUrl, onConnected, onDisconnected, onError, onMessage, userId, userName };
  }, [getWebSocketUrl, onConnected, onDisconnected, onError, onMessage, userId, userName]);

  // 内部连接函数，使用 ref 避免循环依赖
  const performConnect = useCallback((delay = 0) => {
    // 清除之前的定时器
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const connectNow = () => {
      // 如果已经连接，不重复连接
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        console.log('WebSocket already connected');
        return;
      }

      const { getWebSocketUrl, onConnected, onDisconnected, onError, onMessage } = configRef.current;
      const wsUrl = getWebSocketUrl();
      console.log('Connecting to WebSocket:', wsUrl);

      try {
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          setIsReconnecting(false);
          reconnectAttemptsRef.current = 0;

          // 发送心跳
          if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
          }
          heartbeatIntervalRef.current = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'ping' }));
              console.log('Sent ping');
            }
          }, 30000);

          // 发送队列中的消息
          while (messageQueueRef.current.length > 0) {
            const msg = messageQueueRef.current.shift();
            if (msg && wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify(msg));
              console.log('Sent queued message:', msg);
            }
          }

          onConnected?.();
        };

        wsRef.current.onmessage = (event) => {
          try {
            const message: WsMessage = JSON.parse(event.data);
            console.log('Received message:', message);
            onMessage?.(message);
          } catch (parseError) {
            console.error('Failed to parse message:', parseError, 'Data:', event.data);
          }
        };

        wsRef.current.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason, event.wasClean);
          setIsConnected(false);
          onDisconnected?.();

          // 自动重连
          // 指数退避重连: 1s, 2s, 5s, 10s
          const delays = [1000, 2000, 5000, 10000];
          const nextDelay = delays[Math.min(reconnectAttemptsRef.current, delays.length - 1)];

          console.log(`Reconnecting in ${nextDelay}ms...`);
          setIsReconnecting(true);
          reconnectAttemptsRef.current++;

          performConnect(nextDelay);
        };

        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          onError?.(error);
        };

      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        onError?.(error as Event);
      }
    };

    if (delay > 0) {
      reconnectTimeoutRef.current = setTimeout(connectNow, delay);
    } else {
      connectNow();
    }
  }, []); // 空依赖数组，内部使用 ref

  // 连接WebSocket
  const connect = useCallback(() => {
    performConnect(0);
  }, [performConnect]);

  // 断开连接
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsReconnecting(false);
    reconnectAttemptsRef.current = 0;
    messageQueueRef.current = [];
  }, []);

  // 发送消息
  const send = useCallback((request: WsRequest) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = JSON.stringify(request);
      console.log('Sending message:', message);
      wsRef.current.send(message);
    } else {
      // 如果不在连接状态，将消息加入队列
      console.log('WebSocket not connected, queuing message:', request);
      messageQueueRef.current.push(request);
    }
  }, []);

  // 加入频道
  const joinChannel = useCallback((imgId?: number) => {
    const { userId, userName } = configRef.current;
    const targetImageId = imgId !== undefined ? imgId : imageId;
    send({
      action: 'join',
      userId,
      userName,
      imageId: targetImageId,
    });
  }, [imageId, send]);

  // 离开频道
  const leaveChannel = useCallback((imgId?: number) => {
    const { userId, userName } = configRef.current;
    const targetImageId = imgId !== undefined ? imgId : imageId;
    send({
      action: 'leave',
      userId,
      userName,
      imageId: targetImageId,
    });
  }, [imageId, send]);

  // 请求编辑
  const requestEdit = useCallback((imgId?: number) => {
    const { userId, userName } = configRef.current;
    const targetImageId = imgId !== undefined ? imgId : imageId;
    send({
      action: 'edit',
      userId,
      userName,
      imageId: targetImageId,
    });
  }, [imageId, send]);

  // 旋转图片
  const rotate = useCallback((direction: 'left' | 'right', imgId?: number) => {
    const { userId, userName } = configRef.current;
    const targetImageId = imgId !== undefined ? imgId : imageId;
    send({
      action: 'rotate',
      userId,
      userName,
      imageId: targetImageId,
      direction,
    });
  }, [imageId, send]);

  // 保存图片
  const save = useCallback((imgId?: number) => {
    const { userId, userName } = configRef.current;
    const targetImageId = imgId !== undefined ? imgId : imageId;
    send({
      action: 'save',
      userId,
      userName,
      imageId: targetImageId,
    });
  }, [imageId, send]);

  // 组件挂载时连接
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    isReconnecting,
    connect,
    disconnect,
    send,
    joinChannel,
    leaveChannel,
    requestEdit,
    rotate,
    save,
  };
};
