export const runtimeConfig = {
  useMock: import.meta.env.VITE_USE_MOCK !== "false",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "/",
  dashboardDataUrl: import.meta.env.VITE_DASHBOARD_DATA_URL || "/api/dashboard/screen",
  cameraPlayUrlTemplate: import.meta.env.VITE_CAMERA_PLAY_URL || "/api/dashboard/cameras/{cameraId}/play-config",
  authTokenKey: import.meta.env.VITE_AUTH_TOKEN_KEY || "token",
  authTokenPrefix: import.meta.env.VITE_AUTH_TOKEN_PREFIX || "Bearer",
  dashboardRefreshMs: Number(import.meta.env.VITE_DASHBOARD_REFRESH_MS || 60000),
  chartRefreshMs: Number(import.meta.env.VITE_CHART_REFRESH_MS || 3200),
  cameraRefreshMs: Number(import.meta.env.VITE_CAMERA_REFRESH_MS || 300000),
};

export function buildCameraPlayUrl(cameraId) {
  return runtimeConfig.cameraPlayUrlTemplate.replace("{cameraId}", encodeURIComponent(cameraId));
}
