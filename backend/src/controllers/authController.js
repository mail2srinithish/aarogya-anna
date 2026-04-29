const bcrypt   = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const { pool } = require('../config/db')
const { signAccess, signRefresh, verifyRefresh, refreshExpiresAt } = require('../utils/jwt')
const { createError } = require('../middleware/errorHandler')

// ─── Register ─────────────────────────────────────────────────────────────────
async function register(req, res, next) {
  try {
    const { email, password, name } = req.body

    // Check existing user
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length) return next(createError(409, 'Email already registered'))

    const passwordHash = await bcrypt.hash(password, 12)
    const id = uuidv4()

    await pool.query(
      'INSERT INTO users (id, email, password_hash, name, is_verified) VALUES (?, ?, ?, ?, ?)',
      [id, email.toLowerCase().trim(), passwordHash, name.trim(), false]
    )

    const [user] = await pool.query('SELECT id, email, name, role FROM users WHERE id = ?', [id])
    const accessToken  = signAccess(user[0])
    const refreshToken = signRefresh(user[0])

    await pool.query(
      'INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
      [uuidv4(), id, refreshToken, refreshExpiresAt()]
    )

    res.status(201).json({
      success: true,
      message: 'Account created',
      data: { user: user[0], accessToken, refreshToken },
    })
  } catch (err) {
    next(err)
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────
async function login(req, res, next) {
  try {
    const { email, password } = req.body

    const [rows] = await pool.query(
      'SELECT id, email, name, role, avatar_url, password_hash FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    )
    if (!rows.length) return next(createError(401, 'Invalid email or password'))

    const user = rows[0]
    if (!user.password_hash) return next(createError(401, 'Please sign in with Google'))

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return next(createError(401, 'Invalid email or password'))

    await pool.query("UPDATE users SET last_login = datetime('now') WHERE id = ?", [user.id])

    const accessToken  = signAccess(user)
    const refreshToken = signRefresh(user)

    await pool.query(
      'INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
      [uuidv4(), user.id, refreshToken, refreshExpiresAt()]
    )

    const { password_hash, ...safeUser } = user
    res.json({
      success: true,
      data: { user: safeUser, accessToken, refreshToken },
    })
  } catch (err) {
    next(err)
  }
}

// ─── Refresh Access Token ────────────────────────────────────────────────────
async function refreshToken(req, res, next) {
  try {
    const { refreshToken: token } = req.body
    if (!token) return next(createError(400, 'Refresh token required'))

    // Verify token
    let payload
    try { payload = verifyRefresh(token) } catch {
      return next(createError(401, 'Invalid or expired refresh token'))
    }

    // Check DB (token rotation: delete old, issue new)
    const [rows] = await pool.query(
      "SELECT id, user_id FROM refresh_tokens WHERE token = ? AND expires_at > datetime('now')",
      [token]
    )
    if (!rows.length) return next(createError(401, 'Refresh token not found or expired'))

    const [users] = await pool.query('SELECT id, email, name, role FROM users WHERE id = ?', [payload.sub])
    if (!users.length) return next(createError(401, 'User not found'))

    const user = users[0]

    // Rotate tokens
    await pool.query('DELETE FROM refresh_tokens WHERE id = ?', [rows[0].id])

    const newAccess  = signAccess(user)
    const newRefresh = signRefresh(user)

    await pool.query(
      'INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
      [uuidv4(), user.id, newRefresh, refreshExpiresAt()]
    )

    res.json({ success: true, data: { accessToken: newAccess, refreshToken: newRefresh } })
  } catch (err) {
    next(err)
  }
}

// ─── Logout ──────────────────────────────────────────────────────────────────
async function logout(req, res, next) {
  try {
    const { refreshToken: token } = req.body
    if (token) {
      await pool.query('DELETE FROM refresh_tokens WHERE token = ?', [token])
    }
    res.json({ success: true, message: 'Logged out' })
  } catch (err) {
    next(err)
  }
}

// ─── Google OAuth callback ───────────────────────────────────────────────────
async function googleCallback(req, res) {
  const user = req.user
  const accessToken  = signAccess(user)
  const refreshToken = signRefresh(user)

  await pool.query(
    'INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
    [uuidv4(), user.id, refreshToken, refreshExpiresAt()]
  ).catch(() => {})

  // Redirect to frontend with tokens in query (or use cookie)
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
  res.redirect(`${frontendUrl}/auth/callback?access=${accessToken}&refresh=${refreshToken}`)
}

// ─── Get current user (me) ───────────────────────────────────────────────────
async function getMe(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.email, u.name, u.role, u.avatar_url, u.is_verified, u.created_at,
              hp.age, hp.gender, hp.weight_kg, hp.height_cm, hp.bmi, hp.conditions,
              hp.diet_type, hp.health_goal, hp.region
       FROM users u
       LEFT JOIN health_profiles hp ON hp.user_id = u.id
       WHERE u.id = ?`,
      [req.user.id]
    )
    if (!rows.length) return res.status(404).json({ success: false, message: 'User not found' })
    res.json({ success: true, data: rows[0] })
  } catch (err) {
    next(err)
  }
}

// ─── Change Password ─────────────────────────────────────────────────────────
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body
    const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id])
    if (!rows[0]?.password_hash) return next(createError(400, 'No password set (OAuth account)'))

    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash)
    if (!valid) return next(createError(401, 'Current password is incorrect'))

    const newHash = await bcrypt.hash(newPassword, 12)
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id])

    res.json({ success: true, message: 'Password updated' })
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login, refreshToken, logout, googleCallback, getMe, changePassword }
