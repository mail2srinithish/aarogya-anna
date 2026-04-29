const { pool }   = require('../config/db')
const { cacheDelPattern } = require('../config/redis')
const { createError }     = require('../middleware/errorHandler')

// ─── Stats Overview ───────────────────────────────────────────────────────────
async function getStats(req, res, next) {
  try {
    const [[users]]    = await pool.query('SELECT COUNT(*) AS total FROM users')
    const [[recipes]]  = await pool.query('SELECT COUNT(*) AS total FROM recipes WHERE is_published = 1')
    const [[logs]]     = await pool.query("SELECT COUNT(*) AS total FROM nutrition_logs WHERE log_date = date('now')")
    const [[chats]]    = await pool.query("SELECT COUNT(*) AS total FROM chat_messages WHERE date(created_at) = date('now')")
    const [[dauRes]]   = await pool.query(
      "SELECT COUNT(DISTINCT user_id) AS dau FROM nutrition_logs WHERE log_date = date('now')"
    )

    const [syncLogs] = await pool.query(
      'SELECT * FROM sync_logs ORDER BY started_at DESC LIMIT 10'
    )

    res.json({
      success: true,
      data: {
        total_users:    users.total,
        total_recipes:  recipes.total,
        logs_today:     logs.total,
        chats_today:    chats.total,
        dau:            dauRes.dau,
        recent_syncs:   syncLogs,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ─── List Users ───────────────────────────────────────────────────────────────
async function listUsers(req, res, next) {
  try {
    const page   = Math.max(1, parseInt(req.query.page || '1'))
    const limit  = Math.min(100, parseInt(req.query.limit || '20'))
    const offset = (page - 1) * limit
    const search = req.query.search || ''

    const where  = search ? 'WHERE u.name LIKE ? OR u.email LIKE ?' : ''
    const params = search ? [`%${search}%`, `%${search}%`] : []

    const [rows] = await pool.query(
      `SELECT u.id, u.email, u.name, u.role, u.is_verified, u.last_login, u.created_at,
              hp.age, hp.gender, hp.conditions, hp.health_goal
       FROM users u LEFT JOIN health_profiles hp ON hp.user_id = u.id
       ${where} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    )
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM users u ${where}`,
      params
    )

    res.json({ success: true, data: rows, pagination: { page, limit, total } })
  } catch (err) {
    next(err)
  }
}

// ─── Update User Role ─────────────────────────────────────────────────────────
async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params
    const { role } = req.body
    if (!['user','admin'].includes(role)) return next(createError(400, 'Invalid role'))
    if (id === req.user.id)               return next(createError(400, 'Cannot change your own role'))

    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id])
    res.json({ success: true, message: 'Role updated' })
  } catch (err) {
    next(err)
  }
}

// ─── System Config ────────────────────────────────────────────────────────────
async function getConfig(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT key_name, value FROM system_config')
    const config = Object.fromEntries(rows.map((r) => [r.key_name, r.value]))
    res.json({ success: true, data: config })
  } catch (err) {
    next(err)
  }
}

async function updateConfig(req, res, next) {
  try {
    const { key_name, value } = req.body
    const ALLOWED_KEYS = ['maintenance_mode', 'app_version']
    if (!ALLOWED_KEYS.includes(key_name)) return next(createError(400, 'Config key not allowed'))

    await pool.query(
      'INSERT INTO system_config (key_name, value) VALUES (?, ?) ON CONFLICT(key_name) DO UPDATE SET value = excluded.value',
      [key_name, value]
    )
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

// ─── Clear Cache ──────────────────────────────────────────────────────────────
async function clearCache(req, res, next) {
  try {
    await cacheDelPattern('recipes:*')
    await cacheDelPattern('recommendations:*')
    await cacheDelPattern('dashboard:*')
    res.json({ success: true, message: 'All caches cleared' })
  } catch (err) {
    next(err)
  }
}

// ─── Get Sync Logs ────────────────────────────────────────────────────────────
async function getSyncLogs(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM sync_logs ORDER BY started_at DESC LIMIT 50'
    )
    res.json({ success: true, data: rows })
  } catch (err) {
    next(err)
  }
}

module.exports = { getStats, listUsers, updateUserRole, getConfig, updateConfig, clearCache, getSyncLogs }
