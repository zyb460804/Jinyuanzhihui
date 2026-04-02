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

          <section class="screen-panel market-panel">
            <div class="panel-title">市场看板</div>
            <div class="summary-cards">
              <article
                v-for="item in panelData.marketCards"
                :key="item.title"
                class="summary-card"
              >
                <span>{{ item.title }}</span>
                <strong>{{ item.value }}</strong>
                <em>{{ item.delta }}</em>
              </article>
            </div>

            <div class="section-caption">
              <span>渠道动态</span>
              <span>本周</span>
            </div>

            <div class="progress-list">
              <div
                v-for="item in panelData.channelDynamics"
                :key="item.name"
                class="progress-row"
              >
                <span>{{ item.name }}</span>
                <div class="progress-track">
                  <i :style="{ width: `${item.value}%` }"></i>
                </div>
                <strong>{{ item.value }}%</strong>
              </div>
            </div>
          </section>

          <section class="screen-panel status-panel">
            <div class="section-caption section-caption-compact">
              <span>订单状态</span>
              <span>实时</span>
            </div>
            <div class="status-grid">
              <article
                v-for="item in panelData.orderStatus"
                :key="item.title"
                class="status-item"
              >
                <span>{{ item.title }}</span>
                <strong>{{ item.value }}</strong>
              </article>
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
