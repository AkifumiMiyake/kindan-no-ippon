import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { I18N, type Locale } from './i18n'

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

type StatusKey = 'fetching' | 'spinning' | ''
type ErrorKey = 'fetch' | 'api' | 'noResults' | 'network' | ''

const DEFAULT_FILTERS: Filters = {
  scare: 'normal',
  runtime: 'medium',
  era: 'any',
}

const FILTER_STORAGE_KEY = 'knippon:filters'
const LOCALE_STORAGE_KEY = 'kni_locale'

const posterUrl = (path: string | null) =>
  path ? `https://image.tmdb.org/t/p/w500${path}` : null

const truncate = (text: string, length = 90) => {
  if (text.length <= length) return text
  return `${text.slice(0, length)}…`
}

const normalizeLocale = (value: string | null): Locale => {
  if (value === 'en' || value === 'ko' || value === 'ja') return value
  return 'ja'
}

function App() {
  const [locale, setLocale] = useState<Locale>(() =>
    normalizeLocale(localStorage.getItem(LOCALE_STORAGE_KEY))
  )
  const t = useMemo(() => I18N[locale], [locale])

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
  const [candidates, setCandidates] = useState<Movie[]>([])
  const [displayIndex, setDisplayIndex] = useState(0)
  const [resultMovie, setResultMovie] = useState<Movie | null>(null)
  const [resultLocale, setResultLocale] = useState<Locale | null>(null)
  const [runtimeMinutes, setRuntimeMinutes] = useState<number | null>(null)
  const [detailTitle, setDetailTitle] = useState<string | null>(null)
  const [detailOverview, setDetailOverview] = useState<string | null>(null)
  const [statusKey, setStatusKey] = useState<StatusKey>('')
  const [errorKey, setErrorKey] = useState<ErrorKey>('')
  const [decided, setDecided] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const timeoutsRef = useRef<number[]>([])

  useEffect(() => {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters))
  }, [filters])

  useEffect(() => {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  }, [locale])

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
    if (!resultMovie) {
      setRuntimeMinutes(null)
      setDetailTitle(null)
      setDetailOverview(null)
      return
    }

    let isMounted = true
    const loadDetails = async () => {
      try {
        setRuntimeMinutes(null)
        setDetailTitle(null)
        setDetailOverview(null)
        const response = await fetch(
          `/api/movie?id=${resultMovie.id}&locale=${locale}`
        )
        if (!response.ok) return
        const data = (await response.json()) as {
          runtime: number | null
          overview: string | null
          title: string | null
        }
        if (!isMounted) return
        setRuntimeMinutes(data.runtime ?? null)
        setDetailTitle(data.title ?? null)
        setDetailOverview(data.overview ?? null)
      } catch {
        if (!isMounted) return
        setRuntimeMinutes(null)
        setDetailTitle(null)
        setDetailOverview(null)
      }
    }

    loadDetails()
    return () => {
      isMounted = false
    }
  }, [resultMovie, locale])

  const year = useMemo(() => {
    if (!resultMovie?.release_date) return ''
    return resultMovie.release_date.slice(0, 4)
  }, [resultMovie])

  const statusText = useMemo(() => {
    switch (statusKey) {
      case 'fetching':
        return t.statusFetching
      case 'spinning':
        return t.statusSpinning
      default:
        return ''
    }
  }, [statusKey, t])

  const errorText = useMemo(() => {
    switch (errorKey) {
      case 'fetch':
        return t.errorFetch
      case 'api':
        return t.errorApiUnavailable
      case 'noResults':
        return t.errorNoResults
      case 'network':
        return t.errorNetwork
      default:
        return ''
    }
  }, [errorKey, t])

  const scareOptions = useMemo(
    () => [
      { value: 'light' as const, label: t.scareLight, sub: t.scareLightSub },
      { value: 'normal' as const, label: t.scareNormal, sub: t.scareNormalSub },
      { value: 'strong' as const, label: t.scareStrong, sub: t.scareStrongSub },
      {
        value: 'surprise' as const,
        label: t.scareSurprise,
        sub: t.scareSurpriseSub,
      },
    ],
    [t]
  )

  const runtimeOptions = useMemo(
    () => [
      { value: 'short' as const, label: t.runtimeShort },
      { value: 'medium' as const, label: t.runtimeMedium },
      { value: 'long' as const, label: t.runtimeLong },
    ],
    [t]
  )

  const eraOptions = useMemo(
    () => [
      { value: 'new' as const, label: t.eraNew },
      { value: 'classic' as const, label: t.eraClassic },
      { value: 'any' as const, label: t.eraAny },
    ],
    [t]
  )

  const clearTimers = () => {
    timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
    timeoutsRef.current = []
  }

  const handleSpin = async () => {
    if (isSpinning || decided) return
    setDecided(false)
    setErrorKey('')
    setStatusKey('fetching')
    setIsSpinning(true)
    setResultMovie(null)
    setResultLocale(null)
    setRuntimeMinutes(null)
    setDetailTitle(null)
    setDetailOverview(null)
    setIsModalOpen(false)

    let handledError: ErrorKey = ''
    const setHandledError = (key: ErrorKey) => {
      handledError = key
      setErrorKey(key)
    }

    try {
      const params = new URLSearchParams({
        scare: filters.scare,
        runtime: filters.runtime,
        era: filters.era,
        locale,
      })
      const response = await fetch(`/api/discover?${params.toString()}`)
      if (!response.ok) {
        setHandledError('fetch')
        throw new Error('fetch failed')
      }
      let data: { results: Movie[]; picked?: Movie | null }
      try {
        data = (await response.json()) as {
          results: Movie[]
          picked?: Movie | null
        }
      } catch {
        setHandledError('api')
        throw new Error('api invalid')
      }
      if (!data.results.length) {
        setHandledError('noResults')
        throw new Error('no results')
      }
      setCandidates(data.results)
      runSpin(data.results, data.picked ?? undefined)
    } catch (caught) {
      if (!handledError) {
        setHandledError('network')
      }
      setIsSpinning(false)
      setStatusKey('')
    }
  }

  const runSpin = (movies: Movie[], pickedMovie?: Movie) => {
    clearTimers()

    const steps = 20
    let elapsed = 0
    setStatusKey('spinning')
    setDisplayIndex(Math.floor(Math.random() * movies.length))

    for (let i = 0; i < steps; i += 1) {
      const progress = i / steps
      const delay = Math.round(50 + progress * progress * 240)
      elapsed += delay
      const timeoutId = window.setTimeout(() => {
        setDisplayIndex(Math.floor(Math.random() * movies.length))
      }, elapsed)
      timeoutsRef.current.push(timeoutId)
    }

    const finalizeId = window.setTimeout(() => {
      const finalMovie = pickedMovie ?? movies[Math.floor(Math.random() * movies.length)]
      setResultMovie(finalMovie)
      setResultLocale(locale)
      setIsSpinning(false)
      setStatusKey('')
      setIsModalOpen(true)
    }, elapsed + 140)
    timeoutsRef.current.push(finalizeId)
  }

  const handleDecide = () => {
    if (!resultMovie) return
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

  const displayMovie = useMemo(() => {
    if (isSpinning && candidates.length) {
      return candidates[displayIndex % candidates.length]
    }
    return resultMovie
  }, [isSpinning, candidates, displayIndex, resultMovie])

  const displayPoster = useMemo(
    () => posterUrl(displayMovie?.poster_path ?? null),
    [displayMovie]
  )

  const titleText =
    detailTitle ?? (resultLocale === locale ? resultMovie?.title ?? '' : '')
  const overviewText =
    detailOverview ??
    (resultLocale === locale ? resultMovie?.overview ?? '' : '')
  const overviewDisplay =
    overviewText && overviewText.trim().length > 0
      ? truncate(overviewText, 120)
      : resultMovie && resultLocale !== locale
        ? t.loadingDetails
        : t.overviewFallback

  return (
    <div className="page">
      <div className="locale-selector">
        <label className="locale-label" htmlFor="locale-select">
          {t.languageLabel}
        </label>
        <select
          id="locale-select"
          className="locale-select"
          value={locale}
          onChange={(event) => setLocale(event.target.value as Locale)}
        >
          <option value="ja">日本語</option>
          <option value="en">English</option>
          <option value="ko">한국어</option>
        </select>
      </div>

      <header className="hero">
        <p className="kicker">{t.kicker}</p>
        <h1 className="title">{t.appTitle}</h1>
        <p className="subtitle">{t.subtitle}</p>
        <p className="notice">
          {t.noticeLine1}
          <br />
          {t.noticeLine2}
        </p>
      </header>

      <section className="panel">
        <div className="controls">
          <fieldset className="control-group" disabled={isSpinning}>
            <legend className="control-legend">{t.scareLegend}</legend>
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
            <legend className="control-legend">{t.runtimeLegend}</legend>
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
            <legend className="control-legend">{t.eraLegend}</legend>
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
            {isSpinning ? t.spinningButton : t.spinButton}
          </button>
          {isSpinning && <p className="hint">{t.spinningHint}</p>}
          {resultMovie && !isSpinning && (
            <button
              type="button"
              className="ghost-button"
              onClick={() => setIsModalOpen(true)}
            >
              {t.resultAgain}
            </button>
          )}
          {statusText && <p className="status">{statusText}</p>}
          {errorText && <p className="error">{errorText}</p>}
        </div>
      </section>

      <section className="seo-block" aria-label="about">
        <h2 className="seo-title">{t.sectionHeadline}</h2>
        <p className="seo-description">{t.sectionDescription}</p>
      </section>

      {isModalOpen && resultMovie && (
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
              aria-label={t.closeLabel}
            >
              ×
            </button>
            <div className="result-media">
              {displayPoster ? (
                <img src={displayPoster} alt={titleText} />
              ) : (
                <div className="poster-fallback">{t.noPoster}</div>
              )}
            </div>
            <div className="result-body">
              <p className="result-label">{t.resultLabel}</p>
              <h2 className="result-title" id="result-title">
                {titleText || t.loadingDetails}
              </h2>
              <p className="result-meta">
                {year ? t.releaseYear(year) : t.releaseUnknown}
              </p>
              <p className="result-meta">
                {runtimeMinutes ? t.runtimeMinutes(runtimeMinutes) : t.runtimeUnknown}
              </p>
              <p className="result-overview">
                {overviewDisplay}
              </p>

              <div className="result-actions">
                <button
                  type="button"
                  className="decide-button"
                  onClick={handleDecide}
                  disabled={decided}
                >
                  {decided ? t.decidedButton : t.decideButton}
                </button>
                {!decided && (
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={handleRespin}
                  >
                    {t.respinButton}
                  </button>
                )}
                <a
                  className="ghost-button"
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                    `${titleText || resultMovie.title} trailer`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t.trailerButton}
                </a>
              </div>
              {decided && (
                <p className="decision-note">
                  {t.decisionLine1}
                  <br />
                  {t.decisionLine2}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="footer">{t.footerCredit}</footer>
    </div>
  )
}

export default App
