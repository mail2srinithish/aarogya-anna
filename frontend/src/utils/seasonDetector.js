/**
 * Detect current Indian season and upcoming festival based on date
 */

export function getCurrentSeason(date = new Date()) {
  const month = date.getMonth() + 1 // 1-12
  if (month >= 3 && month <= 5) return 'summer'
  if (month >= 6 && month <= 9) return 'monsoon'
  if (month >= 10 && month <= 11) return 'autumn'
  return 'winter' // Dec-Feb
}

const FESTIVALS = [
  { name: 'Pongal', month: 1, day: 14 },
  { name: 'Holi', month: 3, day: 25 },
  { name: 'Ram Navami', month: 4, day: 6 },
  { name: 'Eid-ul-Fitr', month: 4, day: 10 },
  { name: 'Onam', month: 9, day: 5 },
  { name: 'Navratri', month: 10, day: 3 },
  { name: 'Dussehra', month: 10, day: 12 },
  { name: 'Diwali', month: 10, day: 20 },
  { name: 'Christmas', month: 12, day: 25 },
]

export function getUpcomingFestival(date = new Date()) {
  const today = date
  const upcoming = FESTIVALS.find((f) => {
    const festDate = new Date(today.getFullYear(), f.month - 1, f.day)
    const diff = (festDate - today) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 7
  })
  return upcoming?.name || null
}

export function getSeasonalFoodTags(season) {
  const tags = {
    summer: ['cooling', 'hydrating', 'light', 'mango', 'cucumber', 'buttermilk'],
    monsoon: ['immunity', 'ginger', 'turmeric', 'warm', 'herbal', 'anti-inflammatory'],
    winter: ['warming', 'sesame', 'jaggery', 'ghee', 'protein-rich', 'root-vegetables'],
    autumn: ['balanced', 'seasonal', 'fiber-rich'],
  }
  return tags[season] || tags.autumn
}
