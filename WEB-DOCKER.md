# รัน Web + Backend (Docker) บนทุกเครื่อง

## สิ่งที่ถูกต้อง

1. **Backend + MySQL ใน Docker** (`docker-compose.yml`)  
   - Service `backend` map พอร์ต **`5001`** ไปที่เครื่อง host เช่น `localhost:5001`  
   - ไม่ต้องใส่ IP ใน repo — ใช้เครื่องไหนก็ได้ เปลี่ยนพอร์ตได้ด้วย `BACKEND_PORT` ใน `.env`

2. **Frontend (Expo Web)** รันบนเครื่องเดียวกับ Docker  
   - ไฟล์ `frontend/services/api.js` ให้ **Web** ใช้ **`http://localhost:5001`** อัตโนมัติ  
   - เบราว์เซอร์เรียก API ไปที่ host → ตรงกับพอร์ตที่ Docker forward มา

3. **CORS**  
   - Backend ใน `app.js` ใช้ `cors()` แล้ว — เรียกจาก `http://localhost:8081` (Expo web) ไป `http://localhost:5001` ได้

## ขั้นตอนแนะนำ

```bash
# ในโฟลเดอร์โปรเจกต์ — รัน DB + API
docker compose up --build -d
```

ตรวจว่า API ขึ้น: เปิด `http://localhost:5001/api/health`

```bash
# รัน Expo Web (อีกเทอร์มินัล)
cd frontend
npm install
npm run web
```

เปิด URL ที่ Expo แสดง (มักเป็น `http://localhost:8081`) — แอปจะเรียก API ไป **`http://localhost:5001`** เอง

## ถ้าเปลี่ยนพอร์ต backend

ใน `.env` ข้าง `docker-compose.yml`, ตั้ง:

```env
BACKEND_PORT=5001
```

และตั้งค่าให้ตรงกับ frontend:

- ตั้ง **`EXPO_PUBLIC_API_URL=http://localhost:5001`** ใน `frontend/.env`  
  หรือ  
- แก้ `app.json` → `expo.extra.apiBaseWeb` ให้ตรงพอร์ตนั้น

## มือถือจริง (ไม่ใช่เบราว์เซอร์บนเครื่อง dev)

`localhost` ในมือถือหมายถึงตัวมือถือเอง — ต้องชี้ IP เครื่องที่รัน backend:

สร้าง `frontend/.env`:

```env
EXPO_PUBLIC_API_URL=http://YOUR_PC_LAN_IP:5001
```

(ค่า IP ไม่ต้อง commit — ตั้งคนละเครื่องได้)

## สรุปสิ่งที่ผิดถ้าเคยทำ

- ใส่ **IP คงที่ (เช่น 192.168.x.x) ใน repo** → ทุกเครื่อง IP ไม่เหมือนกัน — **ลบออกแล้ว** ใช้ `localhost` สำหรับ Web + Docker บนเครื่องเดียวกัน
