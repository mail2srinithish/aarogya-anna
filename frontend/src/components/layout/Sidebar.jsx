import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const navItems = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/recipes', icon: 'restaurant_menu', label: 'Explore Recipes' },
  { to: '/meal-planner', icon: 'calendar_today', label: 'Meal Planner' },
  { to: '/chatbot', icon: 'smart_toy', label: 'AarogyaAI' },
  { to: '/food-combinations', icon: 'join_inner', label: 'Food Synergy' },
  { to: '/supplements', icon: 'fitness_center', label: 'Supplements' },
  { to: '/profile', icon: 'account_circle', label: 'My Profile' },
]

const adminItems = [
  { to: '/admin', icon: 'admin_panel_settings', label: 'Admin Panel' },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant/10 flex flex-col py-6 z-50">
      {/* Logo */}
      <div className="px-6 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
            <span className="font-headline font-bold text-xl text-on-primary">A</span>
          </div>
          <div>
            <h1 className="font-headline font-bold text-xl text-primary leading-none">AarogyaAnna</h1>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-medium mt-0.5">
              The Modern Alchemist
            </p>
          </div>
        </div>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'text-primary font-bold bg-surface-container-high border-r-4 border-primary translate-x-1'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
              }`
            }
          >
            <span className="material-symbols-outlined text-[22px]">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <div className="pt-4 mt-4 border-t border-outline-variant/20">
            {adminItems.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-primary font-bold bg-surface-container-high border-r-4 border-primary translate-x-1'
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[22px]">{icon}</span>
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Weekly Goal Progress */}
      <div className="px-6 mb-4">
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
          <p className="text-xs font-semibold text-primary mb-2">Weekly Goal</p>
          <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '65%' }} />
          </div>
          <p className="text-[10px] text-on-surface-variant mt-2">65% of Sattvic Path complete</p>
        </div>
      </div>

      {/* User + Logout */}
      <div className="px-6 pt-4 border-t border-outline-variant/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
            <span className="text-on-primary-container text-sm font-bold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-on-surface truncate">{user?.name || 'Guest'}</p>
            <p className="text-[10px] text-on-surface-variant truncate">{user?.email || ''}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-on-surface-variant hover:text-primary transition-colors"
            title="Logout"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
