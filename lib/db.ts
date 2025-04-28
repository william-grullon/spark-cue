import path from 'path';
import Database from 'better-sqlite3';

const dbPath = process.env.DB_PATH || path.resolve(process.cwd(), 'db.sqlite');
const db = new Database(dbPath);

// Initialize tables
// profiles table
db.prepare(`
  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    bio TEXT,
    location TEXT,
    pictures TEXT NOT NULL,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// messages table
db.prepare(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER NOT NULL,
    source TEXT NOT NULL,
    persona TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    sent_at DATETIME,
    responded_at DATETIME,
    response_latency INTEGER,
    success INTEGER DEFAULT 0,
    FOREIGN KEY (profile_id) REFERENCES profiles(id)
  )
`).run();

export default db;