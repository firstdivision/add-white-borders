# Add White Border

Add White Border is a small, browser-only tool for adding a clean white matte to any photo. Drop an image, adjust the border percentage, and download a PNG with the border applied. All processing happens locally in your browser.

## Features

- Drag-and-drop or file picker upload
- Adjustable border size (percentage-based)
- Instant preview with the matte applied
- One-click PNG download

## How it works

The app renders your image to a canvas, expands the canvas by the chosen border size, fills the background with white, and draws the image centered inside the matte. The border size is calculated from the longer image edge for a consistent look across orientations.

## Border size calculation

The border size is derived from the longest image edge so portraits and landscapes feel balanced. The calculation follows these steps:

1. Read the slider value as a percentage from 0 to 100.
2. Normalize it to a 0-1 range and clamp it so values outside the range do not break the math.
3. Apply an easing curve so small percentages still feel meaningful, but larger percentages ramp up more smoothly. This is done by raising the normalized value to a power and blending it with an "early weight" so the curve starts above zero.
4. Convert that eased percentage into pixels by multiplying:
	- the longest edge of the image,
	- a fixed scale factor that keeps borders reasonable,
	- and the current display scale (so the preview matches the real pixel math).
5. Round to the nearest whole pixel and ensure the border is at least 1px when the percentage is greater than zero.

In plain terms: the slider gives a percentage, that percentage is shaped by an easing curve, then it is turned into a pixel value based on the image size and a fixed scale. Using the longest edge keeps the border consistent across different image orientations, and the easing curve makes the slider feel more natural.

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
