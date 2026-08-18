"use client"

import { EyedropperIcon } from "@phosphor-icons/react"
import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  formatColor,
  hexToHsv,
  hsvToHex,
  hueCss,
  normalizeHex,
  parseColorInput,
  type ColorFormat,
  type Hsv,
} from "@/lib/color"
import { cn } from "@/lib/utils"

const FALLBACK_COLOR = "#000000"
const HUE_TRACK =
  "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)"
const CHECKERBOARD =
  "repeating-conic-gradient(oklch(0.86 0 0) 0% 25%, oklch(1 0 0) 0% 50%)"

type EyeDropperApi = { open: () => Promise<{ sRGBHex: string }> }

function getEyeDropper(): EyeDropperApi | null {
  if (typeof window === "undefined") return null
  const Ctor = (
    window as Window & { EyeDropper?: new () => EyeDropperApi }
  ).EyeDropper
  return Ctor ? new Ctor() : null
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

type ColorPickerProps = {
  id?: string
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  className?: string
  "aria-invalid"?: boolean | "true" | "false"
  align?: React.ComponentProps<typeof PopoverContent>["align"]
}

function ColorBand({
  value,
  max,
  onValueChange,
  trackStyle,
  ariaLabel,
  disabled,
}: {
  value: number
  max: number
  onValueChange?: (value: number) => void
  trackStyle: React.CSSProperties
  ariaLabel: string
  disabled?: boolean
}) {
  return (
    <SliderPrimitive.Root
      value={[value]}
      min={0}
      max={max}
      step={1}
      disabled={disabled}
      aria-label={ariaLabel}
      onValueChange={(next) => {
        const nextValue = next[0]
        if (nextValue === undefined) return
        onValueChange?.(nextValue)
      }}
      className="relative flex h-3 w-full touch-none items-center select-none data-disabled:opacity-50"
    >
      <SliderPrimitive.Track
        className="relative h-3 w-full grow overflow-hidden rounded-full ring-1 ring-foreground/10"
        style={trackStyle}
      >
        <SliderPrimitive.Range className="absolute h-full bg-transparent" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block size-3.5 shrink-0 rounded-full border border-black/10 bg-white shadow-sm ring-0 transition-[box-shadow] select-none hover:ring-3 hover:ring-ring/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-hidden disabled:pointer-events-none" />
    </SliderPrimitive.Root>
  )
}

function SaturationArea({
  hsv,
  disabled,
  onChange,
}: {
  hsv: Hsv
  disabled?: boolean
  onChange: (next: Pick<Hsv, "s" | "v">) => void
}) {
  const areaRef = React.useRef<HTMLDivElement>(null)

  function setFromPointer(event: React.PointerEvent<HTMLDivElement>) {
    const el = areaRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const s = clamp01((event.clientX - rect.left) / rect.width)
    const v = clamp01(1 - (event.clientY - rect.top) / rect.height)
    onChange({ s, v })
  }

  return (
    <div
      ref={areaRef}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label="Saturação e brilho"
      aria-valuetext={`Saturação ${Math.round(hsv.s * 100)}%, brilho ${Math.round(hsv.v * 100)}%`}
      aria-disabled={disabled}
      className={cn(
        "relative h-32 w-full cursor-crosshair touch-none overflow-hidden rounded-lg ring-1 ring-foreground/10 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        disabled && "pointer-events-none opacity-50",
      )}
      style={{
        backgroundImage: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueCss(hsv.h)})`,
      }}
      onPointerDown={(event) => {
        if (disabled) return
        event.currentTarget.setPointerCapture(event.pointerId)
        setFromPointer(event)
      }}
      onPointerMove={(event) => {
        if (disabled || !event.currentTarget.hasPointerCapture(event.pointerId))
          return
        setFromPointer(event)
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.25)]"
        style={{
          left: `${hsv.s * 100}%`,
          top: `${(1 - hsv.v) * 100}%`,
        }}
      />
    </div>
  )
}

function ColorPicker({
  id,
  value = "",
  onChange,
  onBlur,
  disabled = false,
  className,
  "aria-invalid": ariaInvalid,
  align = "start",
}: ColorPickerProps) {
  const color = normalizeHex(value) ?? FALLBACK_COLOR
  const [open, setOpen] = React.useState(false)
  const [format, setFormat] = React.useState<ColorFormat>("hex")
  const [hsv, setHsv] = React.useState<Hsv>(() => hexToHsv(color))
  const [draft, setDraft] = React.useState(() => formatColor(color, "hex"))
  const lastHexRef = React.useRef(color)
  const [canEyeDrop, setCanEyeDrop] = React.useState(false)

  React.useEffect(() => {
    setCanEyeDrop(Boolean(getEyeDropper()))
  }, [])

  React.useEffect(() => {
    if (color === lastHexRef.current) return
    lastHexRef.current = color
    setHsv(hexToHsv(color))
  }, [color])

  React.useEffect(() => {
    setDraft(formatColor(color, format))
  }, [color, format])

  function commitHex(next: string) {
    const normalized = normalizeHex(next)
    if (!normalized || normalized === normalizeHex(value)) return
    lastHexRef.current = normalized
    onChange?.(normalized)
  }

  function commitHsv(next: Hsv) {
    setHsv(next)
    commitHex(hsvToHex(next))
  }

  async function pickFromScreen() {
    const eye = getEyeDropper()
    if (!eye) return
    try {
      const result = await eye.open()
      const hex = normalizeHex(result.sRGBHex)
      if (!hex) return
      lastHexRef.current = hex
      setHsv(hexToHsv(hex))
      onChange?.(hex)
    } catch {
      // User cancelled the eyedropper.
    }
  }

  return (
    <Popover
      modal={false}
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) onBlur?.()
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          id={id}
          variant="outline"
          disabled={disabled}
          aria-invalid={ariaInvalid}
          className={cn("w-full justify-start gap-2 font-normal", className)}
        >
          <span
            aria-hidden
            className="size-4 shrink-0 rounded-sm border border-border"
            style={{ backgroundColor: color }}
          />
          <span className="font-mono text-xs uppercase">{color}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 gap-3 p-3" align={align}>
        <SaturationArea
          hsv={hsv}
          disabled={disabled}
          onChange={({ s, v }) => commitHsv({ ...hsv, s, v })}
        />
        <div className="flex flex-col gap-2.5">
          <ColorBand
            value={Math.round(hsv.h)}
            max={360}
            disabled={disabled}
            ariaLabel="Matiz"
            onValueChange={(h) => commitHsv({ ...hsv, h })}
            trackStyle={{ backgroundImage: HUE_TRACK }}
          />
          <ColorBand
            value={100}
            max={100}
            ariaLabel="Opacidade (sempre sólida na impressão)"
            trackStyle={{
              backgroundImage: `linear-gradient(to right, transparent, ${color}), ${CHECKERBOARD}`,
              backgroundSize: "100% 100%, 8px 8px",
            }}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled || !canEyeDrop}
            tooltip={
              canEyeDrop
                ? "Capturar cor da tela"
                : "Conta-gotas não disponível neste navegador"
            }
            aria-label="Capturar cor da tela"
            onClick={() => void pickFromScreen()}
          >
            <EyedropperIcon />
          </Button>
          <Select
            value={format}
            onValueChange={(next) => setFormat(next as ColorFormat)}
            disabled={disabled}
          >
            <SelectTrigger
              size="sm"
              aria-label="Formato da cor"
              className="h-8 w-[4.75rem] px-2"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="start">
              <SelectItem value="hex">HEX</SelectItem>
              <SelectItem value="rgb">RGB</SelectItem>
              <SelectItem value="hsl">HSL</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={draft}
            disabled={disabled}
            spellCheck={false}
            aria-label="Valor da cor"
            className={cn(
              "h-8 min-w-0 flex-1 font-mono text-xs",
              format === "hex" && "uppercase",
            )}
            onChange={(event) => {
              setDraft(event.target.value)
              const parsed = parseColorInput(event.target.value, format)
              if (!parsed) return
              lastHexRef.current = parsed
              setHsv(hexToHsv(parsed))
              onChange?.(parsed)
            }}
            onBlur={() => {
              const parsed = parseColorInput(draft, format)
              if (parsed) {
                commitHex(parsed)
                return
              }
              setDraft(formatColor(color, format))
            }}
          />
          <Input
            value="100%"
            readOnly
            tabIndex={-1}
            aria-label="Opacidade"
            className="h-8 w-14 shrink-0 px-1.5 text-center font-mono text-xs"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { ColorPicker }
export type { ColorPickerProps }
