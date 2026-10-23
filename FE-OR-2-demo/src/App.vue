<script setup>
import DemoNotice from "./demo/DemoNotice.vue";
import { RouterView } from "vue-router";
import Toast from "./components/toast/ToastTemplate.vue";
import Bg_effect from "@/components/css/Background.vue";
</script>

<template>
  <div>
    <Toast />
    <Bg_effect />
    <RouterView />
    <DemoNotice />

  </div>
</template>

<style scoped></style>
