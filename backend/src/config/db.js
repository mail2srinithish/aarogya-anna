const Database = require('better-sqlite3')
const path     = require('path')
const fs       = require('fs')

const DATA_DIR = path.join(__dirname, '../../../data')
const DB_PATH  = process.env.DB_PATH || path.join(DATA_DIR, 'aarogya_anna.db')

let _db = null

function getDb() {
  if (!_db) {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    _db = new Database(DB_PATH)
    _db.pragma('journal_mode = WAL')   // concurrent readers
    _db.pragma('foreign_keys = ON')    // enforce FK constraints
  }
  return _db
}

// Auto-parse JSON strings stored in TEXT columns (arrays / objects)
function parseRow(row) {
  if (!row || typeof row !== 'object') return row
  const out = { ...row }
  for (const key of Object.keys(out)) {
    const v = out[key]
    if (typeof v === 'string' && (v.startsWith('[') || v.startsWith('{'))) {
      try { out[key] = JSON.parse(v) } catch {}
    }
  }
  return out
}

/**
 * pool.query(sql, params)
 *
 * Mimics mysql2's pool.query interface so all controllers remain compatible:
 *   SELECT → returns [rows]           where rows = array of plain objects
 *   DML    → returns [{ affectedRows, insertId }]
 *
 * better-sqlite3 is synchronous; wrapping in async keeps the API identical.
 */
const pool = {
  async query(sql, params = []) {
    const db   = getDb()
    const stmt = db.prepare(sql)
    const verb = sql.trimStart().toUpperCase()

    if (verb.startsWith('SELECT') || verb.startsWith('WITH')) {
      const rows = stmt.all(...params).map(parseRow)
      return [rows]
    } else {
      const info = stmt.run(...params)
      return [{ affectedRows: info.changes, insertId: info.lastInsertRowid }]
    }
  },
}

function testConnection() {
  try {
    getDb().prepare('SELECT 1').get()
    console.log('✅ SQLite connected —', DB_PATH)
  } catch (err) {
    console.error('❌ SQLite failed to open:', err.message)
    process.exit(1)
  }
}

module.exports = { pool, getDb, testConnection }
