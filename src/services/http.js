import axios from "axios";
import { runtimeConfig } from "../config/runtime";

const http = axios.create({
  baseURL: runtimeConfig.apiBaseUrl,
  timeout: 10000,
});

http.interceptors.request.use((config) => {
  const localToken = window.localStorage.getItem(runtimeConfig.authTokenKey)
    || window.sessionStorage.getItem(runtimeConfig.authTokenKey)
    || "";
  const envToken = import.meta.env.VITE_API_TOKEN || "";
  const token = envToken || localToken;

  if (token) {
    config.headers.Authorization = `${runtimeConfig.authTokenPrefix} ${token}`.trim();
  }

  return config;
});

http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error?.response?.data?.message || error?.message || "请求失败";
    return Promise.reject(new Error(message));
  },
);

export default http;
