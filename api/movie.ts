const TMDB_BASE_URL = 'https://api.themoviedb.org/3/movie'

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
    const response = await fetch(`${TMDB_BASE_URL}/${id}?language=ja-JP`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('TMDB request failed.')
    }

    const payload = await response.json()
    res.status(200).json({ runtime: payload.runtime ?? null })
  } catch (error) {
    res.status(500).json({ error: 'Failed to load movie details.' })
  }
}
