<script setup>
defineProps({
  header: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <header class="topbar">
    <div class="topbar-side">
      <span>{{ header.date }}</span>
      <span>{{ header.time }}</span>
    </div>
    <div class="title-frame">
      <h1>{{ header.title }}</h1>
    </div>
    <div class="topbar-side topbar-side-right">
      <span>天气 <strong>{{ header.weather.text }}</strong></span>
      <span>温度 <strong>{{ header.weather.temperature }}</strong></span>
      <span>湿度 <strong>{{ header.weather.humidity }}</strong></span>
    </div>
  </header>
</template>
