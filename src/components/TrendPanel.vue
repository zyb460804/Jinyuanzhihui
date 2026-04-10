<script setup>
import * as echarts from "echarts";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps({
  process: {
    type: Object,
    required: true,
  },
});

const chartRef = ref(null);
let chart = null;

const option = computed(() => ({
  animationDuration: 500,
  grid: {
    left: 6,
    right: 6,
    top: 18,
    bottom: 10,
    containLabel: false,
  },
  tooltip: {
    trigger: "axis",
    backgroundColor: "rgba(6, 28, 53, 0.95)",
    borderColor: "rgba(52,245,255,0.35)",
    textStyle: {
      color: "#dffcff",
    },
  },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: props.process.timeline,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false },
    splitLine: { show: false },
  },
  yAxis: {
    type: "value",
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false },
    splitLine: {
      show: true,
      lineStyle: {
        color: "rgba(135, 201, 216, 0.12)",
        type: "dashed",
      },
    },
  },
  series: props.process.series.map((series, index) => ({
    type: "line",
    name: series.name,
    data: series.data,
    smooth: 0.35,
    symbol: "none",
    lineStyle: {
      width: 2,
      color: series.color,
      shadowBlur: 10,
      shadowColor: series.color,
    },
    areaStyle: index === 0 ? {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: `${series.color}55` },
        { offset: 1, color: `${series.color}00` },
      ]),
    } : undefined,
  })),
}));

function renderChart() {
  if (!chartRef.value) {
    return;
  }
  if (!chart) {
    chart = echarts.init(chartRef.value);
  }
  chart.setOption(option.value, true);
}

function handleResize() {
  chart?.resize();
}

onMounted(async () => {
  await nextTick();
  renderChart();
  window.addEventListener("resize", handleResize);
});

watch(
  () => props.process,
  async () => {
    await nextTick();
    renderChart();
  },
  { deep: true },
);

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  chart?.dispose();
  chart = null;
});
</script>

<template>
  <section class="chart-panel">
    <div class="chart-head">
      <span>{{ process.title }}</span>
      <div class="metrics">
        <el-tag
          v-for="metric in process.metrics"
          :key="`${process.title}-${metric.label}`"
          class="metric-tag"
          size="small"
          effect="plain"
        >
          {{ metric.label }} {{ metric.value }}
        </el-tag>
      </div>
    </div>
    <div ref="chartRef" class="trend-chart"></div>
    <div class="chart-axis">
      <span>{{ process.timeline[0] }}</span>
      <span>{{ process.timeline[process.timeline.length - 1] }}</span>
    </div>
    <div class="chart-footer">
      <span class="data-time">数据采集时间: {{ process.timeline[0] }} ~ {{ process.timeline[process.timeline.length - 1] }}</span>
    </div>
  </section>
</template>
