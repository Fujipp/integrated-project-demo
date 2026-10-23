# ITBKK — Demo Version

**เวอร์ชันนี้สำหรับสาธิตและทดลองใช้งาน (Demo) เท่านั้น** คัดลอกหน้า Login, Board, Task, Status, Collaborator, CSS และ assets จาก Frontend เดิม `FE-OR-2` แล้วเปลี่ยนส่วนเรียก API ให้ใช้ข้อมูลจำลองในเบราว์เซอร์ ไม่ต้องมี Backend, Database หรือ Docker

## เริ่มใช้งาน

```sh
cd FE-OR-2-demo
npm ci
npm run dev
```

เปิด URL ที่ Vite แสดง (ปกติ http://localhost:5173) แล้ว Login:

- Username: `demo`
- Password: `demo`

ไม่ต้องมีไฟล์ `.env` หรือ API key

## Deploy Demo บน Vercel

1. ใน Vercel เลือก **Add New → Project** และ Import repository `Fujipp/integrated-project-demo`
2. ตั้ง **Root Directory เป็น `FE-OR-2-demo`** เพื่อเลือก Frontend เวอร์ชัน Demo
3. ตรวจสอบการตั้งค่าต่อไปนี้ แล้วกด **Deploy**

| การตั้งค่า | ค่า |
| --- | --- |
| Root Directory | **`FE-OR-2-demo`** |
| Framework Preset | `Vite` |
| Install Command | `CYPRESS_INSTALL_BINARY=0 npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Environment Variables | ไม่ต้องเพิ่ม |

ไฟล์ [`vercel.json`](vercel.json) กำหนด framework, install/build command และ output directory ไว้แล้ว Install command ข้ามการดาวน์โหลด Cypress binary เพราะการแสดง Demo ไม่ต้องใช้ชุดทดสอบ Cypress เดิม

มี SPA rewrite ไปยัง `index.html` เพื่อให้ Vue Router เปิด URL เช่น `/login` หรือ `/board/demo-board/task` โดยตรง และกด Refresh ได้ ตามแนวทางใน [Vercel: Vite SPA](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas)

หลัง Deploy ให้ Login ด้วย `demo / demo` ผู้เข้าชมแต่ละคนมีข้อมูลจำลองแยกกันตามเบราว์เซอร์และโดเมน การเปลี่ยนแปลงจาก localhost จะไม่ตามไปที่โดเมน Vercel

## สิ่งที่ทดลองได้จากหน้าจอเดิม

- Login / Sign out และกลับเข้าใช้งานต่อหลังรีเฟรช
- ดูบอร์ดส่วนตัว 2 บอร์ดและบอร์ดร่วม 2 บอร์ด
- สร้างและลบบอร์ด เปลี่ยน Private / Public
- ดูรายละเอียด เพิ่ม แก้ไข และลบงาน พร้อมชื่อ รายละเอียด ผู้รับผิดชอบ สถานะ และเวลาสร้าง/แก้ไข
- เรียงงานตามชื่อสถานะด้วยปุ่มหัวตาราง
- เพิ่ม แก้ไข และลบสถานะ พร้อมย้ายงานก่อนลบสถานะที่มีงานอยู่
- สถานะ No Status และ Done คงข้อจำกัดตาม UI เดิม
- เพิ่มผู้ร่วมงาน เปลี่ยน READ / WRITE ลบผู้ร่วมงาน และ Leave บอร์ดร่วม
- บอร์ด Team Project (WRITE) ใช้ทดลองแก้ไขงาน ส่วน Team Reference (READ) ใช้ทดลองสิทธิ์อ่านอย่างเดียว

ผู้ร่วมงานเป็นข้อมูลสมมติ อีเมลที่เพิ่มจะสร้างผู้ใช้จำลองในเครื่อง ไม่มีการส่งอีเมลหรือค้นหาผู้ใช้จริง Public / Private และสิทธิ์เป็นการจำลองในเบราว์เซอร์ ไม่ใช่ระบบแชร์หรือการยืนยันตัวตนจริง

## ข้อมูลจำลอง

ใช้ `localStorage` key `itbkk-fe-or2-demo-v1` โดยแยก session เป็น `itbkk-demo-jwtToken` และ `itbkk-demo-refreshToken` ข้อมูลยังอยู่หลังรีเฟรช และเป็นข้อมูลเฉพาะเบราว์เซอร์/origin นี้ ปุ่ม **คืนค่าตัวอย่าง** ที่แถบ DEMO ด้านล่างใช้ล้างการเปลี่ยนแปลง (มีการยืนยันก่อน)

หากอ่านข้อมูล workspace ที่เสียหายไม่ได้ ระบบเปิดชุดข้อมูลเริ่มต้นให้ใหม่ หากบันทึก workspace ไม่ได้จะแจ้งเตือนและใช้ข้อมูลในหน่วยความจำแทน

## ส่วนที่ปรับจากต้นฉบับ

- `src/demo/api.js`: adapter ที่คืนค่าแบบ fetch/Response ตาม contract เดิม แต่ไม่ส่ง network request
- stores, router และ Navbar: ใช้ adapter แทน API และใช้ session key แยกจากต้นฉบับ
- `src/main.js`: restore identity ก่อนเริ่ม router เพื่อให้ปุ่มและสิทธิ์ทำงานถูกต้องหลัง reload
- `src/demo/DemoNotice.vue`: แถบบอกบัญชี demo และปุ่มคืนค่าข้อมูล
- แก้ข้อผิดพลาดใน modal เดิม เช่น Cancel ต้องไม่ submit, คำอธิบายสถานะว่างแก้ไขได้ และแสดงข้อผิดพลาดเมื่อบันทึกไม่สำเร็จ
- เอา import Google Fonts ออกจากสำเนาเพื่อให้เปิดโดยไม่ต้องโหลดฟอนต์ภายนอก โดยใช้ fallback font ของ CSS เดิม
- ตั้งค่า Vite ให้รันที่ root และเอา proxy Backend ออกจากสำเนา

## ตรวจสอบและ build

```sh
npm run test:demo
npm run build
npm run preview
```

`test:demo` ทดสอบ local adapter ด้วย Node.js test runner รวม Login, permission, task CRUD, status transfer, collaborator, persistence และ recovery

ไฟล์สำหรับ deploy อยู่ใน `dist/` การโฮสต์บน Vercel ใช้ rewrite จาก `vercel.json` ที่เตรียมไว้ หากใช้ web server อื่นให้ตั้ง SPA fallback ไปยัง `index.html` เพื่อรองรับ Vue Router history และ URL ของบอร์ดโดยตรง

ชุด Cypress เดิมใน `cypress/e2e/release-*` ยังเก็บไว้ตามต้นฉบับ เป็นชุดทดสอบระบบที่มี Backend และไม่ได้ปรับให้ใช้กับ demo นี้ทั้งหมด
