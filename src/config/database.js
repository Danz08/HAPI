const { Pool } = require('pg');
require('dotenv').config();

// Default to a local neon connection string if not provided
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/hapi_db';

const pool = new Pool({
  connectionString,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech') 
    ? { rejectUnauthorized: false } 
    : false
});

// Wrapper to mimic better-sqlite3 API (with async/await)
function getDb() {
  return {
    prepare: (sql) => {
      // Convert SQLite ? parameters to PostgreSQL $1, $2, etc.
      let i = 1;
      const pgSql = sql.replace(/\?/g, () => `$${i++}`);
      
      return {
        get: async (...args) => {
          const result = await pool.query(pgSql, args);
          return result.rows[0];
        },
        all: async (...args) => {
          const result = await pool.query(pgSql, args);
          return result.rows;
        },
        run: async (...args) => {
          const result = await pool.query(pgSql, args);
          return { 
            changes: result.rowCount, 
            lastInsertRowid: result.rows[0] ? result.rows[0].id : null 
          };
        }
      };
    }
  };
}

async function initDatabase() {
  const db = getDb();

  // We run queries directly using the pool for initialization
  // Users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      display_name VARCHAR(255),
      avatar_url TEXT,
      is_onboarded INTEGER DEFAULT 0,
      google_refresh_token TEXT,
      google_access_token TEXT,
      google_token_expiry BIGINT,
      google_connected INTEGER DEFAULT 0,
      login_method VARCHAR(50) DEFAULT 'manual',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Activity logs
  await pool.query(`
    CREATE TABLE IF NOT EXISTS activities (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      activity_type VARCHAR(50) NOT NULL DEFAULT 'work',
      description TEXT,
      duration_minutes INTEGER NOT NULL DEFAULT 0,
      break_minutes INTEGER NOT NULL DEFAULT 0,
      date VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Mood logs
  await pool.query(`
    CREATE TABLE IF NOT EXISTS mood_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      mood_score INTEGER NOT NULL CHECK(mood_score BETWEEN 1 AND 5),
      mood_label VARCHAR(50) NOT NULL,
      energy_level INTEGER CHECK(energy_level BETWEEN 1 AND 5),
      stress_level INTEGER CHECK(stress_level BETWEEN 1 AND 5),
      notes TEXT,
      logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Quiz results
  await pool.query(`
    CREATE TABLE IF NOT EXISTS quiz_results (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      answers TEXT NOT NULL,
      fatigue_score REAL NOT NULL,
      risk_level VARCHAR(20) NOT NULL CHECK(risk_level IN ('Low', 'Medium', 'High')),
      recommendations TEXT,
      taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Curhat / chat messages
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role VARCHAR(10) NOT NULL CHECK(role IN ('user', 'ai')),
      message TEXT NOT NULL,
      session_id TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Pomodoro sessions
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pomodoro_sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      work_duration INTEGER NOT NULL DEFAULT 25,
      break_duration INTEGER NOT NULL DEFAULT 5,
      cycles_completed INTEGER NOT NULL DEFAULT 0,
      total_focus_minutes INTEGER NOT NULL DEFAULT 0,
      status VARCHAR(50) NOT NULL DEFAULT 'completed',
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ended_at TIMESTAMP
    )
  `);

  // Google Calendar: individual events
  await pool.query(`
    CREATE TABLE IF NOT EXISTS calendar_events (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      event_id TEXT NOT NULL,
      title TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      date VARCHAR(20) NOT NULL,
      event_type VARCHAR(50) DEFAULT 'event',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, event_id)
    )
  `);

  // Google Calendar: daily aggregated features for burnout analysis
  await pool.query(`
    CREATE TABLE IF NOT EXISTS calendar_features (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date VARCHAR(20) NOT NULL,
      meetings_count INTEGER DEFAULT 0,
      work_hours REAL DEFAULT 0,
      back_to_back_count INTEGER DEFAULT 0,
      longest_block_minutes INTEGER DEFAULT 0,
      avg_gap_minutes INTEGER DEFAULT 0,
      calendar_burnout_score REAL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, date)
    )
  `);

  // Create indexes safely (IF NOT EXISTS)
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_cal_events_user_date ON calendar_events(user_id, date)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_cal_features_user_date ON calendar_features(user_id, date)`);

  // Session table for connect-pg-simple
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "session" (
      "sid" varchar NOT NULL COLLATE "default",
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL,
      CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE
    ) WITH (OIDS=FALSE);
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");`);

  console.log('  ✅ PostgreSQL Database initialized successfully');
}

module.exports = { getDb, initDatabase, pool };
