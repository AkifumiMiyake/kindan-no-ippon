const TMDB_BASE_URL = 'https://api.themoviedb.org/3/movie'

const resolveLocale = (locale: string) => {
  if (locale === 'en' || locale === 'ko' || locale === 'ja') return locale
  return 'ja'
}

const localeToLanguage = (locale: string) => {
  switch (locale) {
    case 'en':
      return 'en-US'
    case 'ko':
      return 'ko-KR'
    case 'ja':
    default:
      return 'ja-JP'
  }
}

const fetchMovie = async (id: string, token: string, language: string) => {
  const response = await fetch(`${TMDB_BASE_URL}/${id}?language=${language}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('TMDB request failed.')
  }

  return response.json()
}

export default async function handler(req: any, res: any) {
  const token = process.env.TMDB_READ_ACCESS_TOKEN
  if (!token) {
    res.status(500).json({ error: 'TMDB token is missing.' })
    return
  }

  const id = req.query?.id
  const locale = resolveLocale(String(req.query?.locale ?? 'ja'))
  if (!id) {
    res.status(400).json({ error: 'Movie id is required.' })
    return
  }

  try {
    const payload = await fetchMovie(
      String(id),
      token,
      localeToLanguage(locale)
    )
    let overview = payload.overview ?? ''
    let title = payload.title ?? payload.name ?? ''

    if (!overview) {
      const fallback = await fetchMovie(String(id), token, 'en-US')
      overview = fallback.overview ?? ''
    }

    res.status(200).json({
      runtime: payload.runtime ?? null,
      overview: overview || null,
      title: title || null,
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to load movie details.' })
  }
}
