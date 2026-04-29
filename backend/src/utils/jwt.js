const jwt = require('jsonwebtoken')

const ACCESS_SECRET  = process.env.JWT_SECRET         || 'aarogya_access_secret_change_me'
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'aarogya_refresh_secret_change_me'
const ACCESS_TTL     = process.env.JWT_EXPIRES_IN     || '15m'
const REFRESH_TTL    = process.env.JWT_REFRESH_EXPIRES|| '7d'

function signAccess(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    ACCESS_SECRET,
    { expiresIn: ACCESS_TTL }
  )
}

function signRefresh(user) {
  return jwt.sign(
    { sub: user.id },
    REFRESH_SECRET,
    { expiresIn: REFRESH_TTL }
  )
}

function verifyAccess(token) {
  return jwt.verify(token, ACCESS_SECRET)
}

function verifyRefresh(token) {
  return jwt.verify(token, REFRESH_SECRET)
}

// Parse expiry string to Date for DB storage
function refreshExpiresAt() {
  // REFRESH_TTL is '7d', convert to ms
  const match = REFRESH_TTL.match(/^(\d+)([dhms])$/)
  if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const [, num, unit] = match
  const ms = { d: 86400000, h: 3600000, m: 60000, s: 1000 }[unit]
  return new Date(Date.now() + parseInt(num) * ms)
}

module.exports = { signAccess, signRefresh, verifyAccess, verifyRefresh, refreshExpiresAt }
