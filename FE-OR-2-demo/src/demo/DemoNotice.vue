<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import { getDemoWarning, resetDemo } from "./api.js";
const warning = ref(getDemoWarning());
const receive = (event) => {
  warning.value = event.detail;
};
onMounted(() => window.addEventListener("demo-storage-warning", receive));
onBeforeUnmount(() =>
  window.removeEventListener("demo-storage-warning", receive)
);
function reset() {
  if (
    window.confirm(
      "คืนค่าข้อมูลตัวอย่าง? บอร์ด งาน สถานะ และผู้ร่วมงานที่เพิ่มใน demo นี้จะถูกล้าง"
    )
  ) {
    resetDemo();
    location.reload();
  }
}
</script>
<template>
  <aside class="demo-notice" aria-label="ข้อมูลโหมดจำลอง">
    <span
      ><strong>DEMO</strong> ใช้หน้าจอเดิม · Login: <b>demo / demo</b> ·
      ข้อมูลอยู่ในเบราว์เซอร์</span
    >
    <button @click="reset">คืนค่าตัวอย่าง</button>
    <span v-if="warning" class="demo-warning" role="alert">{{ warning }}</span>
  </aside>
</template>
<style scoped>
.demo-notice {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
  background: #f4efff;
  border-top: 1px solid #dcd1ed;
  color: #57447b;
  padding: 8px 12px;
  font: 12px/1.6 system-ui, sans-serif;
}
.demo-notice strong {
  font-size: 10px;
  background: #e4d8f5;
  border-radius: 4px;
  padding: 3px 6px;
  margin-right: 6px;
}
.demo-notice button {
  text-decoration: underline;
  white-space: nowrap;
}
.demo-warning {
  color: #9a4728;
  width: 100%;
  text-align: center;
}
@media (max-width: 600px) {
  .demo-notice {
    font-size: 10px;
    gap: 5px 12px;
  }
}
</style>
