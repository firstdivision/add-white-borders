# Add White Border

Add White Border is a small, browser-only tool for adding a clean white matte to any photo. Drop an image, adjust the border percentage, and download a PNG with the border applied. All processing happens locally in your browser.

## Features

- Drag-and-drop or file picker upload
- Adjustable border size (percentage-based)
- Instant preview with the matte applied
- One-click PNG download

## How it works

The app renders your image to a canvas, expands the canvas by the chosen border size, fills the background with white, and draws the image centered inside the matte. The border size is calculated from the longer image edge for a consistent look across orientations.

## Run locally

```bash
npm install
npm run dev
```

Then open the URL shown in the terminal.

## Build

```bash
npm run build
npm run preview
```

## Tech

- React + TypeScript
- Vite
