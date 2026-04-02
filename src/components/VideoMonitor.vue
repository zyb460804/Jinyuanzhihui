<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps({
  monitor: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  refreshing: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["select-camera", "refresh-camera"]);
const playerId = "jinyuan-ezuikit-player";
const statusText = ref("");
let playerInstance = null;
let EZUIKitModule = null;

const activeCamera = computed(() => props.monitor.activeCamera || null);
const canPlay = computed(() => Boolean(activeCamera.value?.accessToken && activeCamera.value?.url));

function destroyPlayer() {
  if (playerInstance?.stop) {
    playerInstance.stop();
  }
  if (playerInstance?.destroy) {
    playerInstance.destroy();
  }
  playerInstance = null;
}

async function initPlayer() {
  await nextTick();
  destroyPlayer();
  statusText.value = activeCamera.value?.message || props.monitor.message || "";

  if (!activeCamera.value) {
    statusText.value = props.monitor.emptyMessage || "暂无摄像头配置";
    return;
  }

  if (!canPlay.value) {
    return;
  }

  try {
    if (!EZUIKitModule) {
      EZUIKitModule = await import("ezuikit-js");
    }

    playerInstance = new EZUIKitModule.default.EZUIKitPlayer({
      id: playerId,
      accessToken: activeCamera.value.accessToken,
      url: activeCamera.value.url,
      template: activeCamera.value.template || "simple",
      audio: 0,
      autoplay: true,
      width: "100%",
      height: "100%",
      handleSuccess: () => {
        statusText.value = "";
      },
      handleError: () => {
        statusText.value = activeCamera.value?.message || props.monitor.message || "播放器初始化失败";
      },
    });
  } catch (error) {
    statusText.value = error?.message || activeCamera.value?.message || props.monitor.message || "播放器初始化失败";
  }
}

onMounted(() => {
  initPlayer();
});

watch(
  () => ({
    activeCameraId: props.monitor.activeCameraId,
    accessToken: activeCamera.value?.accessToken,
    url: activeCamera.value?.url,
    template: activeCamera.value?.template,
    message: activeCamera.value?.message,
  }),
  () => {
    initPlayer();
  },
  { deep: true },
);

onBeforeUnmount(() => {
  destroyPlayer();
});
</script>

<template>
  <section class="center-column">
    <div class="monitor-toolbar">
      <div class="switch-chip">{{ monitor.switchLabel }}</div>
      <div class="camera-list">
        <button
          v-for="camera in monitor.cameras"
          :key="camera.id"
          type="button"
          class="camera-pill"
          :class="{ 'camera-pill-active': camera.id === monitor.activeCameraId }"
          @click="emit('select-camera', camera.id)"
        >
          <span class="camera-pill-dot" :class="{ 'camera-pill-dot-offline': camera.online === false }"></span>
          <span>{{ camera.label }}</span>
        </button>
      </div>
      <el-button
        class="camera-refresh-btn"
        size="small"
        type="primary"
        plain
        :loading="refreshing"
        @click="emit('refresh-camera')"
      >
        刷新流地址
      </el-button>
    </div>

    <div class="video-title">
      <span>{{ activeCamera?.label || "未选择监控" }}</span>
      <span>{{ activeCamera?.name || "" }}</span>
    </div>
    <div class="video-subtitle">
      <span>{{ activeCamera?.area || "未配置区域" }}</span>
      <div class="video-tags">
        <el-tag
          v-for="tag in activeCamera?.statusTags || []"
          :key="`${activeCamera?.id}-${tag}`"
          class="metric-tag"
          size="small"
          effect="plain"
        >
          {{ tag }}
        </el-tag>
      </div>
    </div>
    <div class="video-frame">
      <div v-if="loading" class="video-loading-mask">
        <el-skeleton animated>
          <template #template>
            <el-skeleton-item variant="rect" style="width: 88%; height: 78%;" />
          </template>
        </el-skeleton>
      </div>
      <div :id="playerId" class="video-canvas"></div>
      <div v-if="statusText" class="video-placeholder">{{ statusText }}</div>
    </div>
  </section>
</template>
