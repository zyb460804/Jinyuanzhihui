import express from "express";
import cors from "cors";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 工具函数：生成时间轴
function generateTimeline(count = 10) {
  const now = new Date();
  const timeline = [];
  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3000);
    timeline.push(time.toTimeString().slice(0, 8));
  }
  return timeline;
}

// 生成随机数据（支持小数）
function randomData(length, min, max, decimals = 0) {
  return Array.from({ length }, () => {
    const value = Math.random() * (max - min) + min;
    return decimals > 0 ? Number(value.toFixed(decimals)) : Math.floor(value);
  });
}

// 天气数据缓存
let weatherCache = { data: null, timestamp: 0 };
const WEATHER_CACHE_MS = 10 * 60 * 1000; // 10分钟缓存

// 天气代码转中文
function weatherCodeToText(code) {
  const map = {
    0: "晴", 1: "大部晴", 2: "多云", 3: "阴",
    45: "雾", 48: "雾凇",
    51: "小毛毛雨", 53: "毛毛雨", 55: "大毛毛雨",
    61: "小雨", 63: "中雨", 65: "大雨",
    66: "冻雨", 67: "大冻雨",
    71: "小雪", 73: "中雪", 75: "大雪", 77: "雪粒",
    80: "阵雨", 81: "中阵雨", 82: "大阵雨",
    85: "小阵雪", 86: "大阵雪",
    95: "雷暴", 96: "雷暴冰雹", 99: "强雷暴冰雹",
  };
  return map[code] ?? "未知";
}

async function getWeather() {
  const now = Date.now();
  if (weatherCache.data && now - weatherCache.timestamp < WEATHER_CACHE_MS) {
    return weatherCache.data;
  }

  try {
    const url = "https://api.open-meteo.com/v1/forecast"
      + "?latitude=36.98&longitude=118.10"
      + "&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m"
      + "&timezone=Asia%2FShanghai";

    const res = await fetch(url);
    const json = await res.json();
    const c = json.current;

    weatherCache.data = {
      text: weatherCodeToText(c.weather_code),
      temperature: `${Math.round(c.temperature_2m)}°C`,
      humidity: `${c.relative_humidity_2m}%`,
    };
    weatherCache.timestamp = now;
    return weatherCache.data;
  } catch {
    return weatherCache.data || { text: "未知", temperature: "--°C", humidity: "--%" };
  }
}

// 生产概览数据
function getOverview() {
  const total = 860;
  const current = Math.floor(Math.random() * 100 + 400);
  return [
    {
      badge: "产",
      title: "计划生产量",
      tag: "计划",
      value: String(total),
      rate: `${Math.floor((current / total) * 100)}%`,
    },
    {
      badge: "单",
      title: "生产排单",
      tag: "检定",
      value: String(Math.floor(Math.random() * 20 + 10)),
      rate: `${Math.floor(Math.random() * 20 + 80)}%`,
    },
    {
      badge: "人",
      title: "当前在岗人员",
      tag: "人员",
      value: String(Math.floor(Math.random() * 30 + 50)),
      rate: `${Math.floor(Math.random() * 15 + 85)}%`,
    },
    {
      badge: "时",
      title: "已生产数量",
      tag: "产出",
      value: String(current),
      rate: `${Math.floor((current / total) * 100)}%`,
    },
  ];
}

// 市场数据
function getMarketCards() {
  return [
    {
      title: "本月签约",
      value: String(Math.floor(Math.random() * 50 + 100)),
      delta: `${Math.random() > 0.5 ? "+" : "-"}${Math.floor(Math.random() * 20)}%`,
    },
    {
      title: "核心客户",
      value: String(Math.floor(Math.random() * 20 + 30)),
      delta: `${Math.random() > 0.5 ? "+" : "-"}${Math.floor(Math.random() * 10)}`,
    },
    {
      title: "出货批次",
      value: String(Math.floor(Math.random() * 100 + 200)),
      delta: `${Math.random() > 0.5 ? "+" : "-"}${Math.floor(Math.random() * 30)}%`,
    },
  ];
}

// 渠道动态
function getChannelDynamics() {
  return [
    { name: "商超渠道", value: Math.floor(Math.random() * 20 + 30) },
    { name: "合作农贸", value: Math.floor(Math.random() * 15 + 20) },
    { name: "直营网点", value: Math.floor(Math.random() * 15 + 15) },
    { name: "线上订购", value: Math.floor(Math.random() * 10 + 10) },
  ];
}

// 订单状态
function getOrderStatus() {
  return [
    {
      title: "待排产",
      value: String(Math.floor(Math.random() * 20 + 10)).padStart(2, "0"),
    },
    {
      title: "配送中",
      value: String(Math.floor(Math.random() * 15 + 5)).padStart(2, "0"),
    },
    {
      title: "已完成",
      value: String(Math.floor(Math.random() * 50 + 50)).padStart(2, "0"),
    },
    {
      title: "异常单",
      value: String(Math.floor(Math.random() * 5)).padStart(2, "0"),
    },
  ];
}

// 摄像头数据
function getMonitor() {
  return {
    switchLabel: "切换监控",
    emptyMessage: "暂无摄像头配置",
    message: "播放失败，请检查设备及客户端网络",
    activeCameraId: "cam-1",
    cameras: [
      {
        id: "cam-1",
        label: "JY-001",
        name: "提取车间 1 号位",
        area: "提取工段 / A 区",
        online: true,
        accessToken: "",
        url: "",
        template: "simple",
        message: "播放失败，请检查设备及客户端网络",
        statusTags: ["在线", "主监控"],
      },
      {
        id: "cam-2",
        label: "JY-002",
        name: "酶解车间 2 号位",
        area: "酶解工段 / B 区",
        online: true,
        accessToken: "",
        url: "",
        template: "simple",
        message: "播放失败，请检查设备及客户端网络",
        statusTags: ["在线", "备用监控"],
      },
      {
        id: "cam-3",
        label: "JY-003",
        name: "过滤车间 3 号位",
        area: "过滤工段 / C 区",
        online: false,
        accessToken: "",
        url: "",
        template: "simple",
        message: "设备离线，暂无法播放",
        statusTags: ["离线", "待检修"],
      },
    ],
  };
}

// 工序数据
function getProcesses() {
  return [
    {
      title: "提取工序",
      timeline: generateTimeline(),
      metrics: [
        { label: "温度", value: `${(Math.random() * 20 + 55).toFixed(2)}°C` },
        { label: "压力", value: `${(Math.random() * 50 + 120).toFixed(2)}kPa` },
        { label: "液位", value: `${(Math.random() * 30 + 70).toFixed(2)}%` },
      ],
      series: [
        { name: "温度", color: "#f0be46", data: randomData(10, 55, 80) },
        { name: "压力", color: "#58f0a5", data: randomData(10, 15, 35) },
        { name: "液位", color: "#43e8f5", data: randomData(10, 3, 8, 1) },
      ],
    },
    {
      title: "酶解工序",
      timeline: generateTimeline(),
      metrics: [
        { label: "PH", value: (Math.random() * 2 + 6.5).toFixed(2) },
        { label: "温度", value: `${(Math.random() * 10 + 35).toFixed(2)}°C` },
        { label: "压力", value: `${(Math.random() * 50 + 150).toFixed(2)}kPa` },
        { label: "浓位", value: `${(Math.random() * 20 + 55).toFixed(2)}%` },
      ],
      series: [
        { name: "温度", color: "#f0be46", data: randomData(10, 60, 68) },
        { name: "压力", color: "#58f0a5", data: randomData(10, 18, 30) },
        { name: "浓位", color: "#43e8f5", data: randomData(10, 8, 14, 1) },
        { name: "PH", color: "#ff7ab6", data: randomData(10, 1, 3, 1) },
      ],
    },
    {
      title: "过滤工序",
      timeline: generateTimeline(),
      metrics: [{ label: "压力", value: `${(Math.random() * 40 + 50).toFixed(2)}kPa` }],
      series: [
        { name: "压力", color: "#f0be46", data: randomData(10, 30, 90, 1) },
      ],
    },
    {
      title: "精制工序",
      timeline: generateTimeline(),
      metrics: [
        { label: "PH", value: (Math.random() * 2 + 6).toFixed(2) },
        { label: "温度", value: `${(Math.random() * 20 + 45).toFixed(2)}°C` },
        { label: "浓度", value: `${(Math.random() * 20 + 70).toFixed(2)}%` },
      ],
      series: [
        { name: "温度", color: "#58f0a5", data: randomData(10, 70, 85) },
        { name: "浓度", color: "#43e8f5", data: randomData(10, 40, 50, 1) },
        { name: "PH", color: "#ff7ab6", data: randomData(10, 8, 10, 1) },
      ],
    },
    {
      title: "浓缩工序",
      timeline: generateTimeline(),
      metrics: [
        { label: "温度", value: `${(Math.random() * 20 + 65).toFixed(2)}°C` },
        { label: "压力", value: `${(Math.random() * 50 + 130).toFixed(2)}kPa` },
      ],
      series: [
        { name: "温度", color: "#f0be46", data: randomData(10, 65, 78) },
        { name: "压力", color: "#43e8f5", data: randomData(10, 10, 15, 1) },
      ],
    },
  ];
}

// API: 大屏主数据
app.get("/api/dashboard/screen", async (req, res) => {
  const weather = await getWeather();
  res.json({
    title: "锦源生物数智化平台",
    weather,
    overview: getOverview(),
    marketCards: getMarketCards(),
    channelDynamics: getChannelDynamics(),
    orderStatus: getOrderStatus(),
    monitor: getMonitor(),
    processes: getProcesses(),
  });
});

// API: 摄像头播放配置
app.get("/api/dashboard/cameras/:cameraId/play-config", (req, res) => {
  const { cameraId } = req.params;

  // 实际项目中这里应该从数据库或设备获取真实配置
  // 这里返回模拟配置，实际使用时需要替换为真实设备商（萤石云等）的配置
  res.json({
    cameraId,
    accessToken: "mock-access-token",
    playUrl: "",
    expireTime: Date.now() + 3600000,
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Dashboard server running at http://localhost:${PORT}`);
}).on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Please stop the process or change the port.`);
  } else {
    console.error(`Server error: ${err.message}`);
  }
  process.exit(1);
});
