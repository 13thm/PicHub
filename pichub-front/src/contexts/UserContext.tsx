// ============================================
// 用户全局状态管理 - Context 实现
// 作用：在 React 组件树中共享登录用户信息，并自动同步到 localStorage
// ============================================

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ============================================
// 1. 类型定义（TypeScript 接口）
// ============================================

/**
 * 登录用户数据对象
 * 对应后端返回的用户信息字段，都是可选的（?）表示可能不存在
 */
interface LoginUserVO {
  id?: number;           // 用户唯一标识
  userAccount?: string;  // 登录账号
  userName?: string;     // 显示昵称
  userAvatar?: string;   // 头像 URL
  userProfile?: string;  // 个人简介
  userRole?: string;     // 角色：user/admin
}

/**
 * Context 提供的值类型
 * 包含：当前用户数据、设置用户的函数、加载状态
 */
interface UserContextType {
  loginUser: LoginUserVO | null;                    // null 表示未登录
  setLoginUser: (user: LoginUserVO | null) => void; // 更新用户的函数
  loading: boolean;                                // 是否正在从 localStorage 恢复数据
}

// ============================================
// 2. 创建 Context
// ============================================

/**
 * 创建 Context 容器
 * 初始值为 undefined，用于检测是否在 Provider 外部使用
 */
const UserContext = createContext<UserContextType | undefined>(undefined);

// ============================================
// 3. Provider 组件（数据提供者）
// ============================================

/**
 * UserProvider: 包裹应用根组件，提供全局用户状态
 * 用法：<UserProvider><App /></UserProvider>
 *
 * @param children - 子组件（被包裹的应用内容）
 */
export function UserProvider({ children }: { children: ReactNode }) {

  // -----------------------------------------
  // 3.1 定义状态（State）
  // -----------------------------------------

  // loginUser: 当前登录用户，null 表示未登录
  const [loginUser, setLoginUser] = useState<LoginUserVO | null>(null);

  // loading: 是否正在从 localStorage 读取数据（防止闪屏）
  const [loading, setLoading] = useState(true);

  // -----------------------------------------
  // 3.2 副作用：页面加载时从 localStorage 恢复登录状态
  // -----------------------------------------

  useEffect(() => {
    // 尝试读取本地存储的用户信息
    const user = localStorage.getItem("loginUser");

    if (user) {
      // 解析并恢复登录状态（刷新页面后保持登录）
      setLoginUser(JSON.parse(user));
    }

    // 无论是否有用户，都结束加载状态
    setLoading(false);
  }, []); // 空依赖数组：只在组件挂载时执行一次

  // -----------------------------------------
  // 3.3 包装函数：更新用户 + 同步 localStorage
  // -----------------------------------------

  /**
   * handleSetLoginUser: 增强版的 setLoginUser
   *
   * 功能：
   * 1. 更新 React 状态（触发组件重新渲染）
   * 2. 同步到 localStorage（持久化，刷新不丢失）
   * 3. 登出时自动清理（传 null 则删除）
   *
   * @param user - 用户信息对象，或 null 表示登出
   */
  const handleSetLoginUser = (user: LoginUserVO | null) => {
    // 登录时：更新 React 状态 + 同步 localStorage
    if (user) {
      setLoginUser(user);
      localStorage.setItem("loginUser", JSON.stringify(user));
    } else {
      // 登出时：只清除 React 状态，不删除 localStorage（保留历史记录）
      setLoginUser(null);
      localStorage.setItem("lastLogoutUser", localStorage.getItem("loginUser") || "");
      localStorage.removeItem("loginUser");
    }
  };

  // -----------------------------------------
  // 3.4 渲染 Provider，向子组件提供数据
  // -----------------------------------------

  return (
      <UserContext.Provider
          value={{
            loginUser,                           // 当前用户数据（只读）
            setLoginUser: handleSetLoginUser,   // 注意：这里把包装函数传下去
            loading                              // 加载状态（用于显示 Loading）
          }}
      >
        {children}
      </UserContext.Provider>
  );
}

// ============================================
// 4. 自定义 Hook（方便使用）
// ============================================

/**
 * useUser: 获取用户状态的自定义 Hook
 *
 * 用法：
 * const { loginUser, setLoginUser, loading } = useUser();
 *
 * 安全机制：必须在 UserProvider 内部使用，否则抛错
 */
export function useUser() {
  // 从 Context 获取值
  const context = useContext(UserContext);

  // 防御性检查：防止在 Provider 外部使用导致 undefined
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }

  return context;
}

