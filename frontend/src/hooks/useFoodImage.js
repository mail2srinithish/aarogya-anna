/**
 * useFoodImage — resolves a display image URL for any food item.
 *
 * Priority order:
 *   1. item.image_url   (TheMealDB / Open Food Facts — already has an image)
 *   2. Wikipedia REST API thumbnail  (fetched once, stored in sessionStorage)
 *   3. null  → caller falls back to emoji display
 */
import { useQuery } from '@tanstack/react-query'
import { getWikiTitle } from '../utils/foodImageMap'

const WIKI_API = 'https://en.wikipedia.org/api/rest_v1/page/summary/'
const SS_PREFIX = 'aa_wimg_'   // sessionStorage key prefix

async function fetchWikiThumb(title) {
  if (!title) return null

  // Check sessionStorage cache first (survives page navigation, clears on tab close)
  const cached = sessionStorage.getItem(SS_PREFIX + title)
  if (cached !== undefined && cached !== null) return cached || null   // '' means "tried, no image"

  try {
    const res = await fetch(
      `${WIKI_API}${encodeURIComponent(title)}`,
      { headers: { Accept: 'application/json' } }
    )
    if (!res.ok) {
      sessionStorage.setItem(SS_PREFIX + title, '')
      return null
    }
    const data = await res.json()
    // Bump thumbnail to 400px wide for better quality
    const src = data.thumbnail?.source?.replace(/\/\d+px-/, '/400px-') ?? ''
    sessionStorage.setItem(SS_PREFIX + title, src)
    return src || null
  } catch {
    sessionStorage.setItem(SS_PREFIX + title, '')
    return null
  }
}

/**
 * @param {object} item  – food item from any source
 * @returns {{ imageUrl: string|null, isLoading: boolean }}
 */
export function useFoodImage(item) {
  const hasStatic = Boolean(item?.image_url)
  const wikiTitle = hasStatic ? null : getWikiTitle(item)

  const { data, isLoading } = useQuery({
    queryKey: ['wikiImg', wikiTitle],
    queryFn: () => fetchWikiThumb(wikiTitle),
    staleTime: Infinity,
    gcTime:    Infinity,
    retry: 1,
    enabled: !hasStatic && Boolean(wikiTitle),
  })

  if (hasStatic) return { imageUrl: item.image_url, isLoading: false }
  return { imageUrl: data ?? null, isLoading }
}
