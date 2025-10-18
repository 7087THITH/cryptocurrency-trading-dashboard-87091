# แหล่งข้อมูลและวิธีการดึงข้อมูล

## 1. อัตราแลกเปลี่ยน (Exchange Rates)

### แหล่งข้อมูล:

- **Exchange Rate API**: https://www.exchangerate-api.com/
- **API Endpoint**: https://api.exchangerate-api.com/v4/latest/{base_currency}
- **รองรับสกุลเงิน**: USD, THB, JPY, CNY และอื่นๆ กว่า 160 สกุล

### วิธีการดึงข้อมูล:

1. **Realtime Tab**:
   - ดึงข้อมูลจาก Exchange Rate API แบบ real-time
   - อัพเดททุก 5 วินาที
   - ไม่ต้องใช้ API Key สำหรับ basic usage
   - บันทึกเวลา: เวลาที่ API ส่งข้อมูลมา

2. **รายวัน / รายเดือน / รายปี Tab**:
   - ดึงค่าเฉลี่ยจากตาราง `historical_exchange_rates`
   - ใช้คอลัมน์: `daily_avg`, `weekly_avg`, `monthly_avg`, `yearly_avg`
   - บันทึกเวลา: ใช้ฟังก์ชัน `calculate_exchange_rate_averages()` คำนวณทุกวัน

### ตาราง:

- `historical_exchange_rates`: เก็บข้อมูลประวัติศาสตร์อัตราแลกเปลี่ยน
- คอลัมน์สำคัญ: `currency`, `exchange_rate`, `daily_avg`, `weekly_avg`, `monthly_avg`, `yearly_avg`

---

## 2. ราคาโลหะ LME (London Metal Exchange)

### แหล่งข้อมูล:

- **LME Official Prices**: https://www.lme.com/
- **Metal Price API**: https://www.metalpriceapi.com/
- **รองรับโลหะ**: CU (ทองแดง), AL (อลูมิเนียม), ZN (สังกะสี), PB (ตะกั่ว), NI (นิกเกิล), SN (ดีบุก)

### วิธีการดึงข้อมูล:

1. **Realtime Tab**:
   - ดึงข้อมูลจาก Metal Price API
   - อัพเดททุก 60 วินาที (free tier มี rate limit)
   - ต้องใช้ API Key (ฟรี 50 requests/เดือน)
   - บันทึกเวลา: เวลาที่ API ส่งข้อมูลมา

2. **รายวัน / รายเดือน / รายปี Tab**:
   - ดึงค่าเฉลี่ยจากตาราง `historical_lme_prices`
   - ใช้ Edge Function `scrape-lme-prices` ดึงข้อมูลจาก LME
   - บันทึกเวลา: ดึงข้อมูลทุกวันเวลา 09:00 UTC

### ตาราง:

- `historical_lme_prices`: เก็บข้อมูลราคา LME
- คอลัมน์สำคัญ: `metal`, `price_usd`, `data_date`, `making_date`

### เครื่องมือ:

- Edge Function: `scrape-lme-prices`
- Web Scraping จากเว็บไซต์ LME

---

## 3. ราคาโลหะ SHFE (Shanghai Futures Exchange)

### แหล่งข้อมูล:

- **SHFE Official**: http://www.shfe.com.cn/
- **Alternative API**: Quandl SHFE Data
- **รองรับโลหะ**: CU (ทองแดง), AL (อลูมิเนียม), ZN (สังกะสี)

### วิธีการดึงข้อมูล:

1. **Realtime Tab**:
   - ดึงข้อมูลจาก SHFE API ผ่าน proxy
   - อัพเดททุก 60 วินาที
   - ใช้ Edge Function เป็นตัวกลาง
   - บันทึกเวลา: เวลาของตลาด SHFE (CST+8)

2. **รายวัน / รายเดือน / รายปี Tab**:
   - ดึงค่าเฉลี่ยจากตาราง `historical_shfe_prices`
   - ใช้ Edge Function ดึงข้อมูลจาก SHFE
   - บันทึกเวลา: ดึงข้อมูลทุกวันหลังตลาดปิด

### ตาราง:

- `historical_shfe_prices`: เก็บข้อมูลราคา SHFE
- คอลัมน์สำคัญ: `metal`, `price_cny`, `price_usd`, `data_date`, `making_date`

### เครื่องมือ:

- Edge Function: สำหรับดึงข้อมูล SHFE
- แปลงสกุลเงิน CNY → USD อัตโนมัติ

---

## 4. Market Prices (ราคาตลาดทั่วไป)

### แหล่งข้อมูล:

- **Twelve Data API**: https://twelvedata.com/
- **รองรับ**: หุ้น, Forex, Crypto, Commodities
- **Endpoint**: https://api.twelvedata.com/

### วิธีการดึงข้อมูล:

1. **Realtime Tab**:
   - ดึงข้อมูลจาก Twelve Data API
   - อัพเดททุก 5-60 วินาที (ขึ้นกับ plan)
   - ต้องใช้ API Key
   - บันทึกเวลา: real-time timestamp

2. **รายวัน / รายเดือน / รายปี Tab**:
   - ดึงข้อมูลจากตาราง `market_prices`
   - คำนวณค่าเฉลี่ยด้วย SQL queries
   - บันทึกเวลา: ใช้ `recorded_at` timestamp

### ตาราง:

- `market_prices`: เก็บข้อมูลราคาตลาดทั่วไป
- คอลัมน์สำคัญ: `symbol`, `market`, `price`, `high_price`, `low_price`, `recorded_at`

### เครื่องมือ:

- Edge Function: `fetch-twelve-data`
- Edge Function: `get-realtime-price`
- Edge Function: `record-market-prices`

---

## 5. ตารางค่าเฉลี่ย (Average Tables)

### Monthly Averages

- **ตาราง**: `monthly_market_averages`
- **คอลัมน์**: `symbol`, `market`, `year`, `month`, `avg_price`, `avg_high`, `avg_low`
- **อัพเดท**: คำนวณใหม่ทุกวัน

### Yearly Averages

- **ตาราง**: `yearly_market_averages`
- **คอลัมน์**: `symbol`, `market`, `year`, `avg_price`, `avg_high`, `avg_low`
- **อัพเดท**: คำนวณใหม่ทุกปี

### Daily Summary

- **ตาราง**: `daily_market_summary`
- **คอลัมน์**: `symbol`, `market`, `trade_date`, `open_price`, `close_price`, `high_price`, `low_price`, `avg_price`
- **อัพเดท**: คำนวณทุกวันหลังตลาดปิด

---

## สรุปเครื่องมือที่ใช้

### Edge Functions:

1. `fetch-twelve-data`: ดึงข้อมูลจาก Twelve Data API
2. `get-realtime-price`: ดึงราคา real-time
3. `scrape-lme-prices`: ดึงราคา LME
4. `record-market-prices`: บันทึกราคาลง database
5. `backfill-market-data`: นำเข้าข้อมูลย้อนหลัง
6. `import-excel-data`: นำเข้าข้อมูลจาก Excel

### External APIs:

1. **Exchange Rate API** (Free): https://www.exchangerate-api.com/
2. **Metal Price API** (Free tier): https://www.metalpriceapi.com/
3. **Twelve Data** (Paid): https://twelvedata.com/
4. **LME Official** (Scraping): https://www.lme.com/
5. **SHFE Official** (Scraping): http://www.shfe.com.cn/

### บันทึกเวลา:

- **Realtime**: ใช้เวลาจาก API timestamp
- **Historical**: ใช้ `recorded_at` หรือ `data_date`
- **Average calculation**: ใช้ `avg_calculated_at`
- **Import**: ใช้ `making_date` และ `data_date`

---

## หมายเหตุ

1. **API Keys ที่ต้องการ**:
   - TWELVE_DATA_API_KEY (สำหรับ market prices)
   - METAL_PRICE_API_KEY (สำหรับ LME real-time) - optional
2. **Rate Limits**:
   - Exchange Rate API: ไม่จำกัด (free tier)
   - Metal Price API: 50 requests/เดือน (free)
   - Twelve Data: ขึ้นกับ plan

3. **การสำรองข้อมูล**:
   - ข้อมูล historical เก็บใน Supabase tables
   - มี backup ทุกวัน
   - สามารถ import จาก Excel ได้

4. **ความน่าเชื่อถือ**:
   - Exchange Rate API: ✅ สูง (official rates)
   - Metal Price API: ✅ สูง (ข้อมูลจาก LME/SHFE)
   - Twelve Data: ✅ สูงมาก (professional grade)
   - Web Scraping: ⚠️ ปานกลาง (อาจมีปัญหาถ้าเว็บเปลี่ยนโครงสร้าง)
