const axios   = require('axios')
const { v4: uuidv4 } = require('uuid')
const { pool } = require('../config/db')
const { createError } = require('../middleware/errorHandler')

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL   = 'llama-3.1-8b-instant'

// Strip any raw JSON action blocks the model might accidentally include
function cleanResponse(text) {
  return text
    .replace(/\{[\s\S]*?"action"[\s\S]*?\}/g, '')  // remove {"action": ...} blocks
    .replace(/\n{3,}/g, '\n\n')                      // collapse excess blank lines
    .trim()
}

const SYSTEM_PROMPT = `You are AarogyaAI, the health and nutrition assistant for AarogyaAnna — an Indian dietary guidance platform.
You are an expert in:
- Indian cuisine (all regional varieties: South Indian, North Indian, Bengali, Gujarati, etc.)
- ICMR-NIN 2020 nutritional guidelines (not US FDA)
- Ayurvedic food principles (doshas, seasonal eating, food synergies)
- Medical conditions common in India: diabetes, PCOD, hypertension, thyroid, anemia
- Food conflicts: iron+calcium, tannins+iron, oxalates, goitrogens, etc.

Always respond in a warm, knowledgeable tone. Use Indian food names and measurements. Provide specific, actionable advice.
Format your response using plain markdown: use **bold** for emphasis, and * bullet points for lists.
Never output raw JSON in your response. Describe everything naturally in text.
Keep responses concise — max 3 paragraphs unless a recipe or plan is requested.`

// ─── Create Session ───────────────────────────────────────────────────────────
async function createSession(req, res, next) {
  try {
    const id = uuidv4()
    const { title = 'New Chat' } = req.body
    await pool.query(
      'INSERT INTO chat_sessions (id, user_id, title) VALUES (?, ?, ?)',
      [id, req.user.id, title]
    )
    res.status(201).json({ success: true, data: { id, title } })
  } catch (err) {
    next(err)
  }
}

// ─── Get Session History ──────────────────────────────────────────────────────
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
  } catch (err) {
    next(err)
  }
}

// ─── List User Sessions ───────────────────────────────────────────────────────
async function listSessions(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, created_at, updated_at FROM chat_sessions WHERE user_id = ? ORDER BY updated_at DESC LIMIT 20',
      [req.user.id]
    )
    res.json({ success: true, data: rows })
  } catch (err) {
    next(err)
  }
}

// ─── Send Message ─────────────────────────────────────────────────────────────
async function sendMessage(req, res, next) {
  try {
    const { sessionId } = req.params
    const { message }   = req.body

    if (!message?.trim()) return next(createError(400, 'Message cannot be empty'))

    // Verify session ownership
    const [sessions] = await pool.query(
      'SELECT id FROM chat_sessions WHERE id = ? AND user_id = ?',
      [sessionId, req.user.id]
    )
    if (!sessions.length) return next(createError(404, 'Session not found'))

    // Load recent history (last 10 messages for context)
    const [history] = await pool.query(
      'SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY created_at DESC LIMIT 10',
      [sessionId]
    )
    const historyAsc = history.reverse()

    // Fetch user profile for personalisation
    const [profiles] = await pool.query(
      'SELECT age, gender, conditions, diet_type, health_goal, region FROM health_profiles WHERE user_id = ?',
      [req.user.id]
    )
    const profile = profiles[0]

    const userContext = profile
      ? `\n[User Context: ${profile.age}y ${profile.gender}, ${profile.diet_type}, conditions: ${JSON.stringify(profile.conditions)}, goal: ${profile.health_goal}, region: ${profile.region}]`
      : ''

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT + userContext },
      ...historyAsc.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ]

    // Call Groq API
    const groqRes = await axios.post(
      GROQ_API_URL,
      { model: GROQ_MODEL, messages, max_tokens: 1024, temperature: 0.7 },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    )

    const assistantContent = cleanResponse(groqRes.data.choices?.[0]?.message?.content || 'Sorry, I could not process that.')
    const tokensUsed = groqRes.data.usage?.total_tokens || null

    // Persist both messages
    const userMsgId = uuidv4()
    const asstMsgId = uuidv4()
    await pool.query(
      'INSERT INTO chat_messages (id, session_id, role, content) VALUES (?, ?, ?, ?), (?, ?, ?, ?)',
      [userMsgId, sessionId, 'user', message, asstMsgId, sessionId, 'assistant', assistantContent]
    )
    if (tokensUsed) {
      await pool.query('UPDATE chat_messages SET tokens_used = ? WHERE id = ?', [tokensUsed, asstMsgId])
    }
    await pool.query("UPDATE chat_sessions SET updated_at = datetime('now') WHERE id = ?", [sessionId])

    res.json({
      success: true,
      data: {
        role:       'assistant',
        content:    assistantContent,
        session_id: sessionId,
      },
    })
  } catch (err) {
    if (err.response?.status === 429) return next(createError(429, 'AI rate limit reached — try again in a moment'))
    if (err.response?.status === 401) return next(createError(500, 'AI service configuration error'))
    next(err)
  }
}

// ─── Delete Session ───────────────────────────────────────────────────────────
async function deleteSession(req, res, next) {
  try {
    const { sessionId } = req.params
    await pool.query('DELETE FROM chat_sessions WHERE id = ? AND user_id = ?', [sessionId, req.user.id])
    res.json({ success: true, message: 'Session deleted' })
  } catch (err) {
    next(err)
  }
}

// ─── Public Chat (no login required) ─────────────────────────────────────────
async function publicChat(req, res, next) {
  try {
    const { message, history = [] } = req.body
    if (!message?.trim()) return next(createError(400, 'Message cannot be empty'))

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-10).map((m) => ({ role: m.role === 'bot' ? 'assistant' : m.role, content: m.content })),
      { role: 'user', content: message },
    ]

    const groqRes = await axios.post(
      GROQ_API_URL,
      { model: GROQ_MODEL, messages, max_tokens: 1024, temperature: 0.7 },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    )

    const content = cleanResponse(groqRes.data.choices?.[0]?.message?.content || 'Sorry, I could not process that.')
    res.json({ success: true, data: { role: 'assistant', content } })
  } catch (err) {
    if (err.response?.status === 429) return next(createError(429, 'AI rate limit reached — try again in a moment'))
    if (err.response?.status === 401) return next(createError(500, 'AI service configuration error'))
    next(err)
  }
}

module.exports = { createSession, getSession, listSessions, sendMessage, deleteSession, publicChat }
