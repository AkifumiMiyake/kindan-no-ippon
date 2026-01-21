import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

type ScareLevel = 'light' | 'normal' | 'strong' | 'surprise'
type RuntimeRange = 'short' | 'medium' | 'long'
type Era = 'new' | 'classic' | 'any'

type Movie = {
  id: number
  title: string
  overview: string
  release_date: string
  poster_path: string | null
}

type Filters = {
  scare: ScareLevel
  runtime: RuntimeRange
  era: Era
}

const DEFAULT_FILTERS: Filters = {
  scare: 'normal',
  runtime: 'medium',
  era: 'any',
}

const FILTER_STORAGE_KEY = 'knippon:filters'

const scareOptions: Array<{ value: ScareLevel; label: string; sub: string }> = [
  { value: 'light', label: '軽め', sub: '心理・雰囲気' },
  { value: 'normal', label: '普通', sub: '王道ホラー' },
  { value: 'strong', label: '強め', sub: '過激OK' },
  { value: 'surprise', label: 'おまかせ', sub: '全開放' },
]

const runtimeOptions: Array<{ value: RuntimeRange; label: string }> = [
  { value: 'short', label: '〜90分' },
  { value: 'medium', label: '90〜120分' },
  { value: 'long', label: '120分〜' },
]

const eraOptions: Array<{ value: Era; label: string }> = [
  { value: 'new', label: '新しめ' },
  { value: 'classic', label: '名作' },
  { value: 'any', label: 'こだわらない' },
]

const truncate = (text: string, length = 90) => {
  if (text.length <= length) return text
  return `${text.slice(0, length)}…`
}

const posterUrl = (path: string | null) =>
  path ? `https://image.tmdb.org/t/p/w500${path}` : null

function App() {
  const [filters, setFilters] = useState<Filters>(() => {
    const saved = localStorage.getItem(FILTER_STORAGE_KEY)
    if (!saved) return DEFAULT_FILTERS
    try {
      const parsed = JSON.parse(saved) as Filters
      return { ...DEFAULT_FILTERS, ...parsed }
    } catch {
      return DEFAULT_FILTERS
    }
  })
  const [isSpinning, setIsSpinning] = useState(false)
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null)
  const [result, setResult] = useState<Movie | null>(null)
  const [runtimeMinutes, setRuntimeMinutes] = useState<number | null>(null)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [decided, setDecided] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const timeoutsRef = useRef<number[]>([])

  useEffect(() => {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters))
  }, [filters])

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
      timeoutsRef.current = []
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isModalOpen])

  useEffect(() => {
    if (!result) {
      setRuntimeMinutes(null)
      return
    }
    let isMounted = true
    const loadRuntime = async () => {
      try {
        const response = await fetch(`/api/movie?id=${result.id}`)
        if (!response.ok) return
        const data = (await response.json()) as { runtime: number | null }
        if (isMounted) setRuntimeMinutes(data.runtime ?? null)
      } catch {
        if (isMounted) setRuntimeMinutes(null)
      }
    }
    loadRuntime()
    return () => {
      isMounted = false
    }
  }, [result])

  const year = useMemo(() => {
    if (!result?.release_date) return ''
    return result.release_date.slice(0, 4)
  }, [result])

  const handleSpin = async () => {
    if (isSpinning || decided) return
    setDecided(false)
    setError('')
    setStatus('候補を集めています…')
    setIsSpinning(true)
    setResult(null)
    setRuntimeMinutes(null)
    setIsModalOpen(false)

    try {
      const params = new URLSearchParams({
        scare: filters.scare,
        runtime: filters.runtime,
        era: filters.era,
      })
      const response = await fetch(`/api/discover?${params.toString()}`)
      if (!response.ok) {
        throw new Error('TMDBから候補を取得できませんでした。')
      }
      let data: { results: Movie[]; picked?: Movie | null }
      try {
        data = (await response.json()) as {
          results: Movie[]
          picked?: Movie | null
        }
      } catch {
        throw new Error(
          'APIが応答していません。`vercel dev` で起動してください。'
        )
      }
      if (!data.results.length) {
        throw new Error('条件に合う作品が見つかりませんでした。')
      }
      runSpin(data.results, data.picked ?? undefined)
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : '通信に失敗しました。'
      setError(message)
      setIsSpinning(false)
      setStatus('')
    }
  }

  const runSpin = (movies: Movie[], pickedMovie?: Movie) => {
    timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
    timeoutsRef.current = []

    const steps = 26
    let elapsed = 0
    let latest = movies[Math.floor(Math.random() * movies.length)]
    setCurrentMovie(latest)
    setStatus('ルーレットが回っています…')

    for (let i = 0; i < steps; i += 1) {
      const progress = i / steps
      const delay = Math.round(45 + progress * progress * 220)
      elapsed += delay
      const timeoutId = window.setTimeout(() => {
        latest = movies[Math.floor(Math.random() * movies.length)]
        setCurrentMovie(latest)
      }, elapsed)
      timeoutsRef.current.push(timeoutId)
    }

    const finalizeId = window.setTimeout(() => {
      const finalMovie = pickedMovie ?? latest
      setResult(finalMovie)
      setCurrentMovie(finalMovie)
      setIsSpinning(false)
      setStatus('')
      setIsModalOpen(true)
    }, elapsed + 120)
    timeoutsRef.current.push(finalizeId)
  }

  const handleDecide = () => {
    if (!result) return
    setDecided(true)
  }

  const handleRespin = () => {
    handleSpin()
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    if (decided) {
      setDecided(false)
    }
  }

  const displayMovie = currentMovie ?? result
  const displayPoster = posterUrl(displayMovie?.poster_path ?? null)

  return (
    <div className="page">
      <header className="hero">
        <p className="kicker">回したら、戻れない。</p>
        <h1 className="title">禁断の一本</h1>
        <p className="subtitle">ルーレットが決める、今夜の一本。</p>
        <p className="notice">
          ホラー映画の中から、今夜観る一本を
          <br />
          ルーレットで決めるアプリです。
        </p>
      </header>

      <section className="panel">
        <div className="controls">
          <fieldset className="control-group" disabled={isSpinning}>
            <legend className="control-legend">怖さレベル</legend>
            <div className="segmented">
              {scareOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={filters.scare === option.value ? 'active' : ''}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, scare: option.value }))
                  }
                >
                  <span>{option.label}</span>
                  <small>{option.sub}</small>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="control-group" disabled={isSpinning}>
            <legend className="control-legend">尺</legend>
            <div className="segmented">
              {runtimeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={filters.runtime === option.value ? 'active' : ''}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, runtime: option.value }))
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="control-group" disabled={isSpinning}>
            <legend className="control-legend">新しさ</legend>
            <div className="segmented">
              {eraOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={filters.era === option.value ? 'active' : ''}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, era: option.value }))
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="actions">
          <button
            type="button"
            className="spin-button"
            onClick={handleSpin}
            disabled={isSpinning || decided}
          >
            {isSpinning ? '運命が回転中…' : '恐怖を回す'}
          </button>
          {isSpinning && (
            <p className="hint">停止まで操作できません。深呼吸して待って。</p>
          )}
          {result && !isSpinning && (
            <button
              type="button"
              className="ghost-button"
              onClick={() => setIsModalOpen(true)}
            >
              結果をもう一度見る
            </button>
          )}
          {status && <p className="status">{status}</p>}
          {error && <p className="error">{error}</p>}
        </div>
      </section>

      {isModalOpen && result && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="result-title"
          onClick={handleCloseModal}
        >
          <div
            className={`modal-card ${decided ? 'decided' : ''}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={handleCloseModal}
              aria-label="閉じる"
            >
              ×
            </button>
            <div className="result-media">
              {displayPoster ? (
                <img src={displayPoster} alt={displayMovie?.title ?? ''} />
              ) : (
                <div className="poster-fallback">No Poster</div>
              )}
            </div>
            <div className="result-body">
              <p className="result-label">TONIGHT</p>
              <h2 className="result-title" id="result-title">
                {result.title}
              </h2>
              <p className="result-meta">
                {year ? `公開：${year}` : '公開年不明'}
              </p>
              <p className="result-meta">
                {runtimeMinutes ? `上映時間：${runtimeMinutes}分` : '上映時間不明'}
              </p>
              <p className="result-overview">
                {result.overview
                  ? truncate(result.overview, 120)
                  : '今夜の一本、決定。'}
              </p>

              <div className="result-actions">
                <button
                  type="button"
                  className="decide-button"
                  onClick={handleDecide}
                  disabled={decided}
                >
                  {decided ? '決まりました' : '今夜はこれにする'}
                </button>
                {!decided && (
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={handleRespin}
                  >
                    もう一回怖がる
                  </button>
                )}
                <a
                  className="ghost-button"
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                    `${result.title} trailer`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  予告編をYouTubeで検索
                </a>
              </div>
              {decided && (
                <p className="decision-note">
                  今夜は、これでいきましょう。
                  <br />
                  いい時間になりますように。
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        This product uses the TMDB API but is not endorsed or certified by
        TMDB.
      </footer>
    </div>
  )
}

export default App
