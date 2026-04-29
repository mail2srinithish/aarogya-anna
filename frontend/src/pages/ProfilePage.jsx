import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../store/profileStore'
import { useAuthStore } from '../store/authStore'
import { mockUserProfile } from '../data/mockRecipes'
import { calcBMI, getBMICategory, calcBMR, calcTDEE } from '../utils/bmi'

// ─── Constants ────────────────────────────────────────────────────────────────

const CONDITION_COLORS = {
  PCOD: 'bg-purple-100 text-purple-700 border-purple-200',
  mild_insulin_resistance: 'bg-amber-100 text-amber-700 border-amber-200',
  diabetes: 'bg-red-100 text-red-700 border-red-200',
  thyroid: 'bg-blue-100 text-blue-700 border-blue-200',
  hypertension: 'bg-orange-100 text-orange-700 border-orange-200',
  anemia: 'bg-rose-100 text-rose-700 border-rose-200',
}

const DIET_LABELS = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  non_vegetarian: 'Non-Vegetarian',
  eggetarian: 'Eggetarian',
  jain: 'Jain',
}

const REGION_LABELS = {
  south: 'South Indian',
  north: 'North Indian',
  east: 'East Indian',
  west: 'West Indian',
}

const ACTIVITY_LABELS = {
  sedentary: 'Sedentary',
  light: 'Lightly Active',
  moderate: 'Moderately Active',
  moderately_active: 'Moderately Active',
  active: 'Active',
  very_active: 'Very Active',
}

const GOAL_LABELS = {
  weight_management: 'Weight Management',
  weight_loss: 'Weight Loss',
  weight_gain: 'Weight Gain',
  hormonal_balance: 'Hormonal Balance',
  improve_energy: 'Improve Energy',
  muscle_gain: 'Muscle Gain',
  general_wellness: 'General Wellness',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({ icon, label, value, unit, sublabel, colorClass }) {
  return (
    <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass || 'bg-primary/10'}`}>
          <span className="material-symbols-outlined text-base text-primary">{icon}</span>
        </div>
        <span className="text-sm text-on-surface-variant font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-on-surface">{value}</span>
        {unit && <span className="text-sm text-on-surface-variant">{unit}</span>}
      </div>
      {sublabel && <p className="text-xs text-on-surface-variant mt-1">{sublabel}</p>}
    </div>
  )
}

function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-xl">{icon}</span>
        <h2 className="font-headline text-lg text-on-surface font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function PreferenceRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-surface-container-high last:border-0">
      <span className="text-sm text-on-surface-variant">{label}</span>
      <span className="text-sm font-medium text-on-surface">{value || '—'}</span>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProfilePage() {
  const navigate = useNavigate()
  const { profile } = useProfileStore()
  const { user } = useAuthStore()

  const userData = profile || user || mockUserProfile

  const [isEditMode, setIsEditMode] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [langPreference, setLangPreference] = useState(userData.language || 'English')
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })
  const [toastMsg, setToastMsg] = useState('')

  function showToast(msg) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2500)
  }

  // Derived health metrics
  const bmi = calcBMI(userData.weight_kg ?? 58, userData.height_cm ?? 162)
  const bmiCategory = getBMICategory(bmi)
  const bmr = calcBMR(userData.age ?? 28, userData.gender ?? 'female', userData.weight_kg ?? 58, userData.height_cm ?? 162)
  const tdee = calcTDEE(bmr, userData.activity_level ?? 'moderate')
  const dailyTarget = userData.daily_calorie_target ?? tdee

  // Initials for avatar
  const initials = (userData.name || 'User')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const savedCount = userData.savedRecipes?.length ?? 12

  function handlePasswordSubmit(e) {
    e.preventDefault()
    if (passwordForm.next !== passwordForm.confirm) {
      showToast('Passwords do not match')
      return
    }
    showToast('Password updated successfully!')
    setShowPasswordForm(false)
    setPasswordForm({ current: '', next: '', confirm: '' })
  }

  function handleDeleteAccount() {
    setShowDeleteConfirm(false)
    showToast('Account deletion requested. You will receive a confirmation email.')
  }

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto min-h-screen bg-surface">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-primary-container text-white px-5 py-3 rounded-2xl shadow-lg text-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-base">check_circle</span>
          {toastMsg}
        </div>
      )}

      {/* ── Section 1: Profile Header ── */}
      <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold font-headline shadow-lg">
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary border-2 border-surface-container-lowest flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '12px' }}>verified</span>
            </div>
          </div>

          {/* Name & details */}
          <div className="flex-1 min-w-0">
            <h1 className="font-headline text-2xl text-on-surface font-semibold">{userData.name}</h1>
            <p className="text-on-surface-variant text-sm mt-0.5">{userData.email}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {userData.diet_preference && (
                <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full font-medium capitalize">
                  {DIET_LABELS[userData.diet_preference] ?? userData.diet_preference}
                </span>
              )}
              {userData.region && (
                <span className="text-xs bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1 rounded-full font-medium">
                  {REGION_LABELS[userData.region] ?? userData.region}
                </span>
              )}
              {userData.ayurveda_type && (
                <span className="text-xs bg-tertiary/10 text-tertiary border border-tertiary/20 px-3 py-1 rounded-full font-medium capitalize">
                  Prakriti: {userData.ayurveda_type}
                </span>
              )}
            </div>
          </div>

          {/* Edit button */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className="flex items-center gap-2 bg-surface-container-low border border-surface-container-high text-on-surface rounded-xl px-4 py-2.5 text-sm font-medium hover:border-primary transition-colors"
          >
            <span className="material-symbols-outlined text-base">{isEditMode ? 'close' : 'edit'}</span>
            {isEditMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* ── Section 2: Health Metrics ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          icon="monitor_weight"
          label="BMI"
          value={bmi}
          unit="kg/m²"
          sublabel={bmiCategory.label}
          colorClass={bmiCategory.bg}
        />
        <MetricCard
          icon="local_fire_department"
          label="BMR"
          value={bmr}
          unit="kcal/day"
          sublabel="Basal Metabolic Rate"
          colorClass="bg-orange-100"
        />
        <MetricCard
          icon="directions_run"
          label="TDEE"
          value={tdee}
          unit="kcal/day"
          sublabel="Total Daily Energy"
          colorClass="bg-blue-100"
        />
        <MetricCard
          icon="flag"
          label="Daily Target"
          value={dailyTarget}
          unit="kcal"
          sublabel="Personalised goal"
          colorClass="bg-primary/10"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* ── Section 3: Health Conditions ── */}
        <SectionCard title="Health Conditions" icon="favorite">
          {userData.health_conditions?.length ? (
            <div className="flex flex-wrap gap-2">
              {userData.health_conditions.map((cond) => (
                <span
                  key={cond}
                  className={`text-sm px-3 py-1.5 rounded-xl border font-medium capitalize ${CONDITION_COLORS[cond] ?? 'bg-surface-container-high text-on-surface-variant border-surface-container-high'}`}
                >
                  {cond.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant">No health conditions recorded.</p>
          )}

          {userData.allergies?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">Allergies</p>
              <div className="flex flex-wrap gap-2">
                {userData.allergies.map((a) => (
                  <span key={a} className="text-xs bg-error/10 text-error border border-error/20 px-2.5 py-1 rounded-full capitalize">
                    {a.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {userData.intolerances?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">Intolerances</p>
              <div className="flex flex-wrap gap-2">
                {userData.intolerances.map((i) => (
                  <span key={i} className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full capitalize">
                    {i.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── Section 4: Preferences ── */}
        <SectionCard title="Preferences" icon="tune">
          <PreferenceRow label="Diet Type" value={DIET_LABELS[userData.diet_preference] ?? userData.diet_preference} />
          <PreferenceRow label="Region" value={REGION_LABELS[userData.region] ?? userData.region} />
          <PreferenceRow label="Language" value={userData.language} />
          <PreferenceRow label="Activity Level" value={ACTIVITY_LABELS[userData.activity_level] ?? userData.activity_level} />
          {userData.health_goals?.length > 0 && (
            <div className="pt-3">
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">Goals</p>
              <div className="flex flex-wrap gap-2">
                {userData.health_goals.map((g) => (
                  <span key={g} className="text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full">
                    {GOAL_LABELS[g] ?? g.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Section 5: Saved Recipes ── */}
      <div className="bg-surface-container-lowest border border-surface-container-high rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl">bookmark</span>
            </div>
            <div>
              <h2 className="font-headline text-lg text-on-surface font-semibold">Saved Recipes</h2>
              <p className="text-sm text-on-surface-variant">
                {savedCount} recipe{savedCount !== 1 ? 's' : ''} bookmarked
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/recipes')}
            className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
          >
            View All
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* ── Section 6: Account Settings ── */}
      <SectionCard title="Account Settings" icon="settings">
        {/* Change Password */}
        <div className="py-3 border-b border-surface-container-high">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-on-surface">Password</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Update your account password</p>
            </div>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="text-sm bg-surface-container-low border border-surface-container-high text-on-surface rounded-xl px-4 py-2 hover:border-primary transition-colors"
            >
              Change Password
            </button>
          </div>

          {showPasswordForm && (
            <form onSubmit={handlePasswordSubmit} className="mt-4 bg-surface-container-low rounded-xl p-4 flex flex-col gap-3">
              {['current', 'next', 'confirm'].map((field) => (
                <div key={field}>
                  <label className="text-xs text-on-surface-variant mb-1 block capitalize">
                    {field === 'next' ? 'New Password' : field === 'confirm' ? 'Confirm New Password' : 'Current Password'}
                  </label>
                  <input
                    type="password"
                    value={passwordForm[field]}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, [field]: e.target.value }))}
                    className="w-full bg-surface-container-lowest border border-surface-container-high rounded-xl px-3 py-2 text-sm text-on-surface outline-none focus:border-primary transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              ))}
              <div className="flex gap-3 mt-1">
                <button
                  type="submit"
                  className="bg-primary text-white rounded-xl px-5 py-2 text-sm font-medium hover:bg-primary-container transition-colors"
                >
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="text-sm text-on-surface-variant hover:text-on-surface"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Email notifications */}
        <div className="flex items-center justify-between py-3 border-b border-surface-container-high">
          <div>
            <p className="text-sm font-medium text-on-surface">Email Notifications</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Receive meal reminders and health tips</p>
          </div>
          <button
            onClick={() => setEmailNotifications(!emailNotifications)}
            className={`relative w-12 h-6 rounded-full transition-colors ${emailNotifications ? 'bg-primary' : 'bg-surface-container-high'}`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${emailNotifications ? 'left-7' : 'left-1'}`}
            />
          </button>
        </div>

        {/* Language */}
        <div className="flex items-center justify-between py-3 border-b border-surface-container-high">
          <div>
            <p className="text-sm font-medium text-on-surface">Language Preference</p>
            <p className="text-xs text-on-surface-variant mt-0.5">App interface language</p>
          </div>
          <select
            value={langPreference}
            onChange={(e) => {
              setLangPreference(e.target.value)
              showToast(`Language set to ${e.target.value}`)
            }}
            className="text-sm bg-surface-container-low border border-surface-container-high rounded-xl px-3 py-2 text-on-surface outline-none focus:border-primary cursor-pointer"
          >
            {['English', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Hindi', 'Bengali', 'Marathi', 'Gujarati'].map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        {/* Delete account */}
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium text-error">Delete Account</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Permanently remove your data</p>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-sm bg-error/10 text-error border border-error/20 rounded-xl px-4 py-2 hover:bg-error/20 transition-colors"
          >
            Delete Account
          </button>
        </div>

        {/* Delete confirmation dialog */}
        {showDeleteConfirm && (
          <div className="mt-4 bg-error/5 border border-error/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-error text-2xl mt-0.5">warning</span>
              <div>
                <p className="text-sm font-semibold text-on-surface">Are you sure?</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  This will permanently delete your account, meal plans, saved recipes, and all health data. This action cannot be undone.
                </p>
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={handleDeleteAccount}
                    className="bg-error text-white rounded-xl px-4 py-2 text-sm font-medium hover:opacity-90"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="text-sm text-on-surface-variant hover:text-on-surface"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      {/* Member since */}
      <p className="text-center text-xs text-on-surface-variant mt-6 pb-4">
        Member since {userData.created_at ? new Date(userData.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'June 2024'}
      </p>
    </div>
  )
}
