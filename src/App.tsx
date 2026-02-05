import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import './App.css'

const BORDER_SCALE = 0.12
const BORDER_EASE_POWER = 2.4
const BORDER_EARLY_WEIGHT = 0.35

const scaleBorderEffect = (value: number) => {
  const normalized = Math.min(Math.max(value / 100, 0), 1)
  const curve = Math.pow(normalized, BORDER_EASE_POWER)
  return normalized * (BORDER_EARLY_WEIGHT + (1 - BORDER_EARLY_WEIGHT) * curve)
}

const computeBorderSize = (maxEdge: number, scale: number, percent: number) => {
  if (percent <= 0 || maxEdge <= 0) {
    return 0
  }

  const easedBorderPct = scaleBorderEffect(percent)
  const rawBorderPx = maxEdge * easedBorderPct * BORDER_SCALE * scale
  const roundedBorderPx = Math.round(rawBorderPx)

  return Math.max(1, roundedBorderPx)
}

function App() {
  const [borderPct, setBorderPct] = useState(40)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [imageSize, setImageSize] = useState<{
    width: number
    height: number
  } | null>(null)
  const [renderedSize, setRenderedSize] = useState<{
    width: number
    height: number
  } | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const isIOS = useMemo(() => {
    if (typeof navigator === 'undefined') {
      return false
    }

    const userAgent = navigator.userAgent
    const isAppleMobile = /iPad|iPhone|iPod/.test(userAgent)
    const isIpadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1

    return isAppleMobile || isIpadOs
  }, [])

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [imageUrl])

  const borderLabel = useMemo(() => `${borderPct}%`, [borderPct])
  const borderPx = useMemo(() => {
    if (!imageSize || !renderedSize) {
      return 0
    }
    const naturalMaxEdge = Math.max(imageSize.width, imageSize.height)
    const renderedMaxEdge = Math.max(renderedSize.width, renderedSize.height)
    if (naturalMaxEdge === 0) {
      return 0
    }
    const scale = renderedMaxEdge / naturalMaxEdge

    return computeBorderSize(naturalMaxEdge, scale, borderPct)
  }, [borderPct, imageSize, renderedSize])

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
    setImageSize(null)
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
    try {
      const processed = await buildProcessedImageDataUrl()
      if (!processed) {
        return
      }
      const link = document.createElement('a')
      link.download = processed.fileName
      link.href = processed.dataUrl
      link.click()
    } finally {
      setIsDownloading(false)
    }
  }

  const buildProcessedImageDataUrl = async () => {
    if (!imageUrl) {
      return null
    }
    const image = new Image()
    image.src = imageUrl
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('Failed to load image'))
    })

    const borderSize = computeBorderSize(
      Math.max(image.width, image.height),
      1,
      borderPct,
    )
    const canvas = document.createElement('canvas')
    canvas.width = image.width + borderSize * 2
    canvas.height = image.height + borderSize * 2
    const context = canvas.getContext('2d')

    if (!context) {
      return null
    }

    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, borderSize, borderSize)

    return {
      dataUrl: canvas.toDataURL('image/png'),
      fileName: fileName
        ? fileName.replace(/\.[^.]+$/, '') + '-white-border.png'
        : 'white-border.png',
    }
  }


  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget
    setImageSize({ width: naturalWidth, height: naturalHeight })
  }

  const handleChangeImage = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl)
    }
    setImageUrl(null)
    setFileName(null)
    setImageSize(null)
    setRenderedSize(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  useEffect(() => {
    const element = imageRef.current
    if (!element) {
      return
    }

    const updateRenderedSize = () => {
      setRenderedSize({
        width: element.clientWidth,
        height: element.clientHeight,
      })
    }

    updateRenderedSize()

    if (typeof ResizeObserver === 'undefined') {
      return
    }

    const observer = new ResizeObserver(() => {
      updateRenderedSize()
    })
    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [imageUrl])

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
                style={{ '--border-px': `${borderPx}px` } as CSSProperties}
              >
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt={fileName ?? 'Uploaded preview'}
                  onLoad={handleImageLoad}
                />
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
            <span>Border Effect</span>
            <span className="slider-value">{borderLabel}</span>
          </label>
          <input
            id="borderRange"
            type="range"
            min={0}
            max={100}
            value={borderPct}
            onChange={(event) => setBorderPct(Number(event.target.value))}
          />
          <p className="helper-text">
            Border size is calculated from the longer image edge for a finer
            matte.
          </p>
          <button
            type="button"
            className="download-button"
            onClick={() => void handleDownload()}
            disabled={!imageUrl || isDownloading}
          >
            {isDownloading ? 'Preparing download...' : 'Download image'}
            <span className="button-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img">
                <path
                  d="M12 3v10m0 0l4-4m-4 4l-4-4M4 17v3h16v-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
          {isIOS ? (
            <p className="ios-hint">
              On iOS, downloads go to Files. Tap Share then Save Image to add
              it to Photos.
            </p>
          ) : null}
          {imageUrl ? (
            <button
              type="button"
              className="secondary-button"
              onClick={handleChangeImage}
            >
              Change image
              <span className="button-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img">
                  <path
                    d="M15 4h5v5m0-5l-6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 20H4v-5m0 5l6-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          ) : null}
        </aside>
      </section>
    </div>
  )
}

export default App
