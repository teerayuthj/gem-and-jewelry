# ประกาศราคาออมทอง — สรุป endpoint ที่มีจริง + สิ่งที่ควรเพิ่ม

ตรวจจาก API prod (`api-price.ausiris.co.th`) และ source `~/WorkSpace/realtime-price`
เมื่อ 18 ก.ย. 2569 · กติกาในเอกสารนี้คือสิ่งที่ `gold-saving-daily.js` ใช้จริง

---

## 1. endpoint และ contract ที่ใช้

| endpoint | ให้อะไร |
|---|---|
| `GET /api/v1/gold-saving?date=YYYY-MM-DD` | บริบทของวันนั้น — `effective_price` คือราคาปิดที่บันทึกล่าสุด ณ วันที่ขอ |
| `GET /api/v1/gold-saving/monthly?month=YYYY-MM&amount=N` | สรุปเดือน — วันทำการ, ซื้อไปแล้วกี่วัน, ทองสะสม, ต้นทุนเฉลี่ย, แผน 4 ยอด |
| `GET /api/v1/gold-saving/history?month=YYYY-MM` | ราคาปิดรายวันที่บันทึกไว้ทั้งเดือน |
| `POST /api/v1/gold-saving` | แอดมินบันทึกราคาปิด (`price_date`, `buyback_price`, `selling_price`) |

CORS สะท้อน Origin ทุกค่า (ทดสอบแล้ว: `www.ausiris.co.th`, `localhost:8080`, `null` จาก `file://`)
→ component เรียกตรงจากหน้า AEM ได้ ไม่ต้องมี proxy

ตัวอย่าง `GET /api/v1/gold-saving` หลังเพิ่ม contract ราคาที่ใช้แสดง:

```json
{
  "requested_date": "2026-09-18",
  "effective_price": { "price_date": "2026-09-17", "buyback_price": 67900, "selling_price": 68100 },
  "effective_price_time": "17:00",
  "reference_buyback_price": 67900,
  "reference_selling_price": 68100,
  "reference_time": "2026-09-18 08:31:20",
  "purchase_status": "waiting_close_price",
  "is_purchase_day": true,
  "latest_price_is_carried_forward": true,
  "unit": "THB/1 Bath Gold",
  "purity": "96.5%",
  "entry": null,
  "latest_price": { "price_date": "2026-09-17", "buyback_price": 67900, "selling_price": 68100,
                    "association_buyback_price": 67900, "association_selling_price": 68100,
                    "saved_at": 1789694033, "updated_at": 1789694033 }
}
```

ความหมายของราคา — **กติกา frontend ใหม่ไม่อิงเวลาปัจจุบัน**

| field | คืออะไร | การใช้บน frontend |
|---|---|---|
| `reference_buyback/selling_price` | ราคาสมาคมสด ณ วินาทีที่เรียก (จาก feed `G965B`) | **ไม่ใช้บนหน้าลูกค้า** |
| `entry` | ราคาปิดของ "วันที่ขอ" ที่บันทึกลง `gold_saving_daily_prices` แล้ว | ใช้เมื่อมี record ของวันนั้น |
| `latest_price` | ราคาปิดล่าสุดที่มีในระบบ ณ วันที่ขอ | fallback สำหรับ API เวอร์ชันเดิม |
| `effective_price` | ค่าเดียวกับราคาบันทึกล่าสุดที่ frontend ต้องใช้ | **ใช้แสดงและคำนวณเสมอ** |
| `effective_price_time` | เวลาอ้างอิงทางธุรกิจของ record | `17:00` ตายตัว ไม่ใช่เวลาปัจจุบันหรือ `saved_at` |

`purchase_status` มี 5 ค่า (`handlers/gold_saving.rs:159`):
`weekend` · `purchased` (มี entry) · `missing` (วันทำการที่ผ่านมาแล้วแต่ไม่มี entry) ·
`waiting_close_price` (วันนี้ ยังไม่มี entry) · `pending` (วันในอนาคต)

## 2. ราคาปิดถูกบันทึกเมื่อไหร่

1. **17:20 น. จ.–ศ. อัตโนมัติ** — `scheduler::start_gold_saving_daily_close_scheduler`
   (`src/scheduler/mod.rs:191`, เปิดใน `src/main.rs:171`) อ่าน feed สมาคม 96.5%
   ตรวจว่า timestamp เป็นของวันนี้และไม่เก่ากว่า 17:00 ถ้ายังไม่สดจะวนเช็กใหม่ทุก 30 วินาที
   และ **ไม่เขียนทับ** แถวที่มีอยู่แล้ว (`insert_gold_saving_daily_price_if_absent`)
2. **แอดมิน POST** — ใช้แก้กรณี feed ผิด/ล่ม แอดมินที่บันทึกก่อน 17:20 จะชนะ scheduler

→ ฝั่งหน้าเว็บจึงเชื่อได้ว่า "มี `entry` = ปิดยอดแล้ว" เสมอ ไม่ต้องสนว่าใครบันทึก

## 3. กติกาที่ component ใช้ (map API → สถานะบนจอ)

หน้าเว็บเลือก `effective_price || entry || latest_price` และไม่อ่าน `reference_*` เพื่อเลือก/คำนวณราคา

| สถานะบนจอ | เงื่อนไข | ราคาที่ใช้ |
|---|---|---|
| `saved` | `effective_price.price_date = requested_date` | record ที่บันทึกของวันนั้น |
| `carried` | วันทำการแต่ยังไม่มี record ของวันใหม่ | record ล่าสุด เช่น ราคาของเมื่อวาน หรือราคาวันศุกร์ในเช้าวันจันทร์ |
| `weekend` | `is_purchase_day = false` | record วันศุกร์ล่าสุด |
| `missing` | ยังไม่มี record ในฐานข้อมูลเลย | ไม่แสดงราคา และไม่ fallback ไป realtime |

**เสาร์–อาทิตย์ API รองรับอยู่แล้ว** — ทดสอบจริง `?date=2026-09-19` และ `2026-09-20`
คืน `purchase_status: "weekend"`, `is_purchase_day: false`, `latest_price_is_carried_forward: true`
และ `latest_price` = ราคาปิดวันทำการล่าสุด (วันศุกร์) ให้เอง จึงไม่ต้องยิง `?date=<วันศุกร์>` แยก

วันจันทร์ก่อนมี record ใหม่ API ยังคืนราคาวันศุกร์; ทันทีที่ POST ราคาวันจันทร์แล้ว
`effective_price.price_date` จะกลายเป็นวันจันทร์โดยไม่ต้องใช้เวลา browser ตัดสินใจ

กติกาการแสดงวันที่ (ใช้ทั้ง A / B / C):

- **วันที่ตัวใหญ่ = วันที่ของ record ราคาเสมอ** ไม่ใช่วันที่ปฏิทินหรือเวลาปัจจุบัน
  เสาร์ 19 ก.ย. ที่แสดงราคาปิดวันศุกร์ → พาดหัวต้องเป็น "วันศุกร์ ที่ 18 กันยายน 2569"
- ถ้าราคาไม่ใช่ของวันนี้ ต่อท้ายด้วยชิปเล็ก ๆ ว่า `วันนี้ เสาร์ 19 ก.ย. 69 · ใช้ราคาวันศุกร์`
  (หรือ `· รอราคาบันทึกของวันใหม่`) — ไม่ต้องมีบรรทัดเตือนซ้ำใต้การ์ดราคาอีก
- เวลาแสดงเป็น `17:00 น.` ตายตัวจาก `effective_price_time`
- ใช้หัวคอลัมน์ "ทองที่ได้ต่อวัน" เสมอ เพื่อไม่ผูกกับเวลาปัจจุบัน

สูตรคำนวณ (ตรงกับฝั่ง Rust `daily_allocations` / `calculate_plan`):

```
วันทำการ          = eligible_purchase_days (จันทร์–ศุกร์ ทั้งเดือน ไม่หักวันหยุดนักขัตฤกษ์)
ซื้อทองวันละ      = floor(ยอดออม × 100 / วันทำการ) / 100
ทองที่ซื้อได้ต่อวัน = round(ซื้อทองวันละ / ราคาขายออก, 6)
ทองที่ได้ทั้งเดือน  = round(ยอดออม / ราคาขายออก, 6)
```

ตรวจแล้วตรงกับรูปต้นแบบทุกตัว: 1,000 → 45.45 / 0.000668 / 0.014706 และ 3,000 → 136.36 / 0.002005 / 0.044118 (ที่ราคาขายออก 68,000)

## 4. ช่องว่างของ endpoint ที่ควรแก้ (เรียงตามความคุ้ม)

| ลำดับ | เรื่อง | ปัญหาที่เกิดวันนี้ | ข้อเสนอ |
|---|---|---|---|
| 1 | ไม่มีร่องรอยว่าใครบันทึกราคาปิด | แสดงไม่ได้ว่า "ปิดอัตโนมัติ" หรือ "แอดมินยืนยัน" และตรวจย้อนหลังไม่ได้ | เพิ่มคอลัมน์ `source` (`association_close` / `admin`) + `observed_at` ของ feed |
| 2 | `missing_days` นับวันที่ระบบยังไม่เคยเก็บข้อมูล | ก.ย. 2569 มีราคาปิดแค่ 16–17 ก.ย. → `monthly` รายงาน `missing_days: 11` เหมือนระบบล่ม 11 วัน | เพิ่ม `first_recorded_date` (หรือ `tracking_started_at`) แล้วแยก "ไม่ได้ติดตาม" ออกจาก "ขาดราคาปิด" |
| 3 | `calculations` ตรึงไว้ 4 ยอด (1k/2k/5k/10k) | ยอดที่ลูกค้ากรอกเองไม่มีแถวคำนวณ ต้องคิดที่ client (มีแต่ `initial_daily_amount`) | เพิ่ม `requested_plan` ของ `amount` ที่ส่งมา |
| 4 | เวลาเป็น string ไม่ใช่ ISO8601 / `saved_at` เป็น unix | `reference_time = "2026-09-18 08:31:20"` ไม่มี offset · `saved_at` ของ 17 ก.ย. เป็น 18 ก.ย. 08:13 (บันทึกย้อนหลัง) ทำให้แยก "เวลาราคา" กับ "เวลาบันทึก" ยาก | ส่ง ISO8601 `+07:00` และเพิ่ม `observed_at` แยกจาก `saved_at` |
| 5 | ไม่มี `Cache-Control` / `ETag` | ทุก request วิ่งถึง origin (header มีแต่ `x-cache-status`) | ก่อน cutoff `max-age=60` · หลัง settled `max-age=3600` + `ETag` |

ข้อ 1–3 คุ้มที่สุด และทำได้เลยโดยไม่ต้องรอข้อมูลสะสม

## 5. สิ่งที่ยังต้องตัดสินใจ

- **วันหยุดนักขัตฤกษ์** — `eligible_purchase_days` นับจันทร์–ศุกร์ล้วน ถ้าตลาดปิดวันหยุดราชการ
  วันนั้นจะกลายเป็น `missing` และจำนวน "วันทำการ" ที่โฆษณาไว้ (22 วัน) จะไม่ตรงกับที่ซื้อได้จริง
- **ยอดออมของลูกค้าจริง** — ตอนนี้ทุก endpoint คิดจาก `amount` ที่ส่งมาใน query
  ยังไม่มีการผูกกับบัญชีลูกค้า component จึงเป็น "เครื่องคำนวณ" ไม่ใช่ "พอร์ตของฉัน"
