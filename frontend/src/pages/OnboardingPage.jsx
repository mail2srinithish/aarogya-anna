import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../store/profileStore'
import { useAuthStore } from '../store/authStore'
import { calcBMI, calcBMR, calcTDEE, getBMICategory, getIdealWeightRange } from '../utils/bmi'

// ─── Step Metadata ────────────────────────────────────────────────────────────
const STEPS = [
  { number: 1, label: 'Personal Details',     icon: 'person' },
  { number: 2, label: 'Your Vital Metrics',   icon: 'monitor_heart' },
  { number: 3, label: 'Health Profile',       icon: 'health_and_safety' },
  { number: 4, label: 'Preferences & Goals',  icon: 'tune' },
]

// ─── Step 3 Options ───────────────────────────────────────────────────────────
const HEALTH_CONDITIONS = [
  'Diabetes (Type 2)', 'PCOD/PCOS', 'Hypertension',
  'Thyroid (Hypo)', 'Thyroid (Hyper)', 'Obesity',
  'Anaemia', 'High Cholesterol', 'IBS', 'Kidney Disease',
]
const ALLERGIES = ['Peanuts', 'Gluten', 'Dairy', 'Shellfish', 'Eggs', 'Tree Nuts', 'Soy']

// ─── Step 4 Options ───────────────────────────────────────────────────────────
const DIET_TYPES = [
  { value: 'vegetarian',    label: 'Vegetarian',     icon: 'eco' },
  { value: 'vegan',         label: 'Vegan',           icon: 'grass' },
  { value: 'jain',          label: 'Jain',            icon: 'brightness_5' },
  { value: 'non-vegetarian',label: 'Non-Vegetarian',  icon: 'set_meal' },
  { value: 'eggetarian',    label: 'Eggetarian',      icon: 'egg' },
  { value: 'sattvic',       label: 'Sattvic',         icon: 'self_improvement' },
]
const REGIONS = [
  { value: 'north',     label: 'North Indian',     icon: 'landscape' },
  { value: 'south',     label: 'South Indian',     icon: 'water' },
  { value: 'east',      label: 'East Indian',      icon: 'forest' },
  { value: 'west',      label: 'West Indian',      icon: 'wb_sunny' },
  { value: 'northeast', label: 'Northeast Indian', icon: 'terrain' },
  { value: 'central',   label: 'Central Indian',   icon: 'location_city' },
]
const LANGUAGES = ['Tamil', 'Hindi', 'Telugu', 'English']
const ACTIVITY_LEVELS = [
  { value: 'sedentary',   label: 'Sedentary',   desc: 'Little or no exercise' },
  { value: 'light',       label: 'Light',        desc: '1–3 days/week' },
  { value: 'moderate',    label: 'Moderate',     desc: '3–5 days/week' },
  { value: 'active',      label: 'Active',       desc: '6–7 days/week' },
  { value: 'very_active', label: 'Very Active',  desc: 'Intense daily exercise' },
]
const GOALS = [
  { value: 'weight_loss',        label: 'Weight Loss',        icon: 'trending_down' },
  { value: 'muscle_gain',        label: 'Muscle Gain',        icon: 'fitness_center' },
  { value: 'weight_management',  label: 'Weight Management',  icon: 'balance' },
  { value: 'disease_management', label: 'Disease Management', icon: 'medical_services' },
]

// ─── Default Form State ───────────────────────────────────────────────────────
const initialFormData = {
  // Step 1
  name: '', age: '', gender: '',
  weightKg: '', heightCm: '',
  // Step 2 (calculated)
  bmi: null, bmr: null, tdee: null, bmiCategory: null, idealWeight: null,
  // Step 3
  healthConditions: [], allergies: [],
  // Step 4
  dietType: '', region: '', language: '', activityLevel: 'moderate', goal: '',
}

// ─── Shared Input component ───────────────────────────────────────────────────
function FormInput({ label, type = 'text', value, onChange, placeholder, min, max, required }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-[#1a2e19]">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        className="px-4 py-3 rounded-xl border border-[#c2c9bb] bg-white focus:outline-none focus:ring-2 focus:ring-[#154212]/30 focus:border-[#154212] font-body text-[#191c1b] placeholder:text-[#8a9187] transition-all"
      />
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const navigate = useNavigate()
  const { setProfile, completeOnboarding } = useProfileStore()
  const { user } = useAuthStore()

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    ...initialFormData,
    name: user?.name || '',
  })
  const [errors, setErrors] = useState({})

  // ── Helpers ──────────────────────────────────────────────────────────────
  function updateField(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  function toggleArrayField(field, item) {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(x => x !== item)
        : [...prev[field], item],
    }))
  }

  // ── Step 1 validation ─────────────────────────────────────────────────────
  function validateStep1() {
    const e = {}
    if (!formData.name.trim()) e.name = 'Name is required'
    if (!formData.age || formData.age < 10 || formData.age > 100) e.age = 'Enter a valid age (10–100)'
    if (!formData.gender) e.gender = 'Please select a gender'
    if (!formData.weightKg || formData.weightKg < 20 || formData.weightKg > 300) e.weightKg = 'Enter weight in kg (20–300)'
    if (!formData.heightCm || formData.heightCm < 100 || formData.heightCm > 250) e.heightCm = 'Enter height in cm (100–250)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleCalculateVitals() {
    if (!validateStep1()) return
    const bmi = calcBMI(Number(formData.weightKg), Number(formData.heightCm))
    const bmr = calcBMR(Number(formData.age), formData.gender.toLowerCase(), Number(formData.weightKg), Number(formData.heightCm))
    const tdee = calcTDEE(bmr, formData.activityLevel)
    const bmiCategory = getBMICategory(bmi)
    const idealWeight = getIdealWeightRange(Number(formData.heightCm), formData.gender.toLowerCase())
    setFormData(prev => ({ ...prev, bmi, bmr, tdee, bmiCategory, idealWeight }))
    setCurrentStep(2)
  }

  // ── Step 4 validation ─────────────────────────────────────────────────────
  function validateStep4() {
    const e = {}
    if (!formData.dietType) e.dietType = 'Please select a diet type'
    if (!formData.region) e.region = 'Please select a region'
    if (!formData.language) e.language = 'Please select a language'
    if (!formData.goal) e.goal = 'Please select a goal'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleCompleteSetup() {
    if (!validateStep4()) return
    const profile = {
      name: formData.name,
      age: Number(formData.age),
      gender: formData.gender.toLowerCase(),
      weightKg: Number(formData.weightKg),
      heightCm: Number(formData.heightCm),
      bmi: formData.bmi,
      bmr: formData.bmr,
      tdee: formData.tdee,
      idealWeight: formData.idealWeight,
      healthConditions: formData.healthConditions,
      allergies: formData.allergies,
      dietType: formData.dietType,
      region: formData.region,
      language: formData.language,
      activityLevel: formData.activityLevel,
      goal: formData.goal,
    }
    setProfile(profile)
    completeOnboarding()
    navigate('/dashboard')
  }

  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex font-body">
      {/* ── Left Sidebar ─────────────────────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col justify-between w-[30%] min-h-screen px-10 py-12 text-white"
        style={{ background: 'linear-gradient(160deg, #154212 0%, #2d5a27 55%, #3a7030 100%)' }}
      >
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">nutrition</span>
            </div>
            <div>
              <p className="font-headline text-xl font-bold leading-tight">AarogyaAnna</p>
              <p className="text-xs text-white/60 font-body">Your Health Kitchen</p>
            </div>
          </div>

          {/* Step list */}
          <nav className="space-y-2">
            {STEPS.map(step => {
              const isComplete = step.number < currentStep
              const isActive  = step.number === currentStep
              return (
                <div
                  key={step.number}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                    isActive  ? 'bg-white/20 backdrop-blur-sm' :
                    isComplete ? 'opacity-80' : 'opacity-40'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                    isComplete ? 'bg-[#bcf0ae] text-[#154212]' :
                    isActive   ? 'bg-white text-[#154212]' :
                                 'bg-white/20 text-white'
                  }`}>
                    {isComplete
                      ? <span className="material-symbols-outlined text-base">check</span>
                      : step.number}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-white/80'}`}>{step.label}</p>
                    {isActive && (
                      <p className="text-xs text-white/50 mt-0.5">In progress</p>
                    )}
                  </div>
                </div>
              )
            })}
          </nav>
        </div>

        {/* Decorative dots */}
        <div className="flex gap-2 items-center">
          {STEPS.map(step => (
            <div
              key={step.number}
              className={`rounded-full transition-all ${
                step.number === currentStep
                  ? 'w-6 h-2.5 bg-[#bcf0ae]'
                  : step.number < currentStep
                    ? 'w-2.5 h-2.5 bg-white/60'
                    : 'w-2.5 h-2.5 bg-white/20'
              }`}
            />
          ))}
        </div>
      </aside>

      {/* ── Right Content ──────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col bg-[#f8faf8]">
        {/* Progress bar */}
        <div className="h-1 w-full bg-[#e6e9e7]">
          <div
            className="h-full bg-[#154212] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Mobile step indicator */}
        <div className="lg:hidden flex items-center gap-3 px-6 py-4 border-b border-[#e6e9e7] bg-white">
          <div className="w-8 h-8 rounded-full bg-[#154212] flex items-center justify-center text-white text-sm font-bold">
            {currentStep}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#154212]">{STEPS[currentStep - 1].label}</p>
            <p className="text-xs text-[#6b7c68]">Step {currentStep} of {STEPS.length}</p>
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 flex items-start justify-center px-6 py-10 overflow-y-auto">
          <div className="w-full max-w-2xl">

            {/* ── STEP 1: Personal Details ──────────────────────────────── */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div>
                  <h1 className="font-headline text-3xl font-black text-[#154212]">Personal Details</h1>
                  <p className="text-[#6b7c68] mt-1.5 font-body text-sm">Tell us about yourself so we can personalise your nutrition plan.</p>
                </div>

                <div className="bg-white rounded-2xl p-7 shadow-sm border border-[#e6e9e7] space-y-5">
                  <FormInput
                    label="Full Name" value={formData.name} required
                    onChange={e => updateField('name', e.target.value)}
                    placeholder="e.g. Priya Sharma"
                  />
                  {errors.name && <p className="text-xs text-red-500 -mt-4">{errors.name}</p>}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FormInput
                        label="Age" type="number" value={formData.age} required
                        onChange={e => updateField('age', e.target.value)}
                        placeholder="28" min={10} max={100}
                      />
                      {errors.age && <p className="text-xs text-red-500 mt-1">{errors.age}</p>}
                    </div>

                    {/* Gender */}
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-[#1a2e19]">Gender <span className="text-red-500">*</span></label>
                      <div className="flex gap-2 mt-1">
                        {['Male', 'Female', 'Other'].map(g => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => updateField('gender', g)}
                            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium border transition-all ${
                              formData.gender === g
                                ? 'border-[#154212] bg-[#154212] text-white'
                                : 'border-[#c2c9bb] bg-white text-[#42493e] hover:border-[#154212]/50'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                      {errors.gender && <p className="text-xs text-red-500 mt-1">{errors.gender}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FormInput
                        label="Weight (kg)" type="number" value={formData.weightKg} required
                        onChange={e => updateField('weightKg', e.target.value)}
                        placeholder="58" min={20} max={300}
                      />
                      {errors.weightKg && <p className="text-xs text-red-500 mt-1">{errors.weightKg}</p>}
                    </div>
                    <div>
                      <FormInput
                        label="Height (cm)" type="number" value={formData.heightCm} required
                        onChange={e => updateField('heightCm', e.target.value)}
                        placeholder="162" min={100} max={250}
                      />
                      {errors.heightCm && <p className="text-xs text-red-500 mt-1">{errors.heightCm}</p>}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCalculateVitals}
                  className="w-full py-4 bg-[#154212] hover:bg-[#2d5a27] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#154212]/20 active:scale-95"
                >
                  <span className="material-symbols-outlined">calculate</span>
                  Calculate Vitals
                </button>
              </div>
            )}

            {/* ── STEP 2: Vital Metrics ─────────────────────────────────── */}
            {currentStep === 2 && formData.bmi && (
              <div className="space-y-8">
                <div>
                  <h1 className="font-headline text-3xl font-black text-[#154212]">Your Vital Metrics</h1>
                  <p className="text-[#6b7c68] mt-1.5 text-sm">Calculated based on your personal details using ICMR-NIN 2020 guidelines.</p>
                </div>

                {/* BMI Hero */}
                <div className="bg-white rounded-2xl p-7 shadow-sm border border-[#e6e9e7]">
                  <div className="flex items-center gap-6">
                    <div className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center shrink-0 ${
                      formData.bmiCategory?.color?.replace('text-', 'border-') || 'border-primary'
                    } ${formData.bmiCategory?.bg || 'bg-primary/10'}`}>
                      <span className={`font-headline text-3xl font-black ${formData.bmiCategory?.color || 'text-primary'}`}>
                        {formData.bmi}
                      </span>
                      <span className="text-xs text-[#6b7c68] font-body mt-0.5">BMI</span>
                    </div>
                    <div>
                      <p className={`font-headline text-xl font-bold ${formData.bmiCategory?.color || 'text-primary'}`}>
                        {formData.bmiCategory?.label}
                      </p>
                      <p className="text-sm text-[#6b7c68] mt-1">
                        Based on WHO/ICMR body mass index guidelines for South Asians.
                      </p>
                      <div className="mt-3 h-2.5 rounded-full bg-gradient-to-r from-blue-400 via-[#154212] via-60% to-red-500 w-48 relative">
                        <div
                          className="absolute -top-0.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#154212] shadow"
                          style={{ left: `calc(${Math.min(formData.bmiCategory?.position || 40, 96)}% - 7px)` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* BMR */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e6e9e7]">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-[#6b7c68] uppercase tracking-wider font-semibold">Basal Metabolic Rate</p>
                        <p className="font-headline text-3xl font-black text-[#154212] mt-1">{formData.bmr}</p>
                        <p className="text-xs text-[#6b7c68] mt-0.5">kcal / day at rest</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-[#bcf0ae] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#154212] text-xl">local_fire_department</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#6b7c68] mt-3 leading-relaxed">Energy your body burns at complete rest to maintain vital functions.</p>
                  </div>

                  {/* TDEE */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e6e9e7]">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-[#6b7c68] uppercase tracking-wider font-semibold">Daily Energy Needs</p>
                        <p className="font-headline text-3xl font-black text-[#2d5a27] mt-1">{formData.tdee}</p>
                        <p className="text-xs text-[#6b7c68] mt-0.5">kcal / day TDEE</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-[#2d5a27]/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#2d5a27] text-xl">bolt</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#6b7c68] mt-3 leading-relaxed">Total daily energy expenditure including your activity level.</p>
                  </div>

                  {/* Ideal Weight */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e6e9e7]">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-[#6b7c68] uppercase tracking-wider font-semibold">Ideal Weight Range</p>
                        <p className="font-headline text-2xl font-black text-[#692000] mt-1">
                          {formData.idealWeight?.lower} – {formData.idealWeight?.upper} kg
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-[#ffdbcf] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#692000] text-xl">monitor_weight</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#6b7c68] mt-3 leading-relaxed">Based on healthy BMI range 18.5–22.9 (Asian guidelines).</p>
                  </div>

                  {/* Protein Need */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e6e9e7]">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-[#6b7c68] uppercase tracking-wider font-semibold">Daily Protein Need</p>
                        <p className="font-headline text-3xl font-black text-[#7c5800] mt-1">
                          {Math.round(0.83 * Number(formData.weightKg))}g
                        </p>
                        <p className="text-xs text-[#6b7c68] mt-0.5">0.83g per kg body weight</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-[#feb700]/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#7c5800] text-xl">egg_alt</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#6b7c68] mt-3 leading-relaxed">ICMR-NIN 2020 recommended dietary allowance for Indians.</p>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentStep(3)}
                  className="w-full py-4 bg-[#154212] hover:bg-[#2d5a27] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#154212]/20 active:scale-95"
                >
                  Continue
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            )}

            {/* ── STEP 3: Health Profile ────────────────────────────────── */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div>
                  <h1 className="font-headline text-3xl font-black text-[#154212]">Health Profile</h1>
                  <p className="text-[#6b7c68] mt-1.5 text-sm">Help us personalise your recipes with your health conditions and food restrictions.</p>
                </div>

                {/* Health Conditions */}
                <div className="bg-white rounded-2xl p-7 shadow-sm border border-[#e6e9e7] space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#154212]">health_and_safety</span>
                    <h2 className="font-headline text-lg font-bold text-[#1a2e19]">Health Conditions</h2>
                  </div>
                  <p className="text-xs text-[#6b7c68]">Select all that apply. Your plan will be adjusted accordingly.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {HEALTH_CONDITIONS.map(condition => {
                      const selected = formData.healthConditions.includes(condition)
                      return (
                        <button
                          key={condition}
                          type="button"
                          onClick={() => toggleArrayField('healthConditions', condition)}
                          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all ${
                            selected
                              ? 'border-[#154212] bg-[#154212]/5 text-[#154212]'
                              : 'border-[#e6e9e7] bg-[#f8faf8] text-[#42493e] hover:border-[#154212]/40'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded shrink-0 border-2 flex items-center justify-center transition-all ${
                            selected ? 'border-[#154212] bg-[#154212]' : 'border-[#c2c9bb]'
                          }`}>
                            {selected && <span className="material-symbols-outlined text-white" style={{ fontSize: '12px' }}>check</span>}
                          </div>
                          {condition}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Allergies */}
                <div className="bg-white rounded-2xl p-7 shadow-sm border border-[#e6e9e7] space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#692000]">warning</span>
                    <h2 className="font-headline text-lg font-bold text-[#1a2e19]">Food Allergies</h2>
                  </div>
                  <p className="text-xs text-[#6b7c68]">Select ingredients you are allergic or intolerant to.</p>
                  <div className="flex flex-wrap gap-2">
                    {ALLERGIES.map(allergy => {
                      const selected = formData.allergies.includes(allergy)
                      return (
                        <button
                          key={allergy}
                          type="button"
                          onClick={() => toggleArrayField('allergies', allergy)}
                          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                            selected
                              ? 'border-[#692000] bg-[#ffdbcf] text-[#692000]'
                              : 'border-[#e6e9e7] bg-[#f8faf8] text-[#42493e] hover:border-[#692000]/50'
                          }`}
                        >
                          {selected && '✕ '}{allergy}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <button
                  onClick={() => setCurrentStep(4)}
                  className="w-full py-4 bg-[#154212] hover:bg-[#2d5a27] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#154212]/20 active:scale-95"
                >
                  Continue
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            )}

            {/* ── STEP 4: Preferences & Goals ───────────────────────────── */}
            {currentStep === 4 && (
              <div className="space-y-8">
                <div>
                  <h1 className="font-headline text-3xl font-black text-[#154212]">Preferences & Goals</h1>
                  <p className="text-[#6b7c68] mt-1.5 text-sm">Fine-tune your experience with your food preferences and wellness goals.</p>
                </div>

                {/* Diet Type */}
                <div className="bg-white rounded-2xl p-7 shadow-sm border border-[#e6e9e7] space-y-4">
                  <h2 className="font-headline text-lg font-bold text-[#1a2e19]">Diet Type</h2>
                  {errors.dietType && <p className="text-xs text-red-500">{errors.dietType}</p>}
                  <div className="grid grid-cols-3 gap-2">
                    {DIET_TYPES.map(dt => (
                      <button
                        key={dt.value}
                        type="button"
                        onClick={() => updateField('dietType', dt.value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all ${
                          formData.dietType === dt.value
                            ? 'border-[#154212] bg-[#154212] text-white'
                            : 'border-[#e6e9e7] bg-[#f8faf8] text-[#42493e] hover:border-[#154212]/50'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-xl ${formData.dietType === dt.value ? 'text-[#bcf0ae]' : 'text-[#154212]'}`}>
                          {dt.icon}
                        </span>
                        {dt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Region */}
                <div className="bg-white rounded-2xl p-7 shadow-sm border border-[#e6e9e7] space-y-4">
                  <h2 className="font-headline text-lg font-bold text-[#1a2e19]">Regional Cuisine</h2>
                  {errors.region && <p className="text-xs text-red-500">{errors.region}</p>}
                  <div className="grid grid-cols-3 gap-2">
                    {REGIONS.map(r => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => updateField('region', r.value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all ${
                          formData.region === r.value
                            ? 'border-[#2d5a27] bg-[#2d5a27] text-white'
                            : 'border-[#e6e9e7] bg-[#f8faf8] text-[#42493e] hover:border-[#2d5a27]/50'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-xl ${formData.region === r.value ? 'text-[#bcf0ae]' : 'text-[#2d5a27]'}`}>
                          {r.icon}
                        </span>
                        <span className="text-center leading-tight text-xs">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div className="bg-white rounded-2xl p-7 shadow-sm border border-[#e6e9e7] space-y-4">
                  <h2 className="font-headline text-lg font-bold text-[#1a2e19]">Preferred Language</h2>
                  {errors.language && <p className="text-xs text-red-500">{errors.language}</p>}
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => updateField('language', lang)}
                        className={`px-6 py-2.5 rounded-full text-sm font-semibold border transition-all ${
                          formData.language === lang
                            ? 'border-[#154212] bg-[#154212] text-white'
                            : 'border-[#e6e9e7] bg-white text-[#42493e] hover:border-[#154212]/50'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Activity Level */}
                <div className="bg-white rounded-2xl p-7 shadow-sm border border-[#e6e9e7] space-y-4">
                  <h2 className="font-headline text-lg font-bold text-[#1a2e19]">Activity Level</h2>
                  <div className="space-y-2">
                    {ACTIVITY_LEVELS.map((al, idx) => (
                      <button
                        key={al.value}
                        type="button"
                        onClick={() => updateField('activityLevel', al.value)}
                        className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl border text-sm transition-all ${
                          formData.activityLevel === al.value
                            ? 'border-[#154212] bg-[#154212]/5'
                            : 'border-[#e6e9e7] hover:border-[#154212]/40'
                        }`}
                      >
                        {/* Activity bar viz */}
                        <div className="flex gap-0.5 items-end h-5 shrink-0">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-1.5 rounded-sm transition-all ${
                                i <= idx
                                  ? formData.activityLevel === al.value ? 'bg-[#154212]' : 'bg-[#154212]/40'
                                  : 'bg-[#e6e9e7]'
                              }`}
                              style={{ height: `${(i + 1) * 4}px` }}
                            />
                          ))}
                        </div>
                        <div className="flex-1 text-left">
                          <span className={`font-semibold ${formData.activityLevel === al.value ? 'text-[#154212]' : 'text-[#1a2e19]'}`}>
                            {al.label}
                          </span>
                          <span className="text-[#6b7c68] ml-2 text-xs">{al.desc}</span>
                        </div>
                        {formData.activityLevel === al.value && (
                          <span className="material-symbols-outlined text-[#154212] text-lg">radio_button_checked</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Goal */}
                <div className="bg-white rounded-2xl p-7 shadow-sm border border-[#e6e9e7] space-y-4">
                  <h2 className="font-headline text-lg font-bold text-[#1a2e19]">Wellness Goal</h2>
                  {errors.goal && <p className="text-xs text-red-500">{errors.goal}</p>}
                  <div className="grid grid-cols-2 gap-3">
                    {GOALS.map(g => (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => updateField('goal', g.value)}
                        className={`flex items-center gap-3 px-5 py-4 rounded-xl border text-sm font-semibold transition-all ${
                          formData.goal === g.value
                            ? 'border-[#7c5800] bg-[#feb700]/10 text-[#7c5800]'
                            : 'border-[#e6e9e7] bg-[#f8faf8] text-[#42493e] hover:border-[#7c5800]/50'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-xl ${formData.goal === g.value ? 'text-[#7c5800]' : 'text-[#42493e]'}`}>
                          {g.icon}
                        </span>
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCompleteSetup}
                  className="w-full py-4 bg-[#154212] hover:bg-[#2d5a27] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#154212]/20 active:scale-95"
                >
                  <span className="material-symbols-outlined">check_circle</span>
                  Complete Setup
                </button>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}
