import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { getCurrentSeason, getUpcomingFestival } from '../../utils/seasonDetector'

export default function TopNav({ onSearch }) {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [searchVal, setSearchVal] = useState('')
  const season = getCurrentSeason()
  const festival = getUpcomingFestival()

  const seasonConfig = {
    summer: { icon: 'wb_sunny', label: 'Summer: Cooling Foods Recommended', color: 'bg-secondary-fixed/30 text-secondary border-secondary/20' },
    monsoon: { icon: 'water_drop', label: 'Monsoon: Immunity Boosters Recommended', color: 'bg-primary-fixed/40 text-primary border-primary/20' },
    winter: { icon: 'ac_unit', label: 'Winter Season: Warming Foods Recommended', color: 'bg-secondary-container/20 text-on-secondary-container border-secondary-container/30' },
    spring: { icon: 'eco', label: 'Spring: Light & Fresh Foods Recommended', color: 'bg-primary-fixed/30 text-primary border-primary/20' },
  }
  const sc = seasonConfig[season] || seasonConfig.winter

  let debounceTimer
  const handleSearch = (e) => {
    const val = e.target.value
    setSearchVal(val)
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => onSearch?.(val), 300)
  }

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 z-40 bg-surface/70 backdrop-blur-md border-b border-outline-variant/15 flex items-center justify-between px-8 gap-4">
      {/* Left: Season indicator + search */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {festival ? (
          <div className="flex items-center gap-2 bg-secondary-container/20 text-on-secondary-container px-3 py-1 rounded-full border border-secondary-container/30 shrink-0">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>celebration</span>
            <span className="text-[10px] font-bold uppercase tracking-tight">{festival} Mode Active</span>
          </div>
        ) : (
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border shrink-0 ${sc.color}`}>
            <span className="material-symbols-outlined text-sm animate-pulse-slow">{sc.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-tight">{sc.label}</span>
          </div>
        )}

        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
          <input
            type="text"
            value={searchVal}
            onChange={handleSearch}
            placeholder="Search recipes, ingredients, nutrients…"
            className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Right: actions + user */}
      <div className="flex items-center gap-4 shrink-0">
        <button className="text-on-surface-variant hover:text-primary transition-colors" title="Language">
          <span className="material-symbols-outlined text-[22px]">language</span>
        </button>
        <button className="text-on-surface-variant hover:text-primary transition-colors relative" title="Notifications">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border-2 border-surface" />
        </button>

        <div className="h-8 w-px bg-outline-variant/30" />

        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="text-right">
            <p className="text-xs font-bold text-on-surface leading-none">{user?.name || 'Guest'}</p>
            <p className="text-[10px] text-on-surface-variant mt-0.5">
              {user?.subscription || 'Free Plan'}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary-container border-2 border-primary-fixed flex items-center justify-center">
            <span className="text-on-primary-container text-sm font-bold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
        </button>
      </div>
    </header>
  )
}
