import { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowLeft, Heart } from 'lucide-react'
import './LetterPage.css'

// ↓↓↓ Напиши своё письмо здесь ↓↓↓
const LETTER = `Геля,

не знаю зачем сделал этот сайт.
наверное потому что хотел сказать кое-что,
а вслух не очень умею.

шесть лет. смешно даже.
я бы снова выбрал тебя. сто раз.

я тебя люблю. очень.
злишь иногда — но всё равно люблю.
и это наверное и есть оно самое.

не знаю что ещё написать.
просто люблю тебя, Геля.
по-настоящему.`

const TYPING_SPEED = 28 // мс на символ

export function LetterPage({ onBack }) {
  const [displayed,  setDisplayed]  = useState('')
  const [done,       setDone]       = useState(false)
  const [showSign,   setShowSign]   = useState(false)
  const [showReplay, setShowReplay] = useState(false)
  const [key,        setKey]        = useState(0)

  const ivRef = useRef(null)

  const startTyping = useCallback(() => {
    setDisplayed('')
    setDone(false)
    setShowSign(false)
    setShowReplay(false)

    let i = 0
    clearInterval(ivRef.current)
    ivRef.current = setInterval(() => {
      i++
      setDisplayed(LETTER.slice(0, i))
      if (i >= LETTER.length) {
        clearInterval(ivRef.current)
        setDone(true)
        setTimeout(() => setShowSign(true),   600)
        setTimeout(() => setShowReplay(true), 1200)
      }
    }, TYPING_SPEED)
  }, [])

  useEffect(() => {
    startTyping()
    return () => clearInterval(ivRef.current)
  }, [key, startTyping])

  const now = new Date()
  const dateStr = now.toLocaleDateString('ru-RU', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  return (
    <div className="letter-page page-enter">
      <div className="letter-window">

        {/* Header */}
        <div className="letter-header">
          <span className="letter-dot" />
          <span className="letter-dot" />
          <span className="letter-dot" />
          <span className="letter-title">письмо_для_ангелины.txt</span>
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={11} />
            назад
          </button>
        </div>

        {/* Body */}
        <div className="letter-body">
          <div className="letter-meta">
            <span>// кому: Ангелина ❤</span>
            <span>{dateStr}</span>
          </div>

          <div className="letter-text">
            {displayed}
            {!done && <span className="letter-cursor" />}
          </div>

          <div className={`letter-signature${showSign ? ' show' : ''}`}>
            <Heart
              size={13}
              color="#ff55aa"
              fill="#ff55aa"
              style={{ verticalAlign: 'middle', marginRight: 6 }}
            />
            — Даня
          </div>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button
              className={`replay-btn${showReplay ? ' show' : ''}`}
              onClick={() => setKey(k => k + 1)}
            >
              {'[ прочитать_снова.exe ]'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
