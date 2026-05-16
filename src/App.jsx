import { useState, useEffect, useRef } from 'react'
import './App.css'
import { BootScreen  } from './BootScreen'
import { MainPage    } from './MainPage'
import { LetterPage  } from './LetterPage'

/* ── Matrix Rain ── */
function MatrixRain() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const cv  = canvasRef.current
    const ctx = cv.getContext('2d')
    const chars = '♥♡❤01АНГЕЛИН✦◆▓░■▒●○'.split('')
    const fs  = 15
    let drops = []

    const init = () => {
      cv.width  = window.innerWidth
      cv.height = window.innerHeight
      drops = Array(Math.floor(cv.width / fs)).fill(0)
    }
    init()
    window.addEventListener('resize', init)

    const iv = setInterval(() => {
      ctx.fillStyle = 'rgba(5,0,8,.055)'
      ctx.fillRect(0, 0, cv.width, cv.height)
      ctx.font = `${fs}px monospace`

      drops.forEach((y, i) => {
        const c = chars[Math.floor(Math.random() * chars.length)]
        const r = Math.random()
        ctx.fillStyle = r > 0.97 ? '#fff' : r > 0.85 ? '#ff55aa' : '#aa1144'
        ctx.fillText(c, i * fs, y * fs)
        if (y * fs > cv.height && Math.random() > 0.975) drops[i] = 0
        else drops[i]++
      })
    }, 50)

    return () => {
      clearInterval(iv)
      window.removeEventListener('resize', init)
    }
  }, [])

  return <canvas ref={canvasRef} className="matrix-canvas" />
}

/* ── Cursor + Touch trail ── */
function useCursorTrail() {
  const [trails, setTrails] = useState([])

  useEffect(() => {
    const spawn = (x, y) => {
      if (Math.random() > 0.65) {
        const id = crypto.randomUUID()
        setTrails(prev => [...prev, { id, x, y, char: Math.random() > 0.5 ? '♥' : '◆' }])
        setTimeout(() => setTrails(prev => prev.filter(t => t.id !== id)), 700)
      }
    }

    const onMouse = e => spawn(e.clientX, e.clientY)
    const onTouch = e => {
      Array.from(e.touches).forEach(t => spawn(t.clientX, t.clientY))
    }

    document.addEventListener('mousemove', onMouse)
    document.addEventListener('touchmove', onTouch, { passive: true })

    return () => {
      document.removeEventListener('mousemove', onMouse)
      document.removeEventListener('touchmove', onTouch)
    }
  }, [])

  return trails
}

/* ── App ── */
export default function App() {
  const [page,    setPage]    = useState('boot')
  const [leaving, setLeaving] = useState(false)
  const pending = useRef(null)
  const trails  = useCursorTrail()

  // Smooth page transition
  const navigate = to => {
    pending.current = to
    setLeaving(true)
    setTimeout(() => {
      setLeaving(false)
      setPage(pending.current)
    }, 280)
  }

  // Random screen glitch every 12–22 s
  useEffect(() => {
    let t
    const glitch = () => {
      document.body.classList.add('screen-glitch')
      setTimeout(() => document.body.classList.remove('screen-glitch'), 220)
      t = setTimeout(glitch, 12000 + Math.random() * 10000)
    }
    t = setTimeout(glitch, 16000)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <MatrixRain />
      <div className="scanlines" />

      {trails.map(t => (
        <div
          key={t.id}
          className="cursor-heart"
          style={{ left: `${t.x}px`, top: `${t.y}px` }}
        >
          {t.char}
        </div>
      ))}

      <div style={{ opacity: leaving ? 0 : 1, transition: 'opacity 0.28s ease' }}>
        {page === 'boot'   && <BootScreen onDone={() => navigate('main')} />}
        {page === 'main'   && <MainPage   onLetter={() => navigate('letter')} />}
        {page === 'letter' && <LetterPage onBack={() => navigate('main')} />}
      </div>
    </>
  )
}
