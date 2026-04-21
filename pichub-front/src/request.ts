import axios from "axios";

const request = axios.create({
  baseURL: "http://localhost:8080/",
  timeout: 10000,
  withCredentials: true,
});

request.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 处理认证失败 (401)
    if (error.response && error.response.status === 401) {
      // 清除本地存储的用户信息
      localStorage.removeItem("loginUser");
      // 跳转到登录页
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default request;
