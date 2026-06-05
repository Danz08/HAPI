# HAPI — Human Activity Pattern Intelligence

Aplikasi web untuk memantau tingkat kelelahan, mengelola produktivitas, dan menjaga keseimbangan kerja-istirahat. Dibangun menggunakan Express.js, Vite, TailwindCSS, dan ditenagai oleh Machine Learning.

---

## Fitur Utama

### Onboarding Interaktif
- Alur *onboarding* ketat yang mewajibkan pengguna baru untuk menyelesaikan kuis kelelahan pertama sebelum dapat mengakses fitur lain, guna memastikan personalisasi AI yang akurat sejak awal.

### Dashboard Pintar
- Skor risiko kelelahan *real-time* berdasarkan quiz, mood, beban kerja, dan pola istirahat.
- Integrasi Prediksi Machine Learning: Burnout Score & Lifestyle Analysis.
- Grafik tren kelelahan dan *streak* harian.
- Pencatatan aktivitas kerja harian.
- Mood tracker interaktif dengan analisis emosi otomatis.

### Pomodoro Timer
- Durasi fokus, istirahat pendek, dan istirahat panjang bisa dikustomisasi.
- Tracking siklus harian.
- Mini overlay yang mengikuti saat berpindah halaman.
- Otomatis tercatat sebagai aktivitas kerja/istirahat.

### Analytics
- Kalender heatmap aktivitas bulanan.
- Tren mood dan pola kerja.
- Breakdown aktivitas berdasarkan kategori.
- Integrasi Google Calendar untuk analisis jadwal meeting dan potensi *calendar burnout*.

### Quiz Kelelahan (MBI)
- 15 pertanyaan berbasis Maslach Burnout Inventory (MBI) Adaptasi Mahasiswa.
- Analisis per dimensi: Kelelahan Emosional (Exhaustion), Sinisme (Cynicism), dan Efikasi Akademik (Academic Efficacy).
- Integrasi ML API untuk memprediksi tingkat kelelahan berdasarkan jawaban.
- Klasifikasi risiko: Rendah, Sedang, Tinggi beserta rekomendasi yang disesuaikan.

### AI Chatbot Asisten (Powered by Gemini AI)
- Floating widget di kanan bawah, bisa diakses dari halaman manapun setelah *onboarding*.
- Terintegrasi penuh dengan **Google Gemini API** (`gemini-flash-latest`) untuk percakapan empatik dan pintar layaknya konselor atau teman cerita.
- Deteksi emosi otomatis (Emotion AI) dari pesan pengguna untuk merespons dengan konteks empati yang tepat.
- *Quick actions* (chips) untuk respons cepat (misal: melaporkan cuaca/kondisi hari ini).

---

## Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| Backend | Node.js, Express.js |
| Frontend | EJS + Vite |
| Styling | TailwindCSS v3 |
| Database | PostgreSQL (pg, connect-pg-simple) |
| Deployment | Vercel (Web), Neon (Database) |
| Bundler | Vite |
| Ikon | Lucide Icons |
| Grafik | Chart.js |
| Font | Newsreader, Manrope, JetBrains Mono |

---

## Struktur Folder

```
HAPI2/
├── apimodel-main/              # Source code API Machine Learning (FastAPI)
├── client/                     # JS client-side (entry Vite)
│   ├── main.js
│   └── modules/
│       ├── api.js              # HTTP client (axios)
│       ├── dashboard.js        # Chart & form dashboard
│       ├── pomodoro-state.js   # State pomodoro persistent
│       ├── theme.js            # Toggle dark/light
│       └── toast.js            # Notifikasi toast
├── public/
│   ├── css/input.css           # Source TailwindCSS
│   └── dist/                   # Output build Vite
├── src/
│   ├── config/database.js      # Inisialisasi & schema DB (PostgreSQL)
│   ├── middleware/auth.js      # Middleware autentikasi & onboarding
│   ├── routes/
│   │   ├── index.js            # Landing page & onboarding
│   │   ├── auth.js             # Login, Register, Logout
│   │   ├── dashboard.js        # Halaman dashboard
│   │   ├── pomodoro.js         # Halaman pomodoro
│   │   ├── analytics.js        # Halaman analytics
│   │   ├── quiz.js             # Halaman quiz
│   │   ├── api.js              # REST API endpoint
│   │   └── google-auth.js      # OAuth Google Calendar
│   └── utils/
│       ├── fatigue-calculator.js
│       ├── recommendations.js
│       ├── chatbot-engine.js   
│       ├── ml-api.js           # Integrasi Model Machine Learning
│       └── calendar.js
├── views/
│   ├── layouts/main.ejs
│   ├── pages/
│   │   ├── landing.ejs
│   │   ├── login.ejs
│   │   ├── register.ejs
│   │   ├── onboarding.ejs
│   │   ├── dashboard.ejs
│   │   ├── pomodoro.ejs
│   │   ├── analytics.ejs
│   │   └── quiz.ejs
│   └── partials/
│       ├── sidebar.ejs
│       ├── navbar.ejs
│       ├── chatbot-widget.ejs
│       ├── mood-overlay.ejs
│       └── flash.ejs
├── server.js
├── vercel.json
├── vite.config.js
├── tailwind.config.js
├── package.json
└── .env
```

---

## Cara Menjalankan

### Prasyarat
- Node.js v18+
- npm v9+
- PostgreSQL Server lokal atau Neon DB

### Instalasi

```bash
git clone <repository-url>
cd HAPI2
npm install
```

### Setup Environment

Salin file `.env.copy` menjadi `.env` dan sesuaikan nilainya:

```env
PORT=3000
SESSION_SECRET=ganti-dengan-secret-kamu
NODE_ENV=development

# Database PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/hapi_db

# Google Calendar (opsional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Gemini API Key untuk Chatbot
GEMINI_API_KEY=AIzaSy...
```

### Build & Jalankan

```bash
# Build asset client menggunakan Vite
npm run build:client

# Jalankan server
npm start

# Atau mode development (concurrent Vite watch & Nodemon)
npm run dev
```

Buka `http://localhost:3000` di browser.

---

## Schema Database

### `users`
- `id` (PK), `username`, `email`, `password` (bcrypt)
- `display_name`, `avatar_url`
- `is_onboarded` (INTEGER) - Penanda kelulusan onboarding
- `current_streak`, `longest_streak`, `last_streak_date`
- `google_connected`, Token Google Calendar

### `activities`
- `id` (PK), `user_id` (FK)
- `activity_type`, `description`
- `duration_minutes`, `break_minutes`
- `date`

### `mood_logs`
- `id` (PK), `user_id` (FK)
- `mood_score`, `mood_label` (Skala 1-5)
- `energy_level`, `stress_level`, `notes`, `date`

### `quiz_results`
- `id` (PK), `user_id` (FK)
- `answers` (JSON Array)
- `fatigue_score`, `risk_level`, `recommendations`
- `date`

### `pomodoro_sessions`
- `id` (PK), `user_id` (FK)
- `work_duration`, `break_duration`
- `cycles_completed`, `total_focus_minutes`
- `status`, `date`

### `chat_messages` & `chatbot_states`
- Tabel untuk menyimpan riwayat curhat pengguna dan state konteks chatbot.

### `calendar_events` & `calendar_features`
- Tabel sinkronisasi Google Calendar dan hasil ekstraksi fitur burnout dari jadwal.

---

## Design System

- **Warna Utama**: Terracotta (`#C47B5A`)
- **Aksen**: Teal (`#489A98`)
- **Tipografi**: Newsreader (heading), Manrope (body), JetBrains Mono (kode)
- **Tema**: *Dark mode* (default) dan *Light mode* (Kaca / Glassmorphism)
- **Bahasa**: Indonesia
- **Responsivitas**: Desain *Mobile-First* yang nyaman di perangkat kecil maupun desktop.

---

## Deploy ke Vercel

1. Push kode ke GitHub.
2. Import repository di [Vercel](https://vercel.com).
3. Atur environment variable di dashboard Vercel:
   - `SESSION_SECRET`
   - `NODE_ENV=production`
   - `DATABASE_URL` (Connection string PostgreSQL Neon dengan `sslmode=require`)
4. Deploy — Vercel akan otomatis membaca konfigurasi `vercel.json` dan mem-build menggunakan Vite.

---

## Roadmap

- [x] Migrasi ke PostgreSQL untuk *production*
- [x] Perbaikan responsivitas *mobile* dan *glassmorphism*
- [x] Integrasi Model Machine Learning (API)
- [x] Onboarding Flow *strict*
- [x] Integrasi Chatbot dengan Gemini API
- [ ] Notifikasi *real-time* (Push API / WebSockets)
- [ ] Export data analisis (PDF/CSV)

---

## Lisensi

ISC

---

## Tim

HAPI Team — DBS Foundation Coding Camp 2026
