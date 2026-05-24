# HAPI — Human Activity Pattern Intelligence

Aplikasi web untuk memantau tingkat kelelahan, mengelola produktivitas, dan menjaga keseimbangan kerja-istirahat. Dibangun menggunakan Express.js dan Vite + TailwindCSS.

---

## Fitur Utama

### Dashboard
- Skor risiko kelelahan real-time berdasarkan quiz, mood, beban kerja, dan pola istirahat
- Grafik tren kelelahan 7 hari terakhir
- Pencatatan aktivitas kerja harian
- Mood tracker dengan slider energi dan stres
- Rekomendasi personal berdasarkan kondisi pengguna

### Pomodoro Timer
- Durasi fokus, istirahat pendek, dan istirahat panjang bisa dikustomisasi
- Tracking siklus harian
- Mini overlay yang mengikuti saat berpindah halaman
- Otomatis tercatat sebagai aktivitas

### Analytics
- Kalender heatmap aktivitas bulanan
- Tren mood dan pola kerja
- Breakdown aktivitas berdasarkan kategori
- Streak harian
- Insight bulanan otomatis
- Integrasi Google Calendar untuk analisis jadwal meeting

### Quiz Kelelahan
- 10 pertanyaan berbasis Maslach Burnout Inventory (MBI)
- Analisis per dimensi: kelelahan emosional, depersonalisasi, pencapaian personal
- Klasifikasi risiko: Rendah, Sedang, Tinggi
- Rekomendasi aktivitas sesuai hasil

### AI Chatbot
- Floating widget di kanan bawah, bisa diakses dari halaman manapun
- Quick action untuk perasaan umum (stres, lelah, sedih, senang)
- Respons empatik sesuai konteks
- Siap diintegrasikan dengan API AI (Gemini)

---

## Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| Backend | Express.js |
| Frontend | EJS + Vite |
| Styling | TailwindCSS v3 |
| Database (Dev) | SQLite (better-sqlite3) |
| Database (Prod) | PostgreSQL (Neon) |
| Deployment | Vercel |
| Bundler | Vite |
| Ikon | Lucide Icons |
| Grafik | Chart.js |
| Font | Newsreader, Manrope, JetBrains Mono |

---

## Struktur Folder

```
HAPI2/
├── client/                     # JS client-side (entry Vite)
│   ├── main.js
│   └── modules/
│       ├── api.js              # HTTP client (axios)
│       ├── dashboard.js        # Chart & form dashboard
│       ├── i18n.js             # Bahasa ID/EN
│       ├── pomodoro-state.js   # State pomodoro persistent
│       ├── theme.js            # Toggle dark/light
│       └── toast.js            # Notifikasi toast
├── public/
│   ├── css/input.css           # Source TailwindCSS
│   └── dist/                   # Output build Vite
├── src/
│   ├── config/database.js      # Inisialisasi & schema DB
│   ├── middleware/auth.js      # Middleware autentikasi
│   ├── routes/
│   │   ├── index.js            # Landing page
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
│       └── calendar.js
├── views/
│   ├── layouts/main.ejs
│   ├── pages/
│   │   ├── landing.ejs
│   │   ├── login.ejs
│   │   ├── register.ejs
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
├── postcss.config.js
├── package.json
└── .env
```

---

## Cara Menjalankan

### Prasyarat
- Node.js v18+
- npm v9+

### Instalasi

```bash
git clone <repository-url>
cd HAPI2
npm install
```

### Setup Environment

Salin file `.env` dan sesuaikan:

```env
PORT=3000
SESSION_SECRET=ganti-dengan-secret-kamu
NODE_ENV=development

# Google Calendar (opsional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

### Build & Jalankan

```bash
# Build asset client
npm run build:client

# Jalankan server
npm start

# Atau mode development (auto-reload)
npm run dev
```

Buka `http://localhost:3000` di browser.

---

## Environment Variables

| Variable | Keterangan | Default |
|----------|-----------|---------|
| `PORT` | Port server | `3000` |
| `SESSION_SECRET` | Secret key untuk session | — |
| `NODE_ENV` | Mode environment | `development` |
| `GOOGLE_CLIENT_ID` | OAuth Client ID | — |
| `GOOGLE_CLIENT_SECRET` | OAuth Client Secret | — |
| `GOOGLE_REDIRECT_URI` | Redirect URI OAuth | `http://localhost:3000/auth/google/callback` |
| `DATABASE_URL` | Connection string PostgreSQL (production) | — |

### Konfigurasi Neon PostgreSQL (Production)

```env
DATABASE_URL=postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/hapi_db?sslmode=require
```

---

## Schema Database

### users
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | INTEGER PK | Auto-increment |
| username | TEXT UNIQUE | Username |
| email | TEXT UNIQUE | Email |
| password | TEXT | Password (bcryptjs) |
| display_name | TEXT | Nama tampilan |
| google_connected | INTEGER | Status koneksi Google |

### activities
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | INTEGER PK | |
| user_id | INTEGER FK | Referensi users |
| activity_type | TEXT | work, study, meeting, other |
| description | TEXT | Deskripsi |
| duration_minutes | INTEGER | Durasi kerja (menit) |
| break_minutes | INTEGER | Durasi istirahat (menit) |
| date | TEXT | Tanggal (YYYY-MM-DD) |

### mood_logs
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | INTEGER PK | |
| user_id | INTEGER FK | |
| mood_score | INTEGER | Skala 1-5 |
| mood_label | TEXT | Label mood |
| energy_level | INTEGER | Skala 1-5 |
| stress_level | INTEGER | Skala 1-5 |
| notes | TEXT | Catatan opsional |
| logged_at | DATETIME | Waktu log |

### quiz_results
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | INTEGER PK | |
| user_id | INTEGER FK | |
| answers | TEXT (JSON) | Array skor jawaban |
| fatigue_score | REAL | Skor kelelahan (0-100) |
| risk_level | TEXT | Low / Medium / High |
| recommendations | TEXT (JSON) | Rekomendasi |
| taken_at | DATETIME | Waktu pengisian |

### pomodoro_sessions
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | INTEGER PK | |
| user_id | INTEGER FK | |
| work_duration | INTEGER | Durasi fokus (menit) |
| break_duration | INTEGER | Durasi istirahat (menit) |
| cycles_completed | INTEGER | Siklus selesai |
| total_focus_minutes | INTEGER | Total waktu fokus |
| started_at | DATETIME | Waktu mulai |
| ended_at | DATETIME | Waktu selesai |

### chat_messages, calendar_events, calendar_features
Tabel pendukung untuk chatbot dan integrasi Google Calendar.

---

## API Endpoint

### Autentikasi
| Method | Endpoint | Keterangan |
|--------|----------|-----------|
| GET/POST | `/auth/login` | Halaman & proses login |
| GET/POST | `/auth/register` | Halaman & proses registrasi |
| GET | `/auth/logout` | Logout |
| GET | `/auth/google` | OAuth Google Calendar |

### Halaman
| Method | Endpoint | Keterangan |
|--------|----------|-----------|
| GET | `/` | Landing page |
| GET | `/dashboard` | Dashboard |
| GET | `/pomodoro` | Pomodoro Timer |
| GET | `/analytics` | Analytics |
| GET | `/quiz` | Quiz Kelelahan |

### REST API
| Method | Endpoint | Keterangan |
|--------|----------|-----------|
| POST | `/api/activities` | Catat aktivitas |
| GET | `/api/activities` | Ambil data aktivitas |
| POST | `/api/mood` | Catat mood |
| GET | `/api/mood` | Riwayat mood |
| GET | `/api/stats/overview` | Statistik dashboard |
| POST | `/api/pomodoro/sessions` | Simpan sesi pomodoro |
| GET | `/api/pomodoro/stats` | Statistik pomodoro |
| POST | `/api/quiz` | Submit jawaban quiz |
| GET | `/api/quiz/history` | Riwayat quiz |
| POST | `/api/chat` | Kirim pesan chatbot |
| GET | `/api/analytics/day/:date` | Detail per hari |

---

## Design System

- Warna utama: Terracotta (`#C47B5A`)
- Aksen: Teal (`#489A98`)
- Tipografi: Newsreader (heading), Manrope (body), JetBrains Mono (kode)
- Tema: Dark mode (default) dan Light mode
- Bahasa: Indonesia (default) dan English

---

## Deploy ke Vercel

1. Push kode ke GitHub
2. Import repository di [Vercel](https://vercel.com)
3. Atur environment variable di dashboard Vercel:
   - `SESSION_SECRET`, `NODE_ENV=production`
   - `DATABASE_URL` (connection string Neon)
   - Credential Google OAuth
4. Deploy — Vercel akan menggunakan konfigurasi dari `vercel.json`

---

## Roadmap

- [ ] Migrasi Neon PostgreSQL untuk production
- [ ] Notifikasi real-time
- [ ] Perbaikan responsivitas mobile
- [ ] Export data (PDF/CSV)

---

## Lisensi

ISC

---

## Tim

HAPI Team — DBS Foundation Coding Camp 2026
