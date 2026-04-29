const passport      = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const JwtStrategy   = require('passport-jwt').Strategy
const ExtractJwt    = require('passport-jwt').ExtractJwt
const { pool }      = require('./db')

// ─── JWT Strategy ─────────────────────────────────────────────────────────────
passport.use(new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey:    process.env.JWT_SECRET || 'change_this_secret',
  },
  async (payload, done) => {
    try {
      const [rows] = await pool.query(
        'SELECT id, email, name, role, avatar_url FROM users WHERE id = ?',
        [payload.sub]
      )
      if (!rows.length) return done(null, false)
      return done(null, rows[0])
    } catch (err) {
      return done(err, false)
    }
  }
))

// ─── Google OAuth 2.0 Strategy (skipped if credentials not set) ─────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email     = profile.emails?.[0]?.value
      const googleId  = profile.id
      const name      = profile.displayName
      const avatarUrl = profile.photos?.[0]?.value

      if (!email) return done(new Error('No email from Google'), false)

      // Upsert user
      const [existing] = await pool.query(
        'SELECT id, email, name, role, avatar_url FROM users WHERE google_id = ? OR email = ?',
        [googleId, email]
      )

      if (existing.length) {
        // Update google_id and avatar if missing
        await pool.query(
          "UPDATE users SET google_id = ?, avatar_url = COALESCE(avatar_url, ?), last_login = datetime('now') WHERE id = ?",
          [googleId, avatarUrl, existing[0].id]
        )
        return done(null, existing[0])
      }

      // New user
      const { v4: uuidv4 } = require('uuid')
      const id = uuidv4()
      await pool.query(
        'INSERT INTO users (id, email, name, google_id, avatar_url, is_verified) VALUES (?, ?, ?, ?, ?, TRUE)',
        [id, email, name, googleId, avatarUrl]
      )
      const [newUser] = await pool.query('SELECT id, email, name, role, avatar_url FROM users WHERE id = ?', [id])
      return done(null, newUser[0])
    } catch (err) {
      return done(err, false)
    }
  }
))
} else {
  console.warn('⚠️  GOOGLE_CLIENT_ID not set — Google OAuth disabled')
}

module.exports = passport
