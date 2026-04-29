const { createClient } = require('redis')

let client = null
let isConnected = false

async function getRedisClient() {
  if (client && isConnected) return client

  client = createClient({
    socket: {
      host:              process.env.REDIS_HOST || 'localhost',
      port:              parseInt(process.env.REDIS_PORT || '6379'),
      reconnectStrategy: false,   // don't retry — Redis is optional
    },
    password: process.env.REDIS_PASSWORD || undefined,
  })

  client.on('error',  (err) => console.warn('⚠️  Redis error (cache unavailable):', err.message))
  client.on('connect', () => { isConnected = true; console.log('✅ Redis connected') })
  client.on('end',     () => { isConnected = false })

  try {
    await client.connect()
  } catch {
    console.warn('⚠️  Redis unavailable — running without cache')
    client = null
  }

  return client
}

// TTLs in seconds
const TTL = {
  RECIPE:         60 * 60,        // 1 hour
  RECIPE_LIST:    15 * 60,        // 15 min
  RECOMMENDATION: 6 * 60 * 60,   // 6 hours
  PROFILE:        30 * 60,        // 30 min
  DASHBOARD:      5 * 60,         // 5 min
}

async function cacheGet(key) {
  try {
    const c = await getRedisClient()
    if (!c) return null
    const val = await c.get(key)
    return val ? JSON.parse(val) : null
  } catch {
    return null
  }
}

async function cacheSet(key, value, ttl = TTL.RECIPE) {
  try {
    const c = await getRedisClient()
    if (!c) return
    await c.setEx(key, ttl, JSON.stringify(value))
  } catch {
    // silent — cache is best-effort
  }
}

async function cacheDel(key) {
  try {
    const c = await getRedisClient()
    if (!c) return
    await c.del(key)
  } catch {}
}

async function cacheDelPattern(pattern) {
  try {
    const c = await getRedisClient()
    if (!c) return
    const keys = await c.keys(pattern)
    if (keys.length) await c.del(keys)
  } catch {}
}

module.exports = { getRedisClient, cacheGet, cacheSet, cacheDel, cacheDelPattern, TTL }
