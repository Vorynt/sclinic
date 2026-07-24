import { ImageResponse } from "next/og"

/** Matches `--primary` / `--primary-foreground` from `globals.css` (light). */
const PRIMARY = "#0069a8"
const PRIMARY_FOREGROUND = "#f0f9ff"

/** Phosphor Pulse (bold) — same mark used in AuthShell / LoadingScreen. */
const PULSE_PATH =
  "M244,128a12,12,0,0,1-12,12H207.42l-36.69,73.37A12,12,0,0,1,160,220h-.6a12,12,0,0,1-10.61-7.72L95,71.15,66.92,133A12,12,0,0,1,56,140H24a12,12,0,0,1,0-24H48.27L85.08,35a12,12,0,0,1,22.13.7l54.28,142.46,27.78-55.56A12,12,0,0,1,200,116h32A12,12,0,0,1,244,128Z"

export const size = {
  width: 180,
  height: 180,
}

export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: PRIMARY,
        }}>
        <svg
          width="96"
          height="96"
          viewBox="0 0 256 256"
          fill={PRIMARY_FOREGROUND}>
          <path d={PULSE_PATH} />
        </svg>
      </div>
    ),
    { ...size },
  )
}
