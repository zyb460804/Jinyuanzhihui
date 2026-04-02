import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { runtimeConfig } from "../config/runtime";
import { fetchCameraPlayConfig, fetchDashboardPayload } from "../services/dashboard";

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatDateTime(date) {
  const week = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${week[date.getDay()]}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
  };
}

function cloneProcesses(processes = []) {
  return processes.map((item) => ({
    ...item,
    series: item.series.map((series) => ({
      ...series,
      data: [...series.data],
    })),
  }));
}

function mergeCamera(camera = {}, patch = {}) {
  return {
    ...camera,
    ...patch,
    metrics: patch.metrics || camera.metrics || [],
    statusTags: patch.statusTags || camera.statusTags || [],
  };
}

export const useDashboardStore = defineStore("dashboard", () => {
  const loading = ref(false);
  const error = ref("");
  const monitorLoading = ref(false);
  const monitorRefreshing = ref(false);
  const now = ref(formatDateTime(new Date()));
  const data = ref({
    title: "锦源生物数智化平台",
    weather: {
      text: "晴",
      temperature: "26°C",
      humidity: "68%",
    },
    overview: [],
    marketCards: [],
    channelDynamics: [],
    orderStatus: [],
    monitor: {
      switchLabel: "切换监控",
      emptyMessage: "暂无摄像头配置",
      message: "播放失败，请检查设备及客户端网络",
      activeCameraId: "",
      cameras: [],
    },
    processes: [],
  });

  let clockTimer = null;
  let chartTimer = null;
  let pollTimer = null;
  let cameraTimer = null;

  const header = computed(() => ({
    title: data.value.title,
    date: now.value.date,
    time: now.value.time,
    weather: data.value.weather,
  }));

  const activeCamera = computed(() => (
    data.value.monitor.cameras.find((item) => item.id === data.value.monitor.activeCameraId)
    || data.value.monitor.cameras[0]
    || null
  ));

  const monitorView = computed(() => ({
    switchLabel: data.value.monitor.switchLabel,
    emptyMessage: data.value.monitor.emptyMessage,
    message: data.value.monitor.message,
    activeCameraId: data.value.monitor.activeCameraId,
    cameras: data.value.monitor.cameras,
    activeCamera: activeCamera.value,
  }));

  function applyPayload(payload, keepCameraSelection = true) {
    const nextActiveCameraId = keepCameraSelection && data.value.monitor.activeCameraId
      ? data.value.monitor.activeCameraId
      : payload.monitor.activeCameraId;

    data.value = {
      ...payload,
      processes: cloneProcesses(payload.processes),
      monitor: {
        ...payload.monitor,
        activeCameraId: payload.monitor.cameras.some((item) => item.id === nextActiveCameraId)
          ? nextActiveCameraId
          : payload.monitor.activeCameraId,
      },
    };
  }

  async function fetchDashboard(options = {}) {
    const { silent = false } = options;

    if (!silent) {
      loading.value = true;
    }
    error.value = "";

    try {
      const payload = await fetchDashboardPayload();
      applyPayload(payload, true);

      if (!runtimeConfig.useMock && data.value.monitor.activeCameraId) {
        await refreshCameraSource({ silent: true });
      }
    } catch (err) {
      error.value = err.message || "数据加载失败";
    } finally {
      if (!silent) {
        loading.value = false;
      }
    }
  }

  function tickClock() {
    now.value = formatDateTime(new Date());
  }

  function refreshWeather() {
    if (!runtimeConfig.useMock) {
      return;
    }

    const minute = new Date().getMinutes();
    const weatherSet = ["晴", "多云", "晴间多云", "微风"];
    data.value.weather = {
      ...data.value.weather,
      text: weatherSet[minute % weatherSet.length],
      temperature: `${24 + (minute % 4)}°C`,
      humidity: `${63 + (minute % 8)}%`,
    };
  }

  function updateProcesses() {
    if (!runtimeConfig.useMock) {
      return;
    }

    data.value.processes = data.value.processes.map((process) => ({
      ...process,
      series: process.series.map((series, index) => {
        const nextData = [...series.data];
        nextData.shift();
        const lastValue = nextData[nextData.length - 1] ?? series.data[series.data.length - 1] ?? 0;
        const step = (Math.random() - 0.5) * (index === 0 ? 8 : 3);
        nextData.push(Number(Math.max(0, lastValue + step).toFixed(2)));
        return {
          ...series,
          data: nextData,
        };
      }),
    }));
  }

  async function refreshCameraSource(options = {}) {
    const { silent = false } = options;
    const camera = activeCamera.value;

    if (!camera || runtimeConfig.useMock) {
      return;
    }

    if (!silent) {
      monitorRefreshing.value = true;
    }

    try {
      const response = await fetchCameraPlayConfig(camera.id);
      if (!response) {
        return;
      }

      data.value.monitor.cameras = data.value.monitor.cameras.map((item) => (
        item.id === camera.id ? mergeCamera(item, response) : item
      ));
    } catch (err) {
      error.value = err.message || "监控播放参数刷新失败";
    } finally {
      if (!silent) {
        monitorRefreshing.value = false;
      }
    }
  }

  async function switchCamera(cameraId) {
    if (!cameraId || cameraId === data.value.monitor.activeCameraId) {
      return;
    }

    data.value.monitor.activeCameraId = cameraId;

    if (runtimeConfig.useMock) {
      return;
    }

    monitorLoading.value = true;
    try {
      await refreshCameraSource({ silent: true });
    } finally {
      monitorLoading.value = false;
    }
  }

  function startRuntime() {
    if (!clockTimer) {
      clockTimer = window.setInterval(() => {
        tickClock();
        refreshWeather();
      }, 1000);
    }

    if (runtimeConfig.useMock && !chartTimer) {
      chartTimer = window.setInterval(updateProcesses, runtimeConfig.chartRefreshMs);
    }

    if (!runtimeConfig.useMock && !pollTimer) {
      pollTimer = window.setInterval(() => {
        fetchDashboard({ silent: true });
      }, runtimeConfig.dashboardRefreshMs);
    }

    if (!runtimeConfig.useMock && !cameraTimer) {
      cameraTimer = window.setInterval(() => {
        refreshCameraSource({ silent: true });
      }, runtimeConfig.cameraRefreshMs);
    }
  }

  function stopRuntime() {
    if (clockTimer) {
      window.clearInterval(clockTimer);
      clockTimer = null;
    }
    if (chartTimer) {
      window.clearInterval(chartTimer);
      chartTimer = null;
    }
    if (pollTimer) {
      window.clearInterval(pollTimer);
      pollTimer = null;
    }
    if (cameraTimer) {
      window.clearInterval(cameraTimer);
      cameraTimer = null;
    }
  }

  return {
    data,
    error,
    loading,
    monitorLoading,
    monitorRefreshing,
    header,
    monitorView,
    fetchDashboard,
    refreshCameraSource,
    startRuntime,
    stopRuntime,
    switchCamera,
  };
});
