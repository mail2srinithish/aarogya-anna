require('dotenv').config()

const express    = require('express')
const cors       = require('cors')
const helmet     = require('helmet')
const passport   = require('./config/passport')
const { apiLimiter } = require('./middleware/rateLimiter')
const { errorHandler, notFound } = require('./middleware/errorHandler')

// Route imports
const authRoutes           = require('./routes/authRoutes')
const profileRoutes        = require('./routes/profileRoutes')
const recipeRoutes         = require('./routes/recipeRoutes')
const chatRoutes           = require('./routes/chatRoutes')
const recommendationRoutes = require('./routes/recommendationRoutes')
const adminRoutes          = require('./routes/adminRoutes')

const app = express()

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))

app.use(cors({
  origin:      process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : '*',
  credentials: true,
  methods:     ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

// ─── Auth ─────────────────────────────────────────────────────────────────────
app.use(passport.initialize())

// ─── Global Rate Limit ────────────────────────────────────────────────────────
app.use('/api', apiLimiter)

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: process.env.npm_package_version || '1.0.0', timestamp: new Date().toISOString() })
})

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',            authRoutes)
app.use('/api/profile',         profileRoutes)
app.use('/api/recipes',         recipeRoutes)
app.use('/api/chat',            chatRoutes)
app.use('/api/recommendations', recommendationRoutes)
app.use('/api/admin',           adminRoutes)

// ─── 404 + Error Handlers ────────────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

module.exports = app
