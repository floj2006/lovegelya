import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import './BootScreen.css'

const STEPS = [
  { at: 5,  text: '> это Даня. сделал кое-что для тебя...', type: '' },
  { at: 18, text: '> думаю о тебе.............. как всегда [❤]', type: 'ok' },
  { at: 33, text: '> ты моя любимая...................... [❤]', type: 'ok' },
  { at: 50, text: '> шесть лет. и всё равно рад........... [❤]', type: 'ok' },
  { at: 66, text: '> не представляю без тебя............. [❤]', type: 'ok' },
  { at: 82, text: '> короче. люблю тебя, Геля............ [❤]', type: 'ok' },
  { at: 96, text: '> открываю. заходи. ❤', type: 'access' },
]

export function BootScreen({ onDone }) {
  const [progress, setProgress] = useState(0)
  const [lines,    setLines]    = useState([])
  const [welcome,  setWelcome]  = useState(false)
  const [exiting,  setExiting]  = useState(false)

  useEffect(() => {
    let cur = 0
    const iv = setInterval(() => {
      const remaining = 100 - cur
      cur = Math.min(cur + Math.max(0.4, remaining * 0.035) + Math.random() * 0.6, 100)
      const pct = Math.floor(cur)
      setProgress(pct)

      STEPS.forEach(s => {
        if (cur >= s.at) {
          setLines(prev =>
            prev.some(l => l.text === s.text) ? prev : [...prev, s]
          )
        }
      })

      if (cur >= 100) {
        clearInterval(iv)
        setTimeout(() => setWelcome(true),  450)
        setTimeout(() => setExiting(true),  1450)
        setTimeout(() => onDone(),          2100)
      }
    }, 40)

    return () => clearInterval(iv)
  }, [onDone])

  const filled = Math.floor(progress / 5)
  const bar    = '█'.repeat(filled) + '░'.repeat(20 - filled)

  return (
    <div className={`boot-screen${exiting ? ' boot-exiting' : ''}`}>
      <div className="boot-content">

        <div className="boot-logo">
          <Heart
            size={28}
            color="#ff1a5e"
            fill="#ff1a5e"
            style={{ filter: 'drop-shadow(0 0 10px #ff1a5e)', flexShrink: 0 }}
          />
          для_гели.exe
        </div>

        <hr className="boot-sep" />

        <div className="boot-lines">
          {lines.map((s, i) => (
            <div key={i} className={`boot-line${s.type ? ' ' + s.type : ''}`}>
              {s.text}
            </div>
          ))}
        </div>

        <div className="boot-bar">
          [{bar}] {progress}%
        </div>

        {welcome && (
          <div className="boot-welcome">
            привет, Геля ❤
          </div>
        )}

      </div>
    </div>
  )
}
