const TMDB_BASE_URL = 'https://api.themoviedb.org/3/movie'

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
  if (!id) {
    res.status(400).json({ error: 'Movie id is required.' })
    return
  }

  try {
    const payload = await fetchMovie(String(id), token, 'ja-JP')
    let overview = payload.overview ?? ''

    if (!overview) {
      const fallback = await fetchMovie(String(id), token, 'en-US')
      overview = fallback.overview ?? ''
    }

    res.status(200).json({
      runtime: payload.runtime ?? null,
      overview: overview || null,
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to load movie details.' })
  }
}
