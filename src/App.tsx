import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import './App.css'

function App() {
  const [borderPct, setBorderPct] = useState(12)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
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

        <div className="preview-panel">
          <div
            className="preview-frame"
            style={{ '--border-pct': borderPct } as CSSProperties}
          >
            {imageUrl ? (
              <img src={imageUrl} alt={fileName ?? 'Uploaded preview'} />
            ) : (
              <div className="preview-placeholder">
                Upload a photo to preview the border.
              </div>
            )}
          </div>
          {fileName ? <div className="file-name">{fileName}</div> : null}
        </div>

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
        </aside>
      </section>
    </div>
  )
}

export default App
