# ITBKK — Demo Version

**Repository นี้เป็นเวอร์ชัน Demo สำหรับสาธิตและทดลองใช้งาน IT-Bangmod Kradan Kanban** โดยคัดลอก Frontend เดิมจาก `FE-OR-2` และปรับให้ใช้ข้อมูลจำลองในเบราว์เซอร์ ใช้งานได้โดยไม่ต้องมี Backend, Database หรือ Docker

Frontend สำหรับรันและ Deploy อยู่ใน **[`FE-OR-2-demo`](FE-OR-2-demo/)**

## ทดลองบนเครื่อง

```sh
cd FE-OR-2-demo
npm ci
npm run dev
```

เปิด URL ที่ Vite แสดง แล้ว Login ด้วย **Username `demo` / Password `demo`**

ทดลองสร้างบอร์ด เพิ่ม/แก้ไข/ลบงาน จัดการสถานะและย้ายงานก่อนลบสถานะ เปลี่ยน Public/Private และจัดการผู้ร่วมงานพร้อมสิทธิ์ READ/WRITE ได้ผ่านหน้าจอเดิม

ข้อมูลบันทึกใน `localStorage` เฉพาะเบราว์เซอร์/origin นี้ ไม่แชร์ข้ามผู้ใช้งาน การ Login สิทธิ์ และผู้ร่วมงานเป็นการจำลอง ไม่มีการส่งอีเมลหรือเชื่อมต่อบัญชีจริง ปุ่ม **คืนค่าตัวอย่าง** ด้านล่างใช้เริ่มทดลองใหม่ได้

## Deploy บน Vercel

Import repository นี้ใน Vercel และตั้งค่าดังนี้:

| การตั้งค่า | ค่า |
| --- | --- |
| Root Directory | **`FE-OR-2-demo`** |
| Framework Preset | `Vite` |
| Install Command | `CYPRESS_INSTALL_BINARY=0 npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Environment Variables | ไม่ต้องเพิ่ม |

จากนั้นกด **Deploy** และ Login ด้วย `demo / demo`

มี [`vercel.json`](FE-OR-2-demo/vercel.json) พร้อม install/build command และ SPA rewrite สำหรับเปิด URL ของบอร์ดโดยตรงและ Refresh หน้า โดยใช้แนวทางของ [Vercel สำหรับ Vite SPA](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas) Install command ข้าม Cypress binary ซึ่งไม่จำเป็นต่อการแสดง Demo

ดูรายละเอียดข้อมูลจำลอง วิธีทดสอบ และข้อจำกัดที่ [คู่มือ Demo](FE-OR-2-demo/README.md)

## ตรวจสอบก่อน Deploy

```sh
cd FE-OR-2-demo
npm run test:demo
npm run build
npm run preview
```

## สมาชิกโปรเจกต์ต้นฉบับ

- 63130500019 ชาญ ทองเจิม
- 65130500035 นัทธมน ทองคำอ้น
- 65130500068 รติกร ดำเกิงลัภนวณิช
- 65130500087 อนวัตร กรุดธูป
