# 锦源生物数智化平台

## 启动项目

```bash
npm install
npm run dev
```

生产构建:

```bash
npm run build
```

## 环境变量

复制 `.env.example` 为 `.env.development` 或 `.env.production` 后修改:

```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://127.0.0.1:8080
VITE_DASHBOARD_DATA_URL=/api/dashboard/screen
VITE_CAMERA_PLAY_URL=/api/dashboard/cameras/{cameraId}/play-config
VITE_AUTH_TOKEN_KEY=token
VITE_AUTH_TOKEN_PREFIX=Bearer
VITE_DASHBOARD_REFRESH_MS=60000
VITE_CHART_REFRESH_MS=3200
VITE_CAMERA_REFRESH_MS=300000
```

说明:

- `VITE_USE_MOCK=true` 时前端读取 `public/mock/dashboard.json`
- `VITE_USE_MOCK=false` 时前端请求真实后端接口
- `VITE_CAMERA_PLAY_URL` 中必须包含 `{cameraId}` 占位符
- `VITE_AUTH_TOKEN_KEY` 会从 `localStorage` 或 `sessionStorage` 读取 token 并自动带到请求头

## 推荐后端接口

### 1. 大屏主数据

`GET /api/dashboard/screen`

返回结构:

```json
{
  "title": "锦源生物数智化平台",
  "weather": {
    "text": "晴",
    "temperature": "26°C",
    "humidity": "68%"
  },
  "overview": [
    {
      "badge": "产",
      "title": "计划生产量",
      "tag": "计划",
      "value": "860",
      "rate": "96%"
    }
  ],
  "marketCards": [
    {
      "title": "本月签约",
      "value": "128",
      "delta": "+12%"
    }
  ],
  "channelDynamics": [
    {
      "name": "商超渠道",
      "value": 38
    }
  ],
  "orderStatus": [
    {
      "title": "待排产",
      "value": "18"
    }
  ],
  "monitor": {
    "switchLabel": "切换监控",
    "emptyMessage": "暂无摄像头配置",
    "message": "播放失败，请检查设备及客户端网络",
    "activeCameraId": "cam-1",
    "cameras": [
      {
        "id": "cam-1",
        "label": "JY-001",
        "name": "提取车间 1 号位",
        "area": "提取工段 / A 区",
        "online": true,
        "accessToken": "",
        "url": "",
        "template": "simple",
        "message": "播放失败，请检查设备及客户端网络",
        "statusTags": ["在线", "主监控"]
      }
    ]
  },
  "processes": [
    {
      "title": "提取工序",
      "timeline": ["21:31:21", "21:31:24", "21:31:27"],
      "metrics": [
        { "label": "温度", "value": "60.94°C" }
      ],
      "series": [
        {
          "name": "温度",
          "color": "#f0be46",
          "data": [73, 72, 70]
        }
      ]
    }
  ]
}
```

### 2. 摄像头播放参数

`GET /api/dashboard/cameras/{cameraId}/play-config`

返回结构:

```json
{
  "id": "cam-1",
  "accessToken": "你的萤石 accessToken",
  "url": "ezopen://open.ys7.com/...",
  "template": "simple",
  "message": "播放失败，请检查设备及客户端网络",
  "statusTags": ["在线", "主监控"]
}
```

## 已实现能力

- Vue 3 + Vite 单页大屏
- Pinia 统一管理大屏数据和监控状态
- Axios 支持真实接口和 mock 双模式
- ECharts 渲染右侧工序趋势图
- EZUIKit 支持多摄像头切换与播放参数刷新
- 支持定时刷新大屏数据和定时刷新摄像头流地址
