const axios   = require('axios')
const { v4: uuidv4 } = require('uuid')
const { pool } = require('../config/db')
const { createError } = require('../middleware/errorHandler')

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

// Upgraded model: 70B is dramatically better at reasoning, meal planning,
// following structured output instructions, and NOT repeating itself.
const GROQ_MODEL = 'llama-3.3-70b-versatile'

// ─── Action block parser ───────────────────────────────────────────────────────
// AI embeds a hidden <aa_actions>[...]</aa_actions> block when it needs to
// modify the meal plan. We strip it from display text and return it separately.
function parseActions(text) {
  const match = text.match(/<aa_actions>([\s\S]*?)<\/aa_actions>/i)
  if (!match) return { cleanText: text.trim(), actions: [] }

  const cleanText = text.replace(/<aa_actions>[\s\S]*?<\/aa_actions>/gi, '').trim()
  try {
    const actions = JSON.parse(match[1].trim())
    return { cleanText, actions: Array.isArray(actions) ? actions : [] }
  } catch {
    return { cleanText, actions: [] }
  }
}

// ─── System Prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are AarogyaAI — the intelligent nutrition assistant inside AarogyaAnna, an Indian dietary platform.

## YOUR EXPERTISE
- All regional Indian cuisines: South Indian, North Indian, Bengali, Gujarati, Rajasthani, Goan, Kashmiri, etc.
- ICMR-NIN 2020 guidelines (Indian RDAs, NOT US FDA values)
- Ayurvedic principles: doshas, seasonal eating, food synergies
- Medical nutrition therapy for Indian conditions: T2 diabetes, PCOD, hypothyroid, hypertension, anemia, GERD
- Food interactions: iron+calcium inhibition, tannins, oxalates, goitrogens, nightshades

## RESPONSE RULES
1. **Never start with "Namaste" or any Hindi greeting.** Start directly with the answer or a short English opener.
2. **Never repeat yourself.** Check the conversation history — if you already suggested a food, suggest something different this time.
3. Be specific and actionable. Give actual quantities (e.g., "1 cup cooked ragi mudde" not just "millets").
4. Use Indian food names naturally. Mention regional variations when relevant.
5. Keep answers concise — 2-3 paragraphs for questions, structured lists for meal plans.
6. Vary your meal plan suggestions every time — use different dishes, grains, and proteins.

## MEAL PLAN ACTIONS (CRITICAL)
The app has a live meal planner. You can ADD or REMOVE meals by outputting an action block at the very end of your response. The block is invisible to the user but the app reads it to update the planner. NEVER claim you removed or added something without including the block.

### ADD meals (when user asks to add/save a meal plan):
<aa_actions>[
  {"type":"ADD_MEAL","day":"Mon","slot":"breakfast","name":"Idli","cal":116,"protein":4,"emoji":"🫓"},
  {"type":"ADD_MEAL","day":"Mon","slot":"lunch","name":"Brown Rice with Dal","cal":285,"protein":9,"emoji":"🍚"}
]</aa_actions>

### CLEAR one specific day (user says "remove Monday", "clear Tuesday", "delete Monday plan"):
<aa_actions>[{"type":"CLEAR_DAY","day":"Mon"}]</aa_actions>

### CLEAR multiple days:
<aa_actions>[{"type":"CLEAR_DAY","day":"Mon"},{"type":"CLEAR_DAY","day":"Tue"}]</aa_actions>

### CLEAR the entire week (user says "remove all", "clear everything", "delete whole week", "empty the planner"):
<aa_actions>[{"type":"CLEAR_WEEK"}]</aa_actions>

Day keys: Mon Tue Wed Thu Fri Sat Sun
Slot keys: breakfast  morning_snack  lunch  snack  dinner  post_dinner

Always include the action block for any add/remove/clear request — the planner will not update otherwise.

## TODAY'S DATE CONTEXT
Use the current day of the week to make meal suggestions seasonally and contextually relevant.`

// ─── Create Session ────────────────────────────────────────────────────────────
async function createSession(req, res, next) {
  try {
    const id = uuidv4()
    const { title = 'New Chat' } = req.body
    await pool.query(
      'INSERT INTO chat_sessions (id, user_id, title) VALUES (?, ?, ?)',
      [id, req.user.id, title]
    )
    res.status(201).json({ success: true, data: { id, title } })
  } catch (err) { next(err) }
}

// ─── Get Session History ───────────────────────────────────────────────────────
async function getSession(req, res, next) {
  try {
    const { sessionId } = req.params
    const [sessions] = await pool.query(
      'SELECT id FROM chat_sessions WHERE id = ? AND user_id = ?',
      [sessionId, req.user.id]
    )
    if (!sessions.length) return next(createError(404, 'Session not found'))

    const [messages] = await pool.query(
      'SELECT role, content, created_at FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC',
      [sessionId]
    )
    res.json({ success: true, data: messages })
  } catch (err) { next(err) }
}

// ─── List Sessions ─────────────────────────────────────────────────────────────
async function listSessions(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, created_at, updated_at FROM chat_sessions WHERE user_id = ? ORDER BY updated_at DESC LIMIT 20',
      [req.user.id]
    )
    res.json({ success: true, data: rows })
  } catch (err) { next(err) }
}

// ─── Send Message (authenticated) ─────────────────────────────────────────────
async function sendMessage(req, res, next) {
  try {
    const { sessionId } = req.params
    const { message } = req.body

    if (!message?.trim()) return next(createError(400, 'Message cannot be empty'))

    const [sessions] = await pool.query(
      'SELECT id FROM chat_sessions WHERE id = ? AND user_id = ?',
      [sessionId, req.user.id]
    )
    if (!sessions.length) return next(createError(404, 'Session not found'))

    const [history] = await pool.query(
      'SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY created_at DESC LIMIT 12',
      [sessionId]
    )

    const [profiles] = await pool.query(
      'SELECT age, gender, weight_kg, height_cm, conditions, diet_type, health_goal, region FROM health_profiles WHERE user_id = ?',
      [req.user.id]
    )
    const profile = profiles[0]
    const userContext = profile
      ? `\n[User: ${profile.age}y ${profile.gender}, ${profile.weight_kg}kg/${profile.height_cm}cm, diet:${profile.diet_type}, goal:${profile.health_goal}, region:${profile.region}, conditions:${JSON.stringify(profile.conditions)}]`
      : ''

    const groqRes = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + userContext },
          ...history.reverse().map((m) => ({ role: m.role, content: m.content })),
          { role: 'user', content: message },
        ],
        max_tokens: 1500,
        temperature: 0.8,
      },
      {
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        timeout: 30000,
      }
    )

    const raw = groqRes.data.choices?.[0]?.message?.content || 'Sorry, I could not process that.'
    const { cleanText, actions } = parseActions(raw)
    const tokensUsed = groqRes.data.usage?.total_tokens || null

    const userMsgId = uuidv4()
    const asstMsgId = uuidv4()
    await pool.query(
      'INSERT INTO chat_messages (id, session_id, role, content) VALUES (?, ?, ?, ?), (?, ?, ?, ?)',
      [userMsgId, sessionId, 'user', message, asstMsgId, sessionId, 'assistant', cleanText]
    )
    if (tokensUsed) {
      await pool.query('UPDATE chat_messages SET tokens_used = ? WHERE id = ?', [tokensUsed, asstMsgId])
    }
    await pool.query("UPDATE chat_sessions SET updated_at = datetime('now') WHERE id = ?", [sessionId])

    res.json({ success: true, data: { role: 'assistant', content: cleanText, actions } })
  } catch (err) {
    if (err.response?.status === 429) return next(createError(429, 'AI rate limit reached — try again in a moment'))
    if (err.response?.status === 401) return next(createError(500, 'AI service configuration error'))
    next(err)
  }
}

// ─── Delete Session ────────────────────────────────────────────────────────────
async function deleteSession(req, res, next) {
  try {
    const { sessionId } = req.params
    await pool.query('DELETE FROM chat_sessions WHERE id = ? AND user_id = ?', [sessionId, req.user.id])
    res.json({ success: true, message: 'Session deleted' })
  } catch (err) { next(err) }
}

// ─── Public Chat (no login, used by frontend) ─────────────────────────────────
async function publicChat(req, res, next) {
  try {
    const { message, history = [], profile: clientProfile } = req.body
    if (!message?.trim()) return next(createError(400, 'Message cannot be empty'))

    // Build user context from client-sent profile (for public/unauthenticated usage)
    let userContext = ''
    if (clientProfile) {
      const p = clientProfile
      const parts = []
      if (p.name)       parts.push(`Name:${p.name}`)
      if (p.age)        parts.push(`Age:${p.age}y`)
      if (p.gender)     parts.push(`Gender:${p.gender}`)
      if (p.weight_kg)  parts.push(`Weight:${p.weight_kg}kg`)
      if (p.height_cm)  parts.push(`Height:${p.height_cm}cm`)
      if (p.goal)       parts.push(`Goal:${p.goal}`)
      if (p.diet_type)  parts.push(`Diet:${p.diet_type}`)
      const conds = (p.conditions || []).filter(Boolean)
      if (conds.length) parts.push(`Conditions:${conds.join(',')}`)
      const allergies = (p.allergies || []).filter(Boolean)
      if (allergies.length) parts.push(`Allergies:${allergies.join(',')}`)
      if (parts.length) userContext = `\n[User: ${parts.join(' | ')}]`
    }

    const groqRes = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + userContext },
          ...history.slice(-12).map((m) => ({
            role: m.role === 'bot' ? 'assistant' : m.role,
            content: m.content,
          })),
          { role: 'user', content: message },
        ],
        max_tokens: 1500,
        temperature: 0.8,
      },
      {
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        timeout: 30000,
      }
    )

    const raw = groqRes.data.choices?.[0]?.message?.content || 'Sorry, I could not process that.'
    const { cleanText, actions } = parseActions(raw)

    res.json({ success: true, data: { role: 'assistant', content: cleanText, actions } })
  } catch (err) {
    if (err.response?.status === 429) return next(createError(429, 'AI rate limit reached — try again in a moment'))
    if (err.response?.status === 401) return next(createError(500, 'AI service configuration error'))
    next(err)
  }
}

module.exports = { createSession, getSession, listSessions, sendMessage, deleteSession, publicChat }
