import http from "./http";
import { buildCameraPlayUrl, runtimeConfig } from "../config/runtime";

function withDefaults(payload = {}) {
  const monitor = payload.monitor || {};
  const cameras = Array.isArray(monitor.cameras) ? monitor.cameras : [];
  const activeCameraId = monitor.activeCameraId || cameras[0]?.id || "";

  return {
    title: payload.title || "锦源生物数智化平台",
    weather: {
      text: payload.weather?.text || "晴",
      temperature: payload.weather?.temperature || "26°C",
      humidity: payload.weather?.humidity || "68%",
    },
    overview: payload.overview || [],
    marketCards: payload.marketCards || [],
    channelDynamics: payload.channelDynamics || [],
    orderStatus: payload.orderStatus || [],
    monitor: {
      switchLabel: monitor.switchLabel || "切换监控",
      emptyMessage: monitor.emptyMessage || "暂无摄像头配置",
      message: monitor.message || "播放失败，请检查设备及客户端网络",
      activeCameraId,
      cameras,
    },
    processes: payload.processes || [],
  };
}

export async function fetchDashboardPayload() {
  const url = runtimeConfig.useMock ? "/mock/dashboard.json" : runtimeConfig.dashboardDataUrl;
  const payload = await http.get(url);
  return withDefaults(payload);
}

export async function fetchCameraPlayConfig(cameraId) {
  if (!cameraId || runtimeConfig.useMock) {
    return null;
  }

  return http.get(buildCameraPlayUrl(cameraId));
}
