<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import ScreenHeader from "./components/ScreenHeader.vue";
import TrendPanel from "./components/TrendPanel.vue";
import VideoMonitor from "./components/VideoMonitor.vue";
import { useDashboardStore } from "./stores/dashboard";

const dashboardStore = useDashboardStore();
const {
  data,
  loading,
  error,
  header,
  monitorLoading,
  monitorRefreshing,
  monitorView,
} = storeToRefs(dashboardStore);
const starsRef = ref(null);
const resizeHandlers = [];
const stars = [];
let rafId = 0;

const panelData = computed(() => data.value);

function initStars() {
  const canvas = starsRef.value;
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars.length = 0;
    const total = Math.floor((canvas.width * canvas.height) / 13000);
    for (let i = 0; i < total; i += 1) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.6 + 0.2,
        speed: Math.random() * 0.26 + 0.03,
        alpha: Math.random() * 0.5 + 0.18,
      });
    }
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach((star) => {
      star.alpha += (Math.random() - 0.5) * 0.03;
      star.y += star.speed;
      if (star.y > canvas.height + 4) {
        star.y = -2;
        star.x = Math.random() * canvas.width;
      }
      const alpha = Math.max(0.12, Math.min(star.alpha, 0.85));
      ctx.beginPath();
      ctx.fillStyle = `rgba(223, 250, 255, ${alpha})`;
      ctx.shadowColor = "rgba(52,245,255,0.55)";
      ctx.shadowBlur = 10;
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
    rafId = window.requestAnimationFrame(render);
  }

  resize();
  render();
  window.addEventListener("resize", resize);
  resizeHandlers.push(() => window.removeEventListener("resize", resize));
}

onMounted(async () => {
  await dashboardStore.fetchDashboard();
  dashboardStore.startRuntime();
  initStars();
});

onBeforeUnmount(() => {
  dashboardStore.stopRuntime();
  resizeHandlers.forEach((dispose) => dispose());
  if (rafId) {
    window.cancelAnimationFrame(rafId);
  }
});
</script>

<template>
  <div class="screen-root">
    <canvas ref="starsRef" class="star-layer"></canvas>

    <!-- Premium background -->
    <div class="bg-premium">
      <div class="bg-orb bg-orb-1"></div>
      <div class="bg-orb bg-orb-2"></div>
      <div class="bg-orb bg-orb-3"></div>
      <div class="bg-vignette"></div>
    </div>

    <div class="screen-shell">
      <ScreenHeader :header="header" />
      <el-alert
        v-if="error"
        :title="error"
        type="error"
        :closable="false"
        class="dashboard-alert"
      />

      <main class="dashboard-layout" v-loading="loading">
        <aside class="left-column">
          <section class="screen-panel overview-panel">
            <div class="panel-title">锦源概况</div>
            <div class="overview-grid">
              <article
                v-for="item in panelData.overview"
                :key="item.title"
                class="info-card"
              >
                <div class="info-card-head">
                  <span class="icon-badge">{{ item.badge }}</span>
                  <span>{{ item.title }}</span>
                  <el-tag class="small-tag" size="small" effect="plain">{{ item.tag }}</el-tag>
                </div>
                <div class="info-card-value">{{ item.value }}</div>
                <div class="info-card-foot">
                  <span>运行指标</span>
                  <strong>{{ item.rate }}</strong>
                </div>
              </article>
            </div>
          </section>

          <section class="screen-panel notification-panel">
            <div class="panel-title">通知提示</div>
            <div class="notification-list">
              <div class="notification-item">
                <span class="notification-dot notification-dot-online"></span>
                <span class="notification-label">在岗人员检测</span>
                <span class="notification-value">64人</span>
              </div>
              <div class="notification-item">
                <span class="notification-dot notification-dot-progress"></span>
                <span class="notification-label">任务完成情况</span>
                <div class="notification-progress">
                  <div class="notification-progress-bar" style="width: 78%"></div>
                </div>
                <span class="notification-value">78%</span>
              </div>
              <div class="notification-item">
                <span class="notification-dot notification-dot-data"></span>
                <span class="notification-label">数据分析</span>
                <span class="notification-status">正常</span>
              </div>
              <div class="notification-item">
                <span class="notification-dot notification-dot-warning"></span>
                <span class="notification-label">风险提示</span>
                <span class="notification-status warning">低压</span>
              </div>
              <div class="notification-item">
                <span class="notification-dot notification-dot-device"></span>
                <span class="notification-label">设备使用</span>
                <span class="notification-value">18/24</span>
              </div>
            </div>
          </section>

          <section class="screen-panel inspection-panel">
            <div class="panel-title">监测检验报告</div>
            <div class="inspection-content">
              <div class="inspection-section">
                <div class="inspection-section-title">实时质检数据</div>
                <div class="inspection-grid">
                  <div class="inspection-item">
                    <span class="inspection-label">PH值</span>
                    <span class="inspection-value">7.2</span>
                  </div>
                  <div class="inspection-item">
                    <span class="inspection-label">浊度</span>
                    <span class="inspection-value">0.8NTU</span>
                  </div>
                  <div class="inspection-item">
                    <span class="inspection-label">纯度</span>
                    <span class="inspection-value">99.2%</span>
                  </div>
                  <div class="inspection-item">
                    <span class="inspection-label">密度</span>
                    <span class="inspection-value">1.05</span>
                  </div>
                </div>
              </div>
              <div class="inspection-section">
                <div class="inspection-section-title">质量控制</div>
                <div class="quality-status">
                  <div class="quality-item">
                    <span class="quality-label">原料检验</span>
                    <span class="quality-badge quality-pass">合格</span>
                  </div>
                  <div class="quality-item">
                    <span class="quality-label">过程检验</span>
                    <span class="quality-badge quality-pass">合格</span>
                  </div>
                  <div class="quality-item">
                    <span class="quality-label">成品检验</span>
                    <span class="quality-badge quality-pass">合格</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </aside>

        <VideoMonitor
          :monitor="monitorView"
          :loading="monitorLoading"
          :refreshing="monitorRefreshing"
          @select-camera="dashboardStore.switchCamera"
          @refresh-camera="dashboardStore.refreshCameraSource"
        />

        <aside class="right-column">
          <TrendPanel
            v-for="process in panelData.processes"
            :key="process.title"
            :process="process"
          />
        </aside>
      </main>
    </div>
  </div>
</template>
