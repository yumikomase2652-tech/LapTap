import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

type Lap = {
  number: number
  total: number
  split: number
}

type Session = {
  id: string
  finishedAt: string
  total: number
  laps: Lap[]
}

type StoredData = {
  lastResult: Session | null
  history: Session[]
}

const STORAGE_KEY = 'laptap-data-v1'
const LAP_LOCK_MS = 300

function formatTime(ms: number) {
  const safeMs = Math.max(0, ms)
  const minutes = Math.floor(safeMs / 60_000)
  const seconds = Math.floor((safeMs % 60_000) / 1_000)
  const hundredths = Math.floor((safeMs % 1_000) / 10)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`
}

function loadStoredData(): StoredData {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')
    return {
      lastResult: parsed.lastResult ?? null,
      history: Array.isArray(parsed.history) ? parsed.history.slice(0, 10) : [],
    }
  } catch {
    return { lastResult: null, history: [] }
  }
}

function App() {
  const initialData = useRef(loadStoredData()).current
  const [isRunning, setIsRunning] = useState(false)
  const [elapsed, setElapsed] = useState(initialData.lastResult?.total ?? 0)
  const [laps, setLaps] = useState<Lap[]>(initialData.lastResult?.laps ?? [])
  const [history, setHistory] = useState<Session[]>(initialData.history)

  const startAtRef = useRef(0)
  const elapsedBeforeStartRef = useRef(0)
  const elapsedRef = useRef(elapsed)
  const lapsRef = useRef(laps)
  const runningRef = useRef(false)
  const lapListRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    elapsedRef.current = elapsed
  }, [elapsed])

  useEffect(() => {
    lapsRef.current = laps
  }, [laps])

  const persist = useCallback((session: Session | null, nextHistory = history) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ lastResult: session, history: nextHistory } satisfies StoredData),
    )
  }, [history])

  const start = useCallback(() => {
    startAtRef.current = performance.now()
    elapsedBeforeStartRef.current = elapsedRef.current
    if (lapListRef.current) lapListRef.current.scrollTop = 0
    runningRef.current = true
    setIsRunning(true)
  }, [])

  const reset = useCallback(() => {
    runningRef.current = false
    elapsedRef.current = 0
    lapsRef.current = []
    elapsedBeforeStartRef.current = 0
    setIsRunning(false)
    setElapsed(0)
    setLaps([])
    persist(null)
  }, [persist])

  const stop = useCallback(() => {
    const finalElapsed = elapsedBeforeStartRef.current + performance.now() - startAtRef.current
    const session: Session = {
      id: crypto.randomUUID(),
      finishedAt: new Date().toISOString(),
      total: finalElapsed,
      laps: lapsRef.current,
    }
    const nextHistory = [session, ...history].slice(0, 10)

    elapsedRef.current = finalElapsed
    runningRef.current = false
    setElapsed(finalElapsed)
    setIsRunning(false)
    setHistory(nextHistory)
    persist(session, nextHistory)
  }, [history, persist])

  const addLap = useCallback(() => {
    const total = elapsedBeforeStartRef.current + performance.now() - startAtRef.current
    const previousTotal = lapsRef.current.at(-1)?.total ?? 0
    const lap: Lap = {
      number: lapsRef.current.length + 1,
      total,
      split: total - previousTotal,
    }
    const nextLaps = [...lapsRef.current, lap]
    lapsRef.current = nextLaps
    setLaps(nextLaps)
  }, [])

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return

    if (runningRef.current) {
      event.preventDefault()
      const zone = event.clientY < window.innerHeight / 2 ? 'stop' : 'lap'
      if (zone === 'stop') {
        stop()
      } else if (performance.now() - startAtRef.current >= LAP_LOCK_MS) {
        addLap()
      }
      return
    }

    start()
  }, [addLap, start, stop])

  const handleResetPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    reset()
  }

  useEffect(() => {
    if (!isRunning) return
    let animationFrame = 0
    const update = () => {
      const nextElapsed = elapsedBeforeStartRef.current + performance.now() - startAtRef.current
      elapsedRef.current = nextElapsed
      setElapsed(nextElapsed)
      animationFrame = requestAnimationFrame(update)
    }
    animationFrame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(animationFrame)
  }, [isRunning])

  useEffect(() => {
    if (isRunning && lapListRef.current) lapListRef.current.scrollTop = 0
  }, [isRunning, laps.length])

  const latestLap = laps.at(-1)
  const completedLaps = [...laps].reverse()

  return (
    <main
      aria-label={isRunning ? 'LapTap running stopwatch' : 'Tap anywhere to start LapTap'}
      className={`app ${isRunning ? 'is-running' : 'is-stopped'}`}
      onPointerDown={handlePointerDown}
    >
      {!isRunning && (
        <button
          className="reset-button"
          type="button"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={handleResetPointerDown}
        >
          RESET
        </button>
      )}

      <div
        aria-hidden="true"
        className="tap-zone tap-zone--top"
      >
        {isRunning && <span className="zone-label">STOP</span>}
      </div>

      <section className="display" aria-live="polite">
        <div className="brand-row">
          <span className="brand">LAPTAP</span>
          <span className={`status ${isRunning ? 'status--running' : ''}`}>
            {isRunning ? 'RUNNING' : elapsed > 0 ? 'STOPPED' : 'READY'}
          </span>
        </div>

        {!isRunning && (
          <div className="start-prompt">
            TAP TO START
          </div>
        )}

        <div className="time">{formatTime(elapsed)}</div>

        <div
          className="lap-panel"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <div className="lap-panel__head">
            <span>{latestLap ? `${laps.length} LAPS` : 'LAP HISTORY'}</span>
            {latestLap && <strong>LAST {formatTime(latestLap.split)}</strong>}
          </div>
          <div
            className="lap-list"
            ref={lapListRef}
          >
            {completedLaps.length === 0 ? (
              <div className="empty">
                <span>{history.length ? `${history.length} sessions saved` : 'No laps yet'}</span>
                <small>{isRunning ? '下半分をタップでLAP' : '記録したラップをここに表示'}</small>
              </div>
            ) : completedLaps.map((lap) => (
              <div className="lap-row" key={lap.number}>
                <strong><span>LAP</span>{String(lap.number).padStart(2, '0')}</strong>
                <div><span>Total</span>{formatTime(lap.total)}</div>
                <div><span>Split</span>{formatTime(lap.split)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div
        aria-hidden="true"
        className="tap-zone tap-zone--bottom"
      >
        {isRunning && <span className="zone-label">LAP</span>}
      </div>
    </main>
  )
}

export default App
