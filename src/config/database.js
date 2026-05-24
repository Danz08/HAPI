const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'hapi.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initDatabase() {
  const database = getDb();

  // Users table
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      display_name TEXT,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Activity logs
  database.exec(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      activity_type TEXT NOT NULL DEFAULT 'work',
      description TEXT,
      duration_minutes INTEGER NOT NULL DEFAULT 0,
      break_minutes INTEGER NOT NULL DEFAULT 0,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Mood logs
  database.exec(`
    CREATE TABLE IF NOT EXISTS mood_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      mood_score INTEGER NOT NULL CHECK(mood_score BETWEEN 1 AND 5),
      mood_label TEXT NOT NULL,
      energy_level INTEGER CHECK(energy_level BETWEEN 1 AND 5),
      stress_level INTEGER CHECK(stress_level BETWEEN 1 AND 5),
      notes TEXT,
      logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Quiz results
  database.exec(`
    CREATE TABLE IF NOT EXISTS quiz_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      answers TEXT NOT NULL,
      fatigue_score REAL NOT NULL,
      risk_level TEXT NOT NULL CHECK(risk_level IN ('Low', 'Medium', 'High')),
      recommendations TEXT,
      taken_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Curhat / chat messages
  database.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'ai')),
      message TEXT NOT NULL,
      session_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Pomodoro sessions
  database.exec(`
    CREATE TABLE IF NOT EXISTS pomodoro_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      work_duration INTEGER NOT NULL DEFAULT 25,
      break_duration INTEGER NOT NULL DEFAULT 5,
      cycles_completed INTEGER NOT NULL DEFAULT 0,
      total_focus_minutes INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'completed',
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ended_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Google Calendar: individual events
  database.exec(`
    CREATE TABLE IF NOT EXISTS calendar_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      event_id TEXT NOT NULL,
      title TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      date TEXT NOT NULL,
      event_type TEXT DEFAULT 'event',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, event_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Google Calendar: daily aggregated features for burnout analysis
  database.exec(`
    CREATE TABLE IF NOT EXISTS calendar_features (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      meetings_count INTEGER DEFAULT 0,
      work_hours REAL DEFAULT 0,
      back_to_back_count INTEGER DEFAULT 0,
      longest_block_minutes INTEGER DEFAULT 0,
      avg_gap_minutes INTEGER DEFAULT 0,
      calendar_burnout_score REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, date),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Add Google OAuth columns to users (safe to run multiple times)
  const userColumns = database.prepare("PRAGMA table_info(users)").all().map(c => c.name);
  if (!userColumns.includes('google_refresh_token')) {
    database.exec(`ALTER TABLE users ADD COLUMN google_refresh_token TEXT`);
  }
  if (!userColumns.includes('google_access_token')) {
    database.exec(`ALTER TABLE users ADD COLUMN google_access_token TEXT`);
  }
  if (!userColumns.includes('google_token_expiry')) {
    database.exec(`ALTER TABLE users ADD COLUMN google_token_expiry INTEGER`);
  }
  if (!userColumns.includes('google_connected')) {
    database.exec(`ALTER TABLE users ADD COLUMN google_connected INTEGER DEFAULT 0`);
  }

  // Indexes for performance
  database.exec(`CREATE INDEX IF NOT EXISTS idx_cal_events_user_date ON calendar_events(user_id, date)`);
  database.exec(`CREATE INDEX IF NOT EXISTS idx_cal_features_user_date ON calendar_features(user_id, date)`);

  console.log('  ✅ Database initialized successfully');
}

module.exports = { getDb, initDatabase };
