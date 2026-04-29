require('dotenv').config()

const app  = require('./src/app')
const { testConnection } = require('./src/config/db')
const { initDb }         = require('./src/config/initDb')
const { getRedisClient } = require('./src/config/redis')
const { startCronJobs }  = require('./src/jobs/dailySync')

const PORT = process.env.PORT || 5000

async function bootstrap() {
  // Open SQLite + verify it works (creates data/ dir if needed)
  testConnection()

  // Create all tables (no-op if already exist)
  initDb()

  // Connect Redis (optional — warns if unavailable, app still runs)
  await getRedisClient()

  // Start scheduled sync jobs
  if (process.env.NODE_ENV !== 'test') {
    startCronJobs()
  }

  // Start HTTP server
  app.listen(PORT, () => {
    console.log(`\n🚀 AarogyaAnna API running on port ${PORT}`)
    console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`)
    console.log(`   Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
    console.log(`   API base    : http://localhost:${PORT}/api\n`)
  })
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err.message)
  process.exit(1)
})
