import { useState, useRef, useEffect, useCallback } from 'react'
import { useChatStore } from '../store/chatStore'
import { useProfileStore } from '../store/profileStore'
import AddToPlanModal from '../components/common/AddToPlanModal'
import foodsDb from '../data/foodsDb/index.js'
import mockRecipes from '../data/mockRecipes'

// ─── Constants ────────────────────────────────────────────────────────────────

const SUGGESTION_QUERIES = [
  'What should I eat with PCOD?',
  'Is white rice bad for diabetes?',
  'Give me a 7-day South Indian meal plan',
  'What Indian foods are rich in Iron?',
  'Navratri fasting food ideas?',
]

const QUICK_CHIPS = ['Show recipe', 'Add to plan', 'Nutrition details', 'More options']

// ─── All known foods/recipes for mention detection ───────────────────────────

const ALL_FOODS = [...foodsDb, ...mockRecipes]

// Build a brief health profile string to inject as AI context
function buildProfileContext(profile) {
  if (!profile) return ''
  const parts = []
  if (profile.name)   parts.push(`Name: ${profile.name}`)
  if (profile.age)    parts.push(`Age: ${profile.age}`)
  if (profile.gender) parts.push(`Gender: ${profile.gender}`)
  if (profile.weight_kg) parts.push(`Weight: ${profile.weight_kg}kg`)
  if (profile.height_cm) parts.push(`Height: ${profile.height_cm}cm`)
  if (profile.goal)   parts.push(`Goal: ${profile.goal}`)
  if (profile.diet_type) parts.push(`Diet: ${profile.diet_type}`)
  const conditions = (profile.conditions || []).filter(Boolean)
  if (conditions.length) parts.push(`Health conditions: ${conditions.join(', ')}`)
  const allergies = (profile.allergies || []).filter(Boolean)
  if (allergies.length) parts.push(`Allergies: ${allergies.join(', ')}`)
  if (!parts.length) return ''
  return `[User health profile — ${parts.join(' | ')}]\n`
}

// Scan AI text for food names we have in our DB → return matched items (max 3)
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

// ─── Real API call ────────────────────────────────────────────────────────────

async function callGroqAPI(message, history, profileContext = '') {
  const fullMessage = profileContext ? `${profileContext}${message}` : message
  const res = await fetch('/api/chat/public', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: fullMessage, history }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `API error ${res.status}`)
  }
  const json = await res.json()
  return json.data.content
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RecipeCardInline({ recipe }) {
  if (!recipe) return null
  return (
    <div className="mt-3 flex gap-3 bg-surface-container-low border border-surface-container-high rounded-2xl p-3 max-w-xs">
      <img
        src={recipe.image_url}
        alt={recipe.name}
        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
      />
      <div className="min-w-0">
        <p className="font-semibold text-on-surface text-sm leading-tight truncate">{recipe.name}</p>
        <p className="text-xs text-on-surface-variant mt-0.5 capitalize">{recipe.region} · {recipe.meal_type}</p>
        <div className="flex gap-2 mt-1.5 flex-wrap">
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {recipe.nutrition?.calories} kcal
          </span>
          <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
            Score {recipe.health_score}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Markdown renderer (no extra package needed) ─────────────────────────────

function renderInline(text, key) {
  // Split on **bold** and *italic* tokens
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
  const paragraphs = text.split(/\n\n+/)
  return (
    <div className="space-y-2 text-sm leading-relaxed text-on-surface">
      {paragraphs.map((para, i) => {
        const lines = para.split('\n').filter(l => l.trim() !== '')
        const isList = lines.every(l => /^[\*\-]\s/.test(l.trim()))

        if (isList) {
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

        return (
          <p key={i}>
            {lines.map((line, j) => (
              <span key={j}>
                {renderInline(line, j)}
                {j < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        )
      })}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
        A
      </div>
      <div className="bg-surface-container-lowest border border-surface-container-high rounded-3xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          <span className="w-2 h-2 rounded-full bg-primary-container animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-primary-container animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-primary-container animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message, onAddToPlan }) {
  const isUser = message.role === 'user'

  if (isUser) {
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

  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-white text-xs font-bold self-start mt-1">
        A
      </div>
      <div className="max-w-xs lg:max-w-md">
        <div className="bg-surface-container-lowest border border-surface-container-high rounded-3xl rounded-bl-sm px-4 py-3 shadow-sm">
          <MarkdownText text={message.content} />
          {message.recipeCard && <RecipeCardInline recipe={message.recipeCard} />}

          {/* Add-to-Plan chips for foods mentioned by AI */}
          {mentionedFoods.length > 0 && (
            <div className="mt-2.5 pt-2.5 border-t border-surface-container-high">
              <p className="text-[10px] text-on-surface-variant/60 mb-1.5 font-medium uppercase tracking-wide">Add to your meal plan</p>
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
  const [inputText, setInputText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [addToPlanItem, setAddToPlanItem] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Init Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-IN'
      recognition.interimResults = false
      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript
        setInputText(transcript)
        setIsListening(false)
      }
      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)
      recognitionRef.current = recognition
    }
  }, [])

  async function sendMessage(text) {
    const content = text.trim()
    if (!content || isTyping) return

    addMessage({ role: 'user', content })
    setInputText('')
    setTyping(true)

    try {
      const profileContext = buildProfileContext(profile)
      const reply = await callGroqAPI(content, messages, profileContext)
      const mentionedFoods = extractMentionedFoods(reply)
      addMessage({ role: 'bot', content: reply, mentionedFoods })
    } catch (err) {
      addMessage({ role: 'bot', content: `Sorry, I couldn't reach the AI service. Please check your connection and try again.\n\n(${err.message})` })
    } finally {
      setTyping(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    sendMessage(inputText)
  }

  function handleSuggestionClick(query) {
    sendMessage(query)
  }

  function handleChipClick(chip) {
    sendMessage(chip)
  }

  function toggleMic() {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in your browser.')
      return
    }
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* ── Left Panel ── */}
      <aside className="w-72 flex-shrink-0 bg-surface-container-low border-r border-surface-container-high flex flex-col">
        {/* Logo + heading */}
        <div className="px-5 pt-6 pb-4 border-b border-surface-container-high">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">psychology</span>
            </div>
            <span className="font-headline text-xl text-primary font-semibold">AarogyaAI</span>
          </div>
          <button
            onClick={clearHistory}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-xl py-2.5 text-sm font-medium hover:bg-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-base">add</span>
            New Chat
          </button>
        </div>

        {/* Suggestion cards */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4">
          <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wide mb-3">
            Suggested Questions
          </p>
          <div className="flex flex-col gap-2">
            {SUGGESTION_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => handleSuggestionClick(q)}
                className="text-left text-sm text-on-surface-variant bg-surface-container-lowest border border-surface-container-high rounded-xl px-3 py-2.5 hover:border-primary hover:text-primary transition-colors leading-snug"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Clear history */}
        <div className="px-4 py-4 border-t border-surface-container-high">
          <button
            onClick={clearHistory}
            className="w-full flex items-center justify-center gap-2 text-sm text-on-surface-variant hover:text-error transition-colors py-2 rounded-xl hover:bg-error/10"
          >
            <span className="material-symbols-outlined text-base">delete_sweep</span>
            Clear History
          </button>
        </div>
      </aside>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-6 py-4 border-b border-surface-container-high bg-surface-container-lowest flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg">psychology</span>
          </div>
          <div>
            <h1 className="font-headline text-lg font-semibold text-on-surface leading-tight">AarogyaAI</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
                Powered by Llama 3.1 · 8B
              </span>
              <span className="flex items-center gap-1 text-xs text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block animate-pulse" />
                Online
              </span>
            </div>
          </div>
        </header>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-8 py-6">
          {messages.length === 0 ? (
            // Welcome state
            <div className="flex flex-col items-center justify-center h-full text-center pb-16">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-primary text-4xl">auto_awesome</span>
              </div>
              <h2 className="font-headline text-3xl text-on-surface mb-2">Namaste!</h2>
              <p className="text-on-surface-variant text-base max-w-sm leading-relaxed">
                I am AarogyaAI, your personalised Indian nutrition assistant. Ask me anything about Indian food, health conditions, or meal planning.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-6 max-w-md">
                {SUGGESTION_QUERIES.slice(0, 3).map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSuggestionClick(q)}
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

        {/* Input area */}
        <div className="flex-shrink-0 border-t border-surface-container-high bg-surface-container-lowest px-4 md:px-8 py-4">
          <div className="max-w-2xl mx-auto">
            {/* Quick reply chips */}
            <div className="flex gap-2 mb-3 overflow-x-auto hide-scrollbar pb-1">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleChipClick(chip)}
                  className="flex-shrink-0 text-xs bg-surface-container-low border border-surface-container-high text-on-surface-variant rounded-full px-3 py-1.5 hover:border-primary hover:text-primary transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Text input row */}
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <div className="flex-1 bg-surface-container-low border border-surface-container-high rounded-2xl px-4 py-3 flex items-end gap-2 focus-within:border-primary transition-colors">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage(inputText)
                    }
                  }}
                  placeholder="Ask about Indian nutrition, recipes, or meal plans..."
                  rows={1}
                  className="flex-1 resize-none bg-transparent text-sm text-on-surface placeholder-on-surface-variant/50 outline-none leading-relaxed max-h-32 custom-scrollbar"
                  style={{ minHeight: '24px' }}
                />
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    isListening ? 'bg-error text-white' : 'text-on-surface-variant hover:text-primary hover:bg-primary/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">
                    {isListening ? 'mic' : 'mic_none'}
                  </span>
                </button>
              </div>
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center flex-shrink-0 hover:bg-primary-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-xl">send</span>
              </button>
            </form>

            {/* Disclaimer */}
            <p className="text-center text-xs text-on-surface-variant/60 mt-2.5">
              AarogyaAI can make mistakes. Always consult a nutritionist for medical advice.
            </p>
          </div>
        </div>
      </div>

      {/* Add to Plan modal — triggered by AI food suggestions */}
      {addToPlanItem && (
        <AddToPlanModal item={addToPlanItem} onClose={() => setAddToPlanItem(null)} />
      )}
    </div>
  )
}
