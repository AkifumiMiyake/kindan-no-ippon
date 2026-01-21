const TMDB_BASE_URL = 'https://api.themoviedb.org/3/discover/movie'
const DEFAULT_PAGE_COUNT = 2
const STRONG_PAGE_RANGE = 5
const CACHE_TTL_MS = 60 * 60 * 1000
const cache = new Map<string, { timestamp: number; results: any[] }>()

const toYear = (offset: number) => new Date().getFullYear() - offset

const mapScareToParams = (scare: string) => {
  switch (scare) {
    case 'light':
      return {
        sort_by: 'popularity.desc',
        'vote_average.gte': '6.0',
        'vote_count.gte': '500',
      }
    case 'strong':
      return {
        sort_by: 'popularity.desc',
        'vote_count.gte': '60',
      }
    case 'normal':
    default:
      return {
        sort_by: 'popularity.desc',
        'vote_count.gte': '200',
      }
  }
}

const resolveScare = (scare: string) => {
  if (scare !== 'surprise') return scare
  const candidates = ['light', 'normal', 'strong']
  return candidates[Math.floor(Math.random() * candidates.length)]
}

const mapRuntimeToParams = (runtime: string) => {
  switch (runtime) {
    case 'short':
      return { 'with_runtime.lte': '90' }
    case 'long':
      return { 'with_runtime.gte': '121' }
    case 'medium':
    default:
      return { 'with_runtime.gte': '91', 'with_runtime.lte': '120' }
  }
}

const mapEraToParams = (era: string) => {
  switch (era) {
    case 'new':
      return { 'primary_release_date.gte': `${toYear(10)}-01-01` }
    case 'classic':
      return { 'primary_release_date.lte': `${toYear(24)}-12-31` }
    case 'any':
    default:
      return {}
  }
}

const normalizeMovie = (movie: any) => ({
  id: movie.id,
  title: movie.title ?? movie.name ?? 'Untitled',
  overview: movie.overview ?? '',
  release_date: movie.release_date ?? '',
  poster_path: movie.poster_path ?? null,
})

const getCached = (key: string, allowStale = false) => {
  const entry = cache.get(key)
  if (!entry) return null
  if (allowStale) return entry.results
  const isFresh = Date.now() - entry.timestamp < CACHE_TTL_MS
  return isFresh ? entry.results : null
}

const setCached = (key: string, results: any[]) => {
  cache.set(key, { timestamp: Date.now(), results })
}

export default async function handler(req: any, res: any) {
  const token = process.env.TMDB_READ_ACCESS_TOKEN
  if (!token) {
    res.status(500).json({ error: 'TMDB token is missing.' })
    return
  }

  const scareInput = req.query?.scare ?? 'normal'
  const runtime = req.query?.runtime ?? 'medium'
  const era = req.query?.era ?? 'any'
  const scare = resolveScare(String(scareInput))
  const cacheKey = `${scareInput}:${runtime}:${era}`

  const cachedResults = getCached(cacheKey)
  if (cachedResults?.length) {
    const picked = cachedResults[Math.floor(Math.random() * cachedResults.length)]
    res.status(200).json({
      results: cachedResults.map(normalizeMovie),
      picked: normalizeMovie(picked),
      cached: true,
    })
    return
  }

  const baseParams = new URLSearchParams({
    with_genres: '27',
    include_adult: scare === 'strong' ? 'true' : 'false',
    language: 'ja-JP',
  })

  const scareParams = mapScareToParams(String(scare))
  const runtimeParams = mapRuntimeToParams(String(runtime))
  const eraParams = mapEraToParams(String(era))

  Object.entries({ ...scareParams, ...runtimeParams, ...eraParams }).forEach(
    ([key, value]) => {
      baseParams.set(key, value)
    }
  )

  try {
    const pageCount = DEFAULT_PAGE_COUNT
    const requests = Array.from({ length: pageCount }, (_, index) => {
      const params = new URLSearchParams(baseParams)
      if (scare === 'strong') {
        params.set('page', String(1 + Math.floor(Math.random() * STRONG_PAGE_RANGE)))
      } else {
        params.set('page', String(index + 1))
      }
      return fetch(`${TMDB_BASE_URL}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })
    })

    const responses = await Promise.all(requests)
    const payloads = await Promise.all(
      responses.map(async (response) => {
        if (!response.ok) {
          throw new Error('TMDB request failed.')
        }
        return response.json()
      })
    )

    const results = payloads.flatMap((payload) => payload.results ?? [])
    setCached(cacheKey, results)
    const picked = results[Math.floor(Math.random() * results.length)]
    res.status(200).json({
      results: results.map(normalizeMovie),
      picked: picked ? normalizeMovie(picked) : null,
      cached: false,
    })
  } catch (error) {
    const staleResults = getCached(cacheKey, true)
    if (staleResults?.length) {
      const picked =
        staleResults[Math.floor(Math.random() * staleResults.length)]
      res.status(200).json({
        results: staleResults.map(normalizeMovie),
        picked: normalizeMovie(picked),
        cached: true,
        stale: true,
      })
      return
    }
    res.status(500).json({ error: 'Failed to load movies from TMDB.' })
  }
}
