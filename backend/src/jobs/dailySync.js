const cron = require('node-cron')
const { runSync } = require('../services/syncService')

/**
 * Daily sync job — runs at 2:00 AM IST every day
 * IST = UTC+5:30, so cron is set to UTC 20:30 (prev day)
 * Using TZ environment variable approach for clarity
 */
function startCronJobs() {
  // Daily at 2:00 AM IST (20:30 UTC prev day)
  cron.schedule('30 20 * * *', async () => {
    console.log(`[CRON] ${new Date().toISOString()} — Starting daily data sync`)
    try {
      await runSync('mealdb')
    } catch (err) {
      console.error('[CRON] Daily sync failed:', err.message)
    }
  }, { timezone: 'UTC' })

  // Weekly USDA sync — every Sunday at 3:00 AM IST (21:30 UTC Saturday)
  cron.schedule('30 21 * * 0', async () => {
    console.log(`[CRON] ${new Date().toISOString()} — Starting weekly USDA sync`)
    try {
      await runSync('usda')
    } catch (err) {
      console.error('[CRON] USDA sync failed:', err.message)
    }
  }, { timezone: 'UTC' })

  console.log('✅ Cron jobs registered (MealDB daily 2AM IST, USDA weekly Sunday 3AM IST)')
}

module.exports = { startCronJobs }
