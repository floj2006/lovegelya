import { useState, useEffect, useCallback, useRef } from 'react'
import { Heart } from 'lucide-react'
import './MainPage.css'
import { playClick, playChime, playMaxLove, toggleAmbient } from './sounds'

const TOGETHER_SINCE = new Date('2020-12-20')

const BURST_CHARS = ['♥', '♡', '◆', '✦', '★', '●', '❤']

const MESSAGES = [
  'люблю тебя, Геля. не говорю часто, но люблю',
  'ты моя и ничего не поделаешь',
  'рад что ты есть',
  'ты лучшая. это факт.',
  'не представляю без тебя',
  'ты вообще знаешь что я о тебе думаю?',
  'иди сюда, обниму',
]

const REASONS = [
  '[+] твоя улыбка',
  '[+] как ты меня иногда бесишь, но всё равно',
  '[+] что ты выбрала именно меня',
  '[+] твои глаза',
  '[+] что ты своя',
  '[+] в общем — ты',
]

/* ── Together counter ── */
function TogetherCounter() {
  const [elapsed, setElapsed] = useState(null)
  useEffect(() => {
    const calc = () => {
      const diff = Date.now() - TOGETHER_SINCE.getTime()
      if (diff < 0) return
      setElapsed({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000)  / 60000),
        seconds: Math.floor((diff % 60000)    / 1000),
      })
    }
    calc()
    const iv = setInterval(calc, 1000)
    return () => clearInterval(iv)
  }, [])

  if (!elapsed) return null
  const pad = n => String(n).padStart(2, '0')
  return (
    <div className="together-counter">
      <span className="prompt">МЫ ВМЕСТЕ:</span>
      <span className="counter-val">
        {elapsed.days} дн&nbsp;{pad(elapsed.hours)}:{pad(elapsed.minutes)}:
        <span className="counter-sec">{pad(elapsed.seconds)}</span>
      </span>
    </div>
  )
}

/* ── Typewriter ── */
function Typewriter({ text }) {
  const [shown, setShown] = useState('')
  const [done,  setDone]  = useState(false)
  useEffect(() => {
    let i = 0
    setShown('')
    setDone(false)
    const iv = setInterval(() => {
      i++
      setShown(text.slice(0, i))
      if (i >= text.length) { clearInterval(iv); setDone(true) }
    }, 32)
    return () => clearInterval(iv)
  }, [text])
  return <>{shown}{!done && <span className="blink">▊</span>}</>
}

/* ── Reason tag ── */
function ReasonTag({ text }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className={`reason-tag${visible ? ' visible' : ''}`}>
      <span className="reason-arrow">›</span>{text}
    </div>
  )
}

/* ── Idle overlay ── */
function IdleOverlay({ onDismiss }) {
  return (
    <div className="idle-overlay" onClick={onDismiss}>
      <div className="idle-connection">connection established</div>
      <div className="idle-main">ты — мой дом</div>
      <div className="idle-hint">// нажми чтобы вернуться</div>
    </div>
  )
}

/* ── Main page ── */
export function MainPage({ onLetter }) {
  const [bursts,         setBursts]         = useState([])
  const [message,        setMessage]        = useState('')
  const [showMsg,        setShowMsg]        = useState(false)
  const [reasons,        setReasons]        = useState([])
  const [clickCount,     setClickCount]     = useState(0)
  const [loveMaxed,      setLoveMaxed]      = useState(false)
  const [showMaxOverlay, setShowMaxOverlay] = useState(false)
  const [idleActive,     setIdleActive]     = useState(false)
  const [soundOn,        setSoundOn]        = useState(false)

  const msgIdx    = useRef(0)
  const reasonIdx = useRef(0)
  const idleTimer = useRef(null)

  const lovePct = Math.min(Math.round((reasonIdx.current / REASONS.length) * 100), 100)
  const filled  = Math.floor(lovePct / 5)
  const loveBar = '█'.repeat(filled) + '░'.repeat(20 - filled)

  /* ── Idle detection: 25 sec without movement ── */
  useEffect(() => {
    const reset = () => {
      setIdleActive(false)
      clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(() => setIdleActive(true), 25000)
    }
    reset()
    window.addEventListener('mousemove',  reset)
    window.addEventListener('touchstart', reset)
    window.addEventListener('keydown',    reset)
    window.addEventListener('click',      reset)
    return () => {
      clearTimeout(idleTimer.current)
      window.removeEventListener('mousemove',  reset)
      window.removeEventListener('touchstart', reset)
      window.removeEventListener('keydown',    reset)
      window.removeEventListener('click',      reset)
    }
  }, [])

  const handleSound = () => {
    const on = toggleAmbient()
    setSoundOn(on)
  }

  const handleClick = useCallback(e => {
    playClick()

    setShowMsg(false)
    const next = MESSAGES[msgIdx.current % MESSAGES.length]
    msgIdx.current++
    setTimeout(() => { setMessage(next); setShowMsg(true); playChime() }, 180)

    if (reasonIdx.current < REASONS.length) {
      const idx = reasonIdx.current++
      setReasons(prev => [...prev, { id: idx, text: REASONS[idx] }])

      if (reasonIdx.current >= REASONS.length && !loveMaxed) {
        setLoveMaxed(true)
        setTimeout(() => {
          setShowMaxOverlay(true)
          playMaxLove()
          setTimeout(() => setShowMaxOverlay(false), 4000)
        }, 300)
      }
    }

    setClickCount(c => c + 1)

    const rect = e.currentTarget.getBoundingClientRect()
    const cx   = rect.left + rect.width  / 2
    const cy   = rect.top  + rect.height / 2

    const batch = Array.from({ length: 16 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 16 + (Math.random() - 0.5) * 0.5
      const dist  = 50 + Math.random() * 110
      return {
        id:    crypto.randomUUID(),
        char:  BURST_CHARS[Math.floor(Math.random() * BURST_CHARS.length)],
        x: cx, y: cy,
        tx:    `${Math.cos(angle) * dist}px`,
        ty:    `${Math.sin(angle) * dist}px`,
        delay: Math.random() * 0.1,
      }
    })
    setBursts(prev => [...prev, ...batch])
    setTimeout(() => {
      const ids = new Set(batch.map(b => b.id))
      setBursts(prev => prev.filter(b => !ids.has(b.id)))
    }, 1200)
  }, [loveMaxed])

  return (
    <div className="main-page page-enter">

      {/* Burst */}
      {bursts.map(b => (
        <div key={b.id} className="burst-particle" style={{
          left: `${b.x}px`, top: `${b.y}px`,
          animationDelay: `${b.delay}s`,
          '--tx': b.tx, '--ty': b.ty,
        }}>{b.char}</div>
      ))}

      {/* SYSTEM OVERLOAD overlay */}
      {showMaxOverlay && (
        <div className="max-love-overlay">
          <div className="overflow-lines">
            {Array(9).fill(0).map((_, i) => (
              <div key={i} className="overflow-line"
                style={{ animationDelay: `${i * 0.07}s` }}>
                I LOVE YOU
              </div>
            ))}
          </div>
          <div className="overflow-error">
            SYSTEM_OVERLOAD.exe<br />
            <span>reason: Angelina</span>
          </div>
        </div>
      )}

      {/* Idle Easter egg */}
      {idleActive && <IdleOverlay onDismiss={() => setIdleActive(false)} />}

      {/* Terminal card */}
      <main className="card">
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="corner corner-bl" />
        <div className="corner corner-br" />

        <div className="term-header">
          <span className="term-dot" />
          <span className="term-dot" />
          <span className="term-dot" />
          <span className="term-title">письмо_для_ангелины.txt — открыто с любовью</span>
          <button className="sound-btn" onClick={handleSound} title="ambient sound">
            {soundOn ? '♪' : '♫'}
          </button>
        </div>

        {/* Last login */}
        <div className="last-login">
          <span>&gt; last login: 03:17</span>
          <span className="last-reason">// reason: скучал</span>
        </div>

        <div className="card-inner">

          <div className="photo">
            <Heart size={44} color="#ff1a5e" fill="#ff1a5e"
              style={{ filter: 'drop-shadow(0 0 14px #ff1a5e) drop-shadow(0 0 28px #ff004488)' }}
            />
          </div>

          <h1 data-text="АНГЕЛИНА">АНГЕЛИНА</h1>

          <p className="subtitle">
            // привет, Геля. <span className="blink">▊</span>
          </p>

          <TogetherCounter />

          <div className="love-meter">
            <span className="prompt">МОЯ ЛЮБОВЬ К ТЕБЕ:</span>
            <span className={`love-bar${loveMaxed ? ' maxed' : ''}`}>
              [{loveBar}] {lovePct}%
            </span>
          </div>

          <div className="message">
            <span className="prompt">$</span>
            {' "Геля, я тебя люблю, и просто хочу чтоб ты это знала."'}
          </div>

          <div className="reasons">
            {reasons.map(r => <ReasonTag key={r.id} text={r.text} />)}
          </div>

          <div className="action-row">
            <button className="button" onClick={handleClick}>
              <Heart size={13} color="#ff1a5e" fill="#ff1a5e" />
              {'[ сказать_снова.exe ]'}
            </button>
            <button className="button button-secondary" onClick={onLetter}>
              {'[ письмо.txt ]'}
            </button>
          </div>

          <div className="secret-box">
            <div className={`secret${showMsg ? ' show' : ''}`}>
              {showMsg && (
                <><span className="prompt">&gt;&gt;&gt;</span>{' '}<Typewriter text={message} /></>
              )}
            </div>
          </div>

          {/* Subtle error hint */}
          <div className="error-hint">
            ERROR: невозможно перестать любить тебя
          </div>

        </div>

        <div className="status-bar">
          <span>буду любить тебя всегда ❤</span>
          <span>для_гели.love<span className="blink">█</span></span>
        </div>
      </main>

    </div>
  )
}
