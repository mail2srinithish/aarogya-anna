import { useState } from 'react'
import mockRecipes from '../data/mockRecipes'

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_SYNC_LOGS = [
  { source: 'TheMealDB', status: 'success', records: 1240, timestamp: '2026-03-29 06:00 AM' },
  { source: 'TheIndianFoodAPI', status: 'partial', records: 312, timestamp: '2026-03-29 06:02 AM' },
  { source: 'USDA FoodData', status: 'success', records: 4820, timestamp: '2026-03-29 06:05 AM' },
  { source: 'Open Food Facts', status: 'failed', records: 0, timestamp: '2026-03-29 06:08 AM' },
]

const SYNC_SOURCES = [
  { name: 'TheMealDB', status: 'active', lastSync: '2h ago', records: '42,800+', icon: 'restaurant_menu' },
  { name: 'TheIndianFoodAPI', status: 'active', lastSync: '2h ago', records: '8,200+', icon: 'set_meal' },
  { name: 'USDA FoodData', status: 'active', lastSync: '2h ago', records: '1,02,000+', icon: 'science' },
  { name: 'Open Food Facts', status: 'error', lastSync: 'Failed', records: '3,80,000+', icon: 'barcode_scanner' },
]

const ALGO_METRICS = [
  { label: 'Apriori Confidence', value: '87.3%', icon: 'hub', sublabel: 'Association Rules', trend: '+1.2%', positive: true },
  { label: 'RF Accuracy', value: '92.1%', icon: 'forest', sublabel: 'Random Forest', trend: '+0.4%', positive: true },
  { label: 'K-Means Inertia', value: '1,284', icon: 'scatter_plot', sublabel: 'Cluster Quality', trend: '-88', positive: true },
  { label: 'CF RMSE', value: '0.38', icon: 'recommend', sublabel: 'Collaborative Filter', trend: '-0.02', positive: true },
]

const MOCK_USERS = [
  { id: 1, name: 'Priya Krishnamurthy', email: 'priya.k@example.com', diet: 'Vegetarian', joined: '2024-06-15', active: true },
  { id: 2, name: 'Arjun Sharma', email: 'arjun.s@example.com', diet: 'Non-Vegetarian', joined: '2024-07-20', active: true },
  { id: 3, name: 'Meena Iyer', email: 'meena.i@example.com', diet: 'Vegan', joined: '2024-08-05', active: false },
  { id: 4, name: 'Rahul Patel', email: 'rahul.p@example.com', diet: 'Vegetarian', joined: '2024-09-12', active: true },
  { id: 5, name: 'Lakshmi Nair', email: 'lakshmi.n@example.com', diet: 'Eggetarian', joined: '2024-10-01', active: true },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    success: 'bg-primary/10 text-primary',
    failed: 'bg-error/10 text-error',
    partial: 'bg-secondary/10 text-secondary',
    active: 'bg-primary/10 text-primary',
    error: 'bg-error/10 text-error',
  }
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${map[status] ?? 'bg-surface-container-high text-on-surface-variant'}`}>
      {status}
    </span>
  )
}

function StatCard({ icon, label, value, sublabel, colorClass }) {
  return (
    <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorClass ?? 'bg-primary/10'}`}>
        <span className="material-symbols-outlined text-xl text-primary">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-on-surface">{value}</p>
      <p className="text-sm font-medium text-on-surface mt-0.5">{label}</p>
      {sublabel && <p className="text-xs text-on-surface-variant mt-0.5">{sublabel}</p>}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminPage() {
  // Mock admin guard — in production this would use useAuthStore
  const mockUser = { role: 'admin', name: 'Admin User' }

  const [activeTab, setActiveTab] = useState('overview')
  const [recipeSearch, setRecipeSearch] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncDone, setSyncDone] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [userStatuses, setUserStatuses] = useState(
    MOCK_USERS.reduce((acc, u) => ({ ...acc, [u.id]: u.active }), {})
  )

  function showToast(msg) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  function triggerSync() {
    setIsSyncing(true)
    setSyncDone(false)
    setTimeout(() => {
      setIsSyncing(false)
      setSyncDone(true)
      showToast('Data sync completed successfully!')
      setTimeout(() => setSyncDone(false), 5000)
    }, 2000)
  }

  function toggleUserStatus(id) {
    setUserStatuses((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const filteredRecipes = mockRecipes.filter((r) =>
    r.name.toLowerCase().includes(recipeSearch.toLowerCase())
  )

  if (mockUser.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface gap-4">
        <div className="w-16 h-16 rounded-2xl bg-error/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-error text-3xl">lock</span>
        </div>
        <h1 className="font-headline text-2xl text-on-surface">Access Denied</h1>
        <p className="text-on-surface-variant text-sm">You do not have permission to view this page.</p>
      </div>
    )
  }

  return (
    <div className="px-8 py-8 min-h-screen bg-surface">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-primary-container text-white px-5 py-3 rounded-2xl shadow-lg text-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-base">check_circle</span>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline text-3xl text-on-surface font-semibold">Admin Dashboard</h1>
          <p className="text-on-surface-variant mt-1">AarogyaAnna platform management</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 text-primary rounded-xl px-4 py-2">
          <span className="material-symbols-outlined text-base">admin_panel_settings</span>
          <span className="text-sm font-medium">{mockUser.name}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-container-low rounded-xl p-1 w-fit mb-8 overflow-x-auto hide-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: 'dashboard' },
          { id: 'recipes', label: 'Recipes', icon: 'menu_book' },
          { id: 'sync', label: 'Data Sync', icon: 'sync' },
          { id: 'users', label: 'Users', icon: 'group' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-8">
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon="group" label="Total Users" value="1,247" sublabel="↑ 48 this week" colorClass="bg-blue-100" />
            <StatCard icon="person_check" label="Daily Active Users" value="342" sublabel="27.4% DAU/MAU" colorClass="bg-primary/10" />
            <StatCard icon="menu_book" label="Total Recipes" value="6,043" sublabel="10 languages" colorClass="bg-secondary/10" />
            <StatCard icon="sync" label="Last Sync" value="2h ago" sublabel="All sources" colorClass="bg-tertiary/10" />
          </div>

          {/* Sync logs */}
          <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-container-high flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">history</span>
              <h2 className="font-headline text-lg text-on-surface font-semibold">Recent Sync Logs</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-container-low border-b border-surface-container-high">
                    <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide px-5 py-3">Source</th>
                    <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide px-5 py-3">Status</th>
                    <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide px-5 py-3">Records Added</th>
                    <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide px-5 py-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_SYNC_LOGS.map((log, i) => (
                    <tr key={i} className={i < MOCK_SYNC_LOGS.length - 1 ? 'border-b border-surface-container-high' : ''}>
                      <td className="px-5 py-3 text-sm font-medium text-on-surface">{log.source}</td>
                      <td className="px-5 py-3"><StatusBadge status={log.status} /></td>
                      <td className="px-5 py-3 text-sm text-on-surface-variant">{log.records.toLocaleString()}</td>
                      <td className="px-5 py-3 text-sm text-on-surface-variant">{log.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Algorithm performance */}
          <div>
            <h2 className="font-headline text-xl text-on-surface font-semibold mb-4">Algorithm Performance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {ALGO_METRICS.map((m) => (
                <div key={m.label} className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-primary text-lg">{m.icon}</span>
                  </div>
                  <p className="text-2xl font-bold text-on-surface">{m.value}</p>
                  <p className="text-sm font-medium text-on-surface mt-0.5">{m.label}</p>
                  <p className="text-xs text-on-surface-variant">{m.sublabel}</p>
                  <span className={`text-xs font-medium mt-2 inline-block ${m.positive ? 'text-primary' : 'text-error'}`}>
                    {m.trend} vs last week
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Recipes Tab ── */}
      {activeTab === 'recipes' && (
        <div>
          {/* Search + Add */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 flex items-center gap-2 bg-surface-container-low border border-surface-container-high rounded-xl px-4 py-2.5 focus-within:border-primary transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant text-lg">search</span>
              <input
                value={recipeSearch}
                onChange={(e) => setRecipeSearch(e.target.value)}
                placeholder="Search recipes by name..."
                className="flex-1 bg-transparent text-sm text-on-surface placeholder-on-surface-variant/50 outline-none"
              />
              {recipeSearch && (
                <button onClick={() => setRecipeSearch('')} className="text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              )}
            </div>
            <button
              onClick={() => alert('Add recipe — feature coming soon!')}
              className="flex items-center gap-2 bg-primary text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-primary-container transition-colors"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Add Recipe
            </button>
          </div>

          <div className="text-sm text-on-surface-variant mb-3">
            Showing {filteredRecipes.length} of {mockRecipes.length} recipes
          </div>

          <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-container-low border-b border-surface-container-high">
                    {['Name', 'Region', 'Meal Type', 'Health Score', 'Rating', 'Actions'].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide px-5 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRecipes.map((recipe, i) => (
                    <tr
                      key={recipe.id}
                      className={`hover:bg-surface-container-low transition-colors ${i < filteredRecipes.length - 1 ? 'border-b border-surface-container-high' : ''}`}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={recipe.image_url}
                            alt={recipe.name}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                          <div>
                            <p className="text-sm font-medium text-on-surface">{recipe.name}</p>
                            <p className="text-xs text-on-surface-variant">{recipe.diet_type?.join(', ')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-on-surface-variant capitalize">{recipe.region}</td>
                      <td className="px-5 py-3 text-sm text-on-surface-variant capitalize">{recipe.meal_type}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${recipe.health_score}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-primary">{recipe.health_score}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500 text-sm">★</span>
                          <span className="text-sm text-on-surface">{recipe.rating}</span>
                          <span className="text-xs text-on-surface-variant">({recipe.reviews})</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => alert(`Edit "${recipe.name}" — coming soon!`)}
                            className="flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-lg px-3 py-1.5 hover:bg-primary/20 transition-colors"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                            Edit
                          </button>
                          <button
                            onClick={() => alert(`Delete "${recipe.name}" — coming soon!`)}
                            className="flex items-center gap-1 text-xs bg-error/10 text-error rounded-lg px-3 py-1.5 hover:bg-error/20 transition-colors"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Data Sync Tab ── */}
      {activeTab === 'sync' && (
        <div className="flex flex-col gap-8">
          {/* Manual sync trigger */}
          <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-headline text-lg text-on-surface font-semibold">Manual Data Sync</h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  Trigger an immediate sync from all connected data sources
                </p>
              </div>
              <button
                onClick={triggerSync}
                disabled={isSyncing}
                className="flex items-center gap-2 bg-primary text-white rounded-xl px-6 py-3 text-sm font-medium hover:bg-primary-container transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className={`material-symbols-outlined text-base ${isSyncing ? 'animate-spin' : ''}`}>
                  {isSyncing ? 'sync' : 'cloud_sync'}
                </span>
                {isSyncing ? 'Syncing...' : 'Trigger Manual Sync'}
              </button>
            </div>

            {syncDone && (
              <div className="mt-4 bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                <p className="text-sm text-primary font-medium">Sync completed! All sources updated successfully.</p>
              </div>
            )}
          </div>

          {/* Sync sources table */}
          <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-container-high">
              <h2 className="font-headline text-lg text-on-surface font-semibold">Sync Sources</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-container-low border-b border-surface-container-high">
                    {['Source', 'Status', 'Last Sync', 'Total Records', 'Action'].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide px-5 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SYNC_SOURCES.map((src, i) => (
                    <tr key={src.name} className={i < SYNC_SOURCES.length - 1 ? 'border-b border-surface-container-high' : ''}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-lg">{src.icon}</span>
                          </div>
                          <span className="text-sm font-medium text-on-surface">{src.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={src.status} /></td>
                      <td className="px-5 py-4 text-sm text-on-surface-variant">{src.lastSync}</td>
                      <td className="px-5 py-4 text-sm text-on-surface-variant">{src.records}</td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => showToast(`Syncing ${src.name}...`)}
                          className="text-xs bg-surface-container-low border border-surface-container-high text-on-surface-variant rounded-lg px-3 py-1.5 hover:border-primary hover:text-primary transition-colors"
                        >
                          Sync Now
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Users Tab ── */}
      {activeTab === 'users' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline text-xl text-on-surface font-semibold">Registered Users</h2>
            <span className="text-sm text-on-surface-variant bg-surface-container-low border border-surface-container-high rounded-xl px-4 py-2">
              Total: 1,247
            </span>
          </div>

          <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-container-low border-b border-surface-container-high">
                    {['Name', 'Email', 'Diet Type', 'Joined', 'Status'].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wide px-5 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_USERS.map((u, i) => (
                    <tr
                      key={u.id}
                      className={`hover:bg-surface-container-low transition-colors ${i < MOCK_USERS.length - 1 ? 'border-b border-surface-container-high' : ''}`}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-on-surface">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-on-surface-variant">{u.email}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{u.diet}</span>
                      </td>
                      <td className="px-5 py-3 text-sm text-on-surface-variant">
                        {new Date(u.joined).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleUserStatus(u.id)}
                            className={`relative w-10 h-5 rounded-full transition-colors ${userStatuses[u.id] ? 'bg-primary' : 'bg-surface-container-high'}`}
                          >
                            <span
                              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${userStatuses[u.id] ? 'left-5' : 'left-0.5'}`}
                            />
                          </button>
                          <span className={`text-xs font-medium ${userStatuses[u.id] ? 'text-primary' : 'text-on-surface-variant'}`}>
                            {userStatuses[u.id] ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-on-surface-variant text-center mt-4">
            Showing 5 of 1,247 users · Pagination and full user management coming in v2.0
          </p>
        </div>
      )}
    </div>
  )
}
