import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/dashboard', icon: 'dashboard', label: 'Home' },
  { to: '/recipes', icon: 'restaurant_menu', label: 'Recipes' },
  { to: '/meal-planner', icon: 'calendar_today', label: 'Planner' },
  { to: '/chatbot', icon: 'smart_toy', label: 'AI' },
  { to: '/profile', icon: 'account_circle', label: 'Profile' },
]

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl border-t border-outline-variant/20 flex md:hidden">
      {tabs.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-3 gap-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-primary' : 'text-on-surface-variant'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`material-symbols-outlined text-[24px] transition-all ${isActive ? 'scale-110' : ''}`}
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {icon}
              </span>
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
