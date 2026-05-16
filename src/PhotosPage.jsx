import { useState } from 'react'
import { ArrowLeft, Heart, ImageOff } from 'lucide-react'
import './PhotosPage.css'

// Добавь свои фотографии в папку public/photos/
// Имена файлов: photo1.jpg, photo2.jpg, ... (до photo9.jpg)
// Подписи можно менять ниже
const PHOTOS = [
  { src: '/photos/photo1.jpg', caption: 'ты такая красивая здесь' },
  { src: '/photos/photo2.jpg', caption: 'моя любимая' },
  { src: '/photos/photo3.jpg', caption: 'эта улыбка сводит меня с ума' },
  { src: '/photos/photo4.jpg', caption: 'один из лучших дней' },
  { src: '/photos/photo5.jpg', caption: 'мы вместе — и этого достаточно' },
  { src: '/photos/photo6.jpg', caption: 'никогда не забуду этот момент' },
  { src: '/photos/photo7.jpg', caption: 'ты и есть моё счастье' },
  { src: '/photos/photo8.jpg', caption: 'смотрю и не могу наглядеться' },
  { src: '/photos/photo9.jpg', caption: 'навсегда моя ❤' },
]

function PhotoCard({ src, caption, index, onClick }) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="photo-card" onClick={() => !error && loaded && onClick(index)}>
      <div className="photo-frame">
        {!error ? (
          <img
            src={src}
            alt={caption}
            onError={() => setError(true)}
            onLoad={() => setLoaded(true)}
            className="photo-img"
            style={{ display: loaded ? 'block' : 'none' }}
          />
        ) : null}
        {(error || !loaded) && (
          <div className="photo-placeholder">
            <span className="ph-index">_{String(index + 1).padStart(2, '0')}</span>
            <ImageOff size={26} color="rgba(255,26,94,0.3)" />
            <span className="ph-label">NO_SIGNAL</span>
            <span className="ph-hint">
              photo{index + 1}.jpg{'\n'}→ public/photos/
            </span>
          </div>
        )}
      </div>
      <div className="photo-caption">
        <span className="caption-arrow">›</span>
        <span>{caption}</span>
      </div>
    </div>
  )
}

export function PhotosPage({ onBack }) {
  const [lightbox, setLightbox] = useState(null)

  return (
    <>
      <div className="photos-page page-enter">

        <div className="photos-header">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={13} />
            {'[ вернуться.exe ]'}
          </button>
          <h2>НАШИ_МОМЕНТЫ.dir</h2>
          <Heart size={15} color="#ff1a5e" fill="#ff1a5e"
            style={{ filter: 'drop-shadow(0 0 6px #ff1a5e)', flexShrink: 0 }} />
        </div>

        <div className="photos-grid">
          {PHOTOS.map((p, i) => (
            <PhotoCard
              key={i}
              src={p.src}
              caption={p.caption}
              index={i}
              onClick={setLightbox}
            />
          ))}
        </div>

        <div className="photos-footer">
          <span>// добавь наши фото в папку public/photos/</span>
          <span>// имена: photo1.jpg, photo2.jpg, ... photo9.jpg</span>
        </div>

      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button
            className="lightbox-close"
            onClick={e => { e.stopPropagation(); setLightbox(null) }}
          >
            [ ЗАКРЫТЬ × ]
          </button>
          <img src={PHOTOS[lightbox].src} alt={PHOTOS[lightbox].caption} />
          <div className="lightbox-caption">
            › {PHOTOS[lightbox].caption}
          </div>
        </div>
      )}
    </>
  )
}
