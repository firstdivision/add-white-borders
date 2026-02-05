import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import './App.css'

function App() {
  const [borderPct, setBorderPct] = useState(4)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [imageUrl])

  const borderLabel = useMemo(() => `${borderPct}%`, [borderPct])

  const setFile = (file: File | null) => {
    if (!file) {
      return
    }
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl)
    }
    const nextUrl = URL.createObjectURL(file)
    setImageUrl(nextUrl)
    setFileName(file.name)
  }

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setFile(file)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0] ?? null
    setFile(file)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDownload = async () => {
    if (!imageUrl) {
      return
    }
    setIsDownloading(true)
    const image = new Image()
    image.src = imageUrl
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('Failed to load image'))
    })

    const borderSize = Math.round(
      Math.min(image.width, image.height) * (borderPct / 100),
    )
    const canvas = document.createElement('canvas')
    canvas.width = image.width + borderSize * 2
    canvas.height = image.height + borderSize * 2
    const context = canvas.getContext('2d')

    if (!context) {
      setIsDownloading(false)
      return
    }

    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, borderSize, borderSize)

    const link = document.createElement('a')
    link.download = fileName
      ? fileName.replace(/\.[^.]+$/, '') + '-white-border.png'
      : 'white-border.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
    setIsDownloading(false)
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-tag">Instant white borders</div>
        <h1>Add white borders to any photo</h1>
        <p>
          Drop an image, dial in the border, and get a clean, gallery-ready
          look without leaving the browser.
        </p>
      </header>

      <section className="workspace">
        {imageUrl ? (
          <div className="preview-panel">
            <div className="preview-frame">
              <div
                className="border-matte"
                style={{ '--border-pct': borderPct } as CSSProperties}
              >
                <img src={imageUrl} alt={fileName ?? 'Uploaded preview'} />
              </div>
            </div>
            {fileName ? <div className="file-name">{fileName}</div> : null}
          </div>
        ) : (
          <div
            className={`dropzone ${isDragging ? 'dropzone--active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              aria-label="Upload image"
            />
            <div className="dropzone-content">
              <span className="dropzone-title">
                Drag & drop your photo here
              </span>
              <span className="dropzone-subtitle">or browse your device</span>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
              >
                Choose image
              </button>
              <span className="dropzone-hint">JPG, PNG, HEIC</span>
            </div>
          </div>
        )}

        <aside className="controls">
          <div className="panel-title">Image Settings</div>
          <label className="slider-label" htmlFor="borderRange">
            <span>Border %</span>
            <span className="slider-value">{borderLabel}</span>
          </label>
          <input
            id="borderRange"
            type="range"
            min={0}
            max={50}
            value={borderPct}
            onChange={(event) => setBorderPct(Number(event.target.value))}
          />
          <p className="helper-text">
            Border size scales with your image dimensions for a balanced frame.
          </p>
          <button
            type="button"
            className="download-button"
            onClick={() => void handleDownload()}
            disabled={!imageUrl || isDownloading}
          >
            {isDownloading ? 'Preparing download...' : 'Download image'}
          </button>
        </aside>
      </section>
    </div>
  )
}

export default App
