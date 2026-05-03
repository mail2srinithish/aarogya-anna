import { useState, useRef, useEffect, useCallback } from 'react'
import { useChatStore } from '../store/chatStore'
import { useProfileStore } from '../store/profileStore'
import { useMealPlanStore, DAYS, DAY_FULL, MEAL_SLOTS_POOL } from '../store/mealPlanStore'
import AddToPlanModal from '../components/common/AddToPlanModal'
import foodsDb from '../data/foodsDb/index.js'
import mockRecipes from '../data/mockRecipes'

// ─── Constants ────────────────────────────────────────────────────────────────

const SUGGESTION_QUERIES = [
  'Give me a Monday meal plan for muscle gain',
  'What Indian foods are rich in Iron?',
  'Is white rice bad for diabetes?',
  'Best foods for PCOD / hormonal balance?',
  'Give me a high-protein South Indian breakfast',
  'What to eat post-workout (Indian foods)?',
]

const ALL_FOODS = [...foodsDb, ...mockRecipes]

// ─── Day / slot normalisation ─────────────────────────────────────────────────

const DAY_NORM = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
}
const SLOT_NORM = {
  breakfast: 'breakfast',
  'morning snack': 'morning_snack', morning_snack: 'morning_snack', 'pre-workout': 'morning_snack',
  'post-workout': 'morning_snack', 'post workout': 'morning_snack',
  lunch: 'lunch',
  snack: 'snack', 'evening snack': 'snack', 'afternoon snack': 'snack',
  dinner: 'dinner',
  'post dinner': 'post_dinner', post_dinner: 'post_dinner', bedtime: 'post_dinner', 'before bed': 'post_dinner',
}

function normDay(d) { return DAY_NORM[(d || '').toLowerCase()] || null }
function normSlot(s) { return SLOT_NORM[(s || '').toLowerCase().replace(/-/g, ' ')] || 'lunch' }

// ─── Food matching ────────────────────────────────────────────────────────────

function findFoodByName(name) {
  if (!name) return null
  const q = name.toLowerCase().replace(/\s*\([^)]*\)/g, '').trim()
  return ALL_FOODS.find((f) => {
    const fn = (f.name || '').toLowerCase().replace(/\s*\([^)]*\)/g, '').trim()
    return fn === q || fn.includes(q) || q.includes(fn)
  }) || null
}

function makeAIFood(action) {
  return {
    id: `ai_${(action.name || 'food').toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
    name: action.name || 'Food item',
    food_emoji: action.emoji || '🍽️',
    category: 'dish',
    source: 'ai_suggestion',
    meal_type: [normSlot(action.slot)],
    diet_type: ['vegetarian'],
    health_tags: [],
    health_score: 70,
    rating: 4.0,
    reviews: 0,
    nutrition: {
      calories: action.cal || 0,
      protein_g: action.protein || 0,
      carbs_g: 0, fat_g: 0, fiber_g: 0,
      sodium_mg: 0, sugar_g: 0,
    },
  }
}

// ─── Profile context builder ──────────────────────────────────────────────────

function buildProfilePayload(profile) {
  if (!profile) return null
  return {
    name:       profile.name,
    age:        profile.age,
    gender:     profile.gender,
    weight_kg:  profile.weight_kg,
    height_cm:  profile.height_cm,
    goal:       profile.goal,
    diet_type:  profile.diet_type,
    conditions: profile.conditions,
    allergies:  profile.allergies,
  }
}

// ─── Scan AI text for food names ──────────────────────────────────────────────

function extractMentionedFoods(text) {
  if (!text) return []
  const lower = text.toLowerCase()
  const found = []
  const seen = new Set()
  for (const item of ALL_FOODS) {
    if (seen.has(item.id)) continue
    const name = (item.name || '').toLowerCase()
    if (name.length > 3 && lower.includes(name)) {
      found.push(item)
      seen.add(item.id)
      if (found.length >= 3) break
    }
  }
  return found
}

// ─── API call ─────────────────────────────────────────────────────────────────

async function callAI(message, history, profile) {
  const res = await fetch('/api/chat/public', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, profile }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `API error ${res.status}`)
  }
  const json = await res.json()
  return json.data // { role, content, actions }
}

// ─── Markdown renderer ────────────────────────────────────────────────────────

function renderInline(text, key) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*)/g)
  return (
    <span key={key}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**'))
          return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
        if (part.startsWith('*') && part.endsWith('*'))
          return <em key={i}>{part.slice(1, -1)}</em>
        return part
      })}
    </span>
  )
}

function MarkdownText({ text }) {
  return (
    <div className="space-y-2 text-sm leading-relaxed text-on-surface">
      {text.split(/\n\n+/).map((para, i) => {
        const lines = para.split('\n').filter((l) => l.trim())
        if (!lines.length) return null

        // numbered list
        if (lines.every((l) => /^\d+[\.\)]\s/.test(l.trim()))) {
          return (
            <ol key={i} className="space-y-1 ml-1 list-decimal list-inside">
              {lines.map((line, j) => (
                <li key={j} className="text-sm">{renderInline(line.replace(/^\d+[\.\)]\s+/, ''), j)}</li>
              ))}
            </ol>
          )
        }

        // bullet list
        if (lines.every((l) => /^[\*\-]\s/.test(l.trim()))) {
          return (
            <ul key={i} className="space-y-1 ml-1">
              {lines.map((line, j) => (
                <li key={j} className="flex gap-2 items-start">
                  <span className="text-primary font-bold mt-0.5 flex-shrink-0">•</span>
                  <span>{renderInline(line.replace(/^[\*\-]\s+/, ''), j)}</span>
                </li>
              ))}
            </ul>
          )
        }

        // section heading (###)
        if (lines.length === 1 && lines[0].startsWith('###')) {
          return <p key={i} className="font-semibold text-on-surface mt-1">{lines[0].replace(/^###\s*/, '')}</p>
        }
        if (lines.length === 1 && lines[0].startsWith('##')) {
          return <p key={i} className="font-bold text-primary mt-1">{lines[0].replace(/^##\s*/, '')}</p>
        }

        return (
          <p key={i}>
            {lines.map((line, j) => (
              <span key={j}>{renderInline(line, j)}{j < lines.length - 1 && <br />}</span>
            ))}
          </p>
        )
      })}
    </div>
  )
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">A</div>
      <div className="bg-surface-container-lowest border border-surface-container-high rounded-3xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          {[0, 150, 300].map((delay) => (
            <span key={delay} className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Executed-actions confirmation card ───────────────────────────────────────

function ActionConfirmCard({ actions }) {
  if (!actions?.length) return null

  // Separate clears from adds
  const clearWeek  = actions.some((a) => a.type === 'CLEAR_WEEK')
  const clearedDays = actions.filter((a) => a.type === 'CLEAR_DAY')
  const addedMeals  = actions.filter((a) => a.type === 'ADD_MEAL')

  const isRemove = clearWeek || clearedDays.length > 0
  const borderColor = isRemove ? 'border-error/20 bg-error/5' : 'border-primary/20 bg-primary/5'
  const iconColor   = isRemove ? 'text-error' : 'text-primary'
  const icon        = isRemove ? 'delete_sweep' : 'check_circle'
  const title       = isRemove
    ? clearWeek ? 'Entire week cleared from Meal Plan' : `Cleared from Meal Plan`
    : 'Added to your Meal Plan'

  // Group added meals by day
  const grouped = {}
  addedMeals.forEach((a) => {
    if (!grouped[a.day]) grouped[a.day] = []
    grouped[a.day].push(a)
  })

  return (
    <div className={`mt-3 rounded-2xl border p-3 ${borderColor}`}>
      <div className="flex items-center gap-1.5 mb-2">
        <span className={`material-symbols-outlined text-[16px] ${iconColor}`}>{icon}</span>
        <p className={`text-xs font-semibold ${iconColor}`}>{title}</p>
      </div>

      {/* Cleared days */}
      {clearedDays.length > 0 && !clearWeek && (
        <div className="flex flex-wrap gap-1 mb-1">
          {clearedDays.map((a, i) => (
            <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-error/10 text-error">
              {DAY_FULL[DAYS.indexOf(a.day)] || a.day}
            </span>
          ))}
        </div>
      )}

      {/* Added meals grouped by day */}
      {Object.entries(grouped).map(([day, items]) => {
        const dayFull = DAY_FULL[DAYS.indexOf(day)] || day
        return (
          <div key={day} className="mb-2 last:mb-0">
            <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1">{dayFull}</p>
            <div className="flex flex-wrap gap-1">
              {items.map((item, i) => {
                const slot = MEAL_SLOTS_POOL.find((s) => s.id === normSlot(item.slot))
                return (
                  <span key={i} className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
                    <span>{item.emoji || '🍽️'}</span>
                    <span>{item.name}</span>
                    {slot && <span className="text-primary/60">· {slot.label}</span>}
                    {item.cal > 0 && <span className="text-on-surface-variant/60">· {item.cal} kcal</span>}
                  </span>
                )
              })}
            </div>
          </div>
        )
      })}

      <p className="text-[10px] text-on-surface-variant/50 mt-1.5">
        {isRemove ? 'Check Meal Planner to confirm →' : 'Go to Meal Planner to see the full plan →'}
      </p>
    </div>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message, onAddToPlan }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-primary text-white rounded-3xl rounded-br-sm px-4 py-2.5 max-w-xs lg:max-w-md shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
          <p className="text-xs opacity-60 mt-1 text-right">
            {new Date(message.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    )
  }

  const mentionedFoods = message.mentionedFoods || []
  const executedActions = message.executedActions || []

  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-white text-xs font-bold self-start mt-1">A</div>
      <div className="max-w-xs lg:max-w-md">
        <div className="bg-surface-container-lowest border border-surface-container-high rounded-3xl rounded-bl-sm px-4 py-3 shadow-sm">
          <MarkdownText text={message.content} />

          {/* Executed actions confirmation */}
          {executedActions.length > 0 && <ActionConfirmCard actions={executedActions} />}

          {/* Add-to-Plan chips for foods mentioned by AI */}
          {mentionedFoods.length > 0 && executedActions.length === 0 && (
            <div className="mt-2.5 pt-2.5 border-t border-surface-container-high">
              <p className="text-[10px] text-on-surface-variant/60 mb-1.5 font-medium uppercase tracking-wide">
                Add to your meal plan
              </p>
              <div className="flex flex-wrap gap-1.5">
                {mentionedFoods.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => onAddToPlan(food)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20 transition-colors font-medium"
                  >
                    <span>{food.food_emoji || '🍽️'}</span>
                    {food.name}
                    <span className="material-symbols-outlined text-[12px]">add</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-on-surface-variant/60 mt-1.5">
            {new Date(message.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChatbotPage() {
  const { messages, isTyping, addMessage, setTyping, clearHistory } = useChatStore()
  const { profile } = useProfileStore()
  const { addItem, clearDay, resetWeek } = useMealPlanStore()

  const [inputText, setInputText]   = useState('')
  const [isListening, setIsListening] = useState(false)
  const [addToPlanItem, setAddToPlanItem] = useState(null)

  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Web Speech API init
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const r = new SR()
    r.lang = 'en-IN'
    r.interimResults = false
    r.onresult  = (e) => { setInputText(e.results[0][0].transcript); setIsListening(false) }
    r.onerror   = () => setIsListening(false)
    r.onend     = () => setIsListening(false)
    recognitionRef.current = r
  }, [])

  // ── Execute AI actions against the meal plan store ────────────────────────
  const executeActions = useCallback((actions) => {
    if (!actions?.length) return []
    const executed = []

    for (const action of actions) {
      // ── Clear entire week ───────────────────────────────────────────────
      if (action.type === 'CLEAR_WEEK') {
        resetWeek()
        executed.push({ type: 'CLEAR_WEEK', label: 'Entire week cleared' })
        continue
      }

      // ── Clear one day ───────────────────────────────────────────────────
      if (action.type === 'CLEAR_DAY') {
        const day = normDay(action.day)
        if (!day) continue
        clearDay(day)
        const dayFull = DAY_FULL[DAYS.indexOf(day)] || day
        executed.push({ type: 'CLEAR_DAY', day, label: `${dayFull} cleared` })
        continue
      }

      // ── Add meal ────────────────────────────────────────────────────────
      if (action.type === 'ADD_MEAL') {
        const day  = normDay(action.day)
        const slot = normSlot(action.slot)
        if (!day) continue
        const food = findFoodByName(action.name) || makeAIFood(action)
        addItem(day, slot, food, action.portion_g || 250)
        executed.push({ ...action, day, slot })
      }
    }
    return executed
  }, [addItem, clearDay, resetWeek])

  // ── Send message ──────────────────────────────────────────────────────────
  async function sendMessage(text) {
    const content = text.trim()
    if (!content || isTyping) return

    addMessage({ role: 'user', content })
    setInputText('')
    setTyping(true)

    try {
      const profilePayload = buildProfilePayload(profile)
      const data = await callAI(content, messages, profilePayload)

      // Execute any meal plan actions the AI returned
      const executedActions = executeActions(data.actions)

      const mentionedFoods = executedActions.length === 0
        ? extractMentionedFoods(data.content)
        : []

      addMessage({ role: 'bot', content: data.content, mentionedFoods, executedActions })
    } catch (err) {
      addMessage({
        role: 'bot',
        content: `Sorry, I couldn't reach the AI service. Please check your connection.\n\n(${err.message})`,
      })
    } finally {
      setTyping(false)
    }
  }

  function handleSubmit(e) { e.preventDefault(); sendMessage(inputText) }

  return (
    <div className="flex h-screen bg-surface overflow-hidden">

      {/* ── Left Sidebar ── */}
      <aside className="w-72 flex-shrink-0 bg-surface-container-low border-r border-surface-container-high flex flex-col">
        <div className="px-5 pt-6 pb-4 border-b border-surface-container-high">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">psychology</span>
            </div>
            <span className="font-headline text-xl text-primary font-semibold">AarogyaAI</span>
          </div>
          <button
            onClick={clearHistory}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-xl py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-base">add</span>
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4">
          <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wide mb-3">Try asking</p>
          <div className="flex flex-col gap-2">
            {SUGGESTION_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-left text-sm text-on-surface-variant bg-surface-container-lowest border border-surface-container-high rounded-xl px-3 py-2.5 hover:border-primary hover:text-primary transition-colors leading-snug"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Capability badges */}
        <div className="px-4 py-3 border-t border-surface-container-high space-y-1.5">
          <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-wide font-medium mb-2">Capabilities</p>
          {[
            { icon: 'calendar_add_on', label: 'Adds meals to your planner' },
            { icon: 'restaurant_menu', label: '1,000+ Indian food database' },
            { icon: 'psychology',      label: 'Llama 3.3 · 70B reasoning' },
            { icon: 'local_hospital',  label: 'Condition-aware advice' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-primary text-[14px]">{icon}</span>
              {label}
            </div>
          ))}
          <button
            onClick={clearHistory}
            className="w-full flex items-center justify-center gap-2 text-xs text-on-surface-variant hover:text-error transition-colors py-1.5 mt-2 rounded-xl hover:bg-error/10"
          >
            <span className="material-symbols-outlined text-sm">delete_sweep</span>
            Clear History
          </button>
        </div>
      </aside>

      {/* ── Chat Panel ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="flex items-center gap-3 px-6 py-4 border-b border-surface-container-high bg-surface-container-lowest flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg">psychology</span>
          </div>
          <div>
            <h1 className="font-headline text-lg font-semibold text-on-surface leading-tight">AarogyaAI</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
                Llama 3.3 · 70B
              </span>
              <span className="flex items-center gap-1 text-xs text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block animate-pulse" />
                Online
              </span>
              <span className="text-xs text-on-surface-variant/60 bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                Can edit meal plan
              </span>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-8 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center pb-16">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-primary text-4xl">auto_awesome</span>
              </div>
              <h2 className="font-headline text-3xl text-on-surface mb-2">Hello! I'm AarogyaAI</h2>
              <p className="text-on-surface-variant text-base max-w-sm leading-relaxed">
                Your personalised Indian nutrition assistant. Ask me for a meal plan and I'll add it directly to your planner.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-6 max-w-lg">
                {SUGGESTION_QUERIES.slice(0, 4).map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-sm bg-surface-container-low border border-surface-container-high rounded-full px-4 py-2 text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} onAddToPlan={setAddToPlanItem} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t border-surface-container-high bg-surface-container-lowest px-4 md:px-8 py-4">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <div className="flex-1 bg-surface-container-low border border-surface-container-high rounded-2xl px-4 py-3 flex items-end gap-2 focus-within:border-primary transition-colors">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(inputText) } }}
                  placeholder="Ask about nutrition, meal plans, or say 'add to Monday'…"
                  rows={1}
                  className="flex-1 resize-none bg-transparent text-sm text-on-surface placeholder-on-surface-variant/50 outline-none leading-relaxed max-h-32 custom-scrollbar"
                  style={{ minHeight: '24px' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!recognitionRef.current) return alert('Speech not supported in your browser.')
                    if (isListening) { recognitionRef.current.stop(); setIsListening(false) }
                    else { recognitionRef.current.start(); setIsListening(true) }
                  }}
                  className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${isListening ? 'bg-error text-white' : 'text-on-surface-variant hover:text-primary hover:bg-primary/10'}`}
                >
                  <span className="material-symbols-outlined text-lg">{isListening ? 'mic' : 'mic_none'}</span>
                </button>
              </div>
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center flex-shrink-0 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-xl">send</span>
              </button>
            </form>
            <p className="text-center text-xs text-on-surface-variant/60 mt-2.5">
              AarogyaAI can make mistakes. Consult a nutritionist for medical advice.
            </p>
          </div>
        </div>
      </div>

      {/* Add-to-Plan modal */}
      {addToPlanItem && <AddToPlanModal item={addToPlanItem} onClose={() => setAddToPlanItem(null)} />}
    </div>
  )
}
