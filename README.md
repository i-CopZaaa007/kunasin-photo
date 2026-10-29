# Kunasin Photo

เว็บแกลเลอรีรูปภาพ (React + Vite + Tailwind + GSAP) พร้อมหลังบ้าน `/admin` สำหรับแอดมินคนเดียว
ใช้ **Supabase** (ฟรี) เป็นที่เก็บข้อมูล/รูป/ระบบ login และ deploy บน **Vercel**

```
ผู้เข้าชม ──► Vercel (หน้าเว็บ static) ──► Supabase: อ่าน categories / photos (สาธารณะ)
แอดมิน   ──► /admin ── login ──► Supabase: เขียนได้เฉพาะอีเมลแอดมิน (บังคับด้วย RLS)
```

## ตั้งค่าครั้งแรก

### 1) สร้างโปรเจกต์ Supabase
1. สมัครที่ https://supabase.com แล้วสร้าง Project (แพ็กเกจ Free)
2. **SQL Editor** → เปิดไฟล์ `supabase/schema.sql` → **แก้อีเมล `CHANGE_ME@example.com` เป็นอีเมลแอดมินของคุณ** → Run
3. **Authentication → Sign In / Providers** → ปิด **Allow new users to sign up** (สำคัญ: กันคนอื่นสมัครเข้ามา)
4. **Authentication → Users → Add user → Create new user** ใส่อีเมล (ต้องตรงกับข้อ 2) + รหัสผ่านที่เดายาก และติ๊ก **Auto Confirm User**
5. **Project Settings → API** คัดลอก `Project URL` และ `anon public key`

### 2) ตั้งค่าในเครื่อง
```bash
cp .env.example .env.local     # แล้วใส่ VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY (ใส่แค่ 2 ตัวนี้)
npm install
npm run dev                    # เว็บ: http://localhost:5173   หลังบ้าน: http://localhost:5173/admin
```
ถ้าไม่มี `.env.local` หน้าเว็บจะขึ้นว่าโหลดรูปไม่สำเร็จ และ `/admin` จะแจ้งว่ายังไม่ได้ตั้งค่า

หลังตั้งค่า Supabase เสร็จ ให้อัปโหลดรูปผ่านหน้า `/admin` ได้เลย

## ใช้งานหลังบ้าน (`/admin`)
- **รูปภาพ:** อัปโหลดได้ทีละหลายไฟล์ (JPG/PNG/WebP) เลือกหมวด, แก้ชื่อรูป/หมวดได้ทันที, ลบรูป (ลบไฟล์จริงด้วย)
- **Tag / เมนู navbar:** เพิ่ม/เปลี่ยนชื่อ/ลบ tag หมวดหลักจะเป็นปุ่มบน navbar หมวดที่เลือก "อยู่ภายใต้" จะเป็นเมนู dropdown ลบได้เฉพาะ tag ที่ไม่มีรูปและไม่มีหมวดย่อย
- รูปถูกย่อในเบราว์เซอร์ก่อนอัปโหลด (ด้านยาวสุด 2560px) ประมาณ 0.6 MB ต่อรูป พื้นที่ฟรี 1 GB จึงใส่ได้ราว 1,500 รูป

## Deploy บน GitHub + Vercel
1. `git init` → ตรวจรายการไฟล์ก่อน commit (ดูหัวข้อถัดไป) → push ขึ้น GitHub
2. Vercel → **Add New Project** → เลือก repo (Framework: Vite, ค่าเริ่มต้นใช้ได้)
3. **Settings → Environment Variables** เพิ่มเพียง 2 ตัว: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` แล้ว Deploy
   (ถ้าเพิ่ม/แก้ env ภายหลังต้อง Redeploy เพราะค่าถูกฝังตอน build)

`vercel.json` ตั้ง rewrite ให้ `/admin` เปิดได้ และใส่ security headers พื้นฐานไว้แล้ว

## เช็กลิสต์ความปลอดภัย (ก่อน push)
| ห้ามหลุด / ห้าม commit | หมายเหตุ |
|---|---|
| `.env`, `.env.local`, `.env.*` | `.gitignore` กันไว้แล้ว (ยกเว้น `.env.example`) |
| `service_role` / secret key ของ Supabase | **ข้ามสิทธิ์ทั้งหมด** ไม่ต้องใช้ในโปรเจกต์นี้อีกแล้ว ห้ามใส่ใน Vercel ห้าม commit |
| รหัสผ่านแอดมิน | อยู่ใน Supabase เท่านั้น ไม่เขียนลงไฟล์ใดๆ |

ปลอดภัยที่จะ commit/เปิดเผย: `VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY` (ฝังในเว็บอยู่แล้วโดยธรรมชาติ) เพราะคนที่มีค่านี้ **อ่านได้อย่างเดียว** การเขียนทุกอย่างถูกล็อกด้วย Row Level Security ใน `supabase/schema.sql`

ตรวจก่อน push:
```bash
git status --short             # ต้องไม่เห็น .env* (ยกเว้น .env.example)
git check-ignore -v .env.local # ต้องแสดงกฎที่ ignore
git grep -n "service_role\|eyJ"  # ต้องไม่เจอ key จริง (ต้อง git add ก่อนจึงจะค้นเจอ)
```

## ข้อควรรู้ของแพ็กเกจฟรี
- Supabase Free **หยุดโปรเจกต์ชั่วคราวถ้าไม่มีการใช้งานนาน ~7 วัน** (กด Restore ได้ใน dashboard ข้อมูลไม่หาย) ถ้าเว็บมีคนเข้าอยู่เรื่อยๆ จะไม่เกิดขึ้น
- โควตา: Storage 1 GB, ดาวน์โหลดรูป ~5 GB/เดือน (เปลี่ยนตามแพ็กเกจของ Supabase ดูที่ supabase.com/pricing)
- การกันคลิกขวา/ลากรูปกันได้เฉพาะผู้ใช้ทั่วไป คนที่เปิด DevTools หรือ screenshot ยังเอารูปได้ ถ้าต้องการป้องกันจริงจัง ควรใส่ watermark

## โครงสร้าง
```
src/components/   Navbar, Gallery, PhotoCard, Lightbox, PageTitle, Footer
src/hooks/        useGallery (โหลดข้อมูล), usePhotos (filter), useLightbox
src/admin/        หน้าหลังบ้าน (โหลดแยกเมื่อเข้า /admin)
src/lib/          supabase client, image resize, gallery API
supabase/         schema.sql (ตาราง + RLS + bucket)
vercel.json       rewrite /admin + security headers
```
