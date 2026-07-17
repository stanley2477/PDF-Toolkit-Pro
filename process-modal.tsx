'use client'

import { AlertCircle, CheckCircle2, Download, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatBytes, type ProcessedFile } from '@/lib/toolkit/helpers'
import type { Tool, ToolOptions } from '@/lib/toolkit/tools-config'

export type Phase = 'options' | 'processing' | 'done' | 'error'

type Props = {
  tool: Tool | null
  files: File[]
  phase: Phase
  options: ToolOptions
  onOptionsChange: (patch: Partial<ToolOptions>) => void
  result: ProcessedFile | null
  error: string | null
  onRun: () => void
  onDownload: () => void
  onClose: () => void
}

export function ProcessModal({
  tool,
  files,
  phase,
  options,
  onOptionsChange,
  result,
  error,
  onRun,
  onDownload,
  onClose,
}: Props) {
  if (!tool) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl border border-border bg-card p-6 text-card-foreground shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">{tool.label}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{tool.hint}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Selected files */}
        {files.length > 0 && phase !== 'done' && (
          <div className="mb-4 max-h-28 overflow-y-auto rounded-lg border border-border bg-muted/40 p-3 text-sm">
            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-between gap-3 py-0.5">
                <span className="truncate">{f.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatBytes(f.size)}
                </span>
              </div>
            ))}
          </div>
        )}

        {phase === 'options' && (
          <OptionControls tool={tool} options={options} onOptionsChange={onOptionsChange} />
        )}

        {phase === 'processing' && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Processing your file&hellip;</p>
            <p className="text-xs text-muted-foreground">
              This happens entirely on your device.
            </p>
          </div>
        )}

        {phase === 'done' && result && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="size-10 text-primary" />
            <p className="text-sm font-semibold">Your file is ready</p>
            <div className="w-full rounded-lg border border-border bg-muted/40 p-3 text-left text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate font-medium">{result.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatBytes(result.blob.size)}
                </span>
              </div>
            </div>
          </div>
        )}

        {phase === 'error' && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <AlertCircle className="size-10 text-destructive" />
            <p className="text-sm font-semibold">Something went wrong</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-2">
          {phase === 'options' && (
            <>
              <Button variant="outline" size="lg" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button size="lg" className="flex-1" onClick={onRun}>
                Convert
              </Button>
            </>
          )}
          {phase === 'done' && (
            <>
              <Button variant="outline" size="lg" className="flex-1" onClick={onClose}>
                Done
              </Button>
              <Button size="lg" className="flex-1" onClick={onDownload}>
                <Download className="size-4" />
                Download
              </Button>
            </>
          )}
          {phase === 'error' && (
            <Button variant="outline" size="lg" className="flex-1" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function OptionControls({
  tool,
  options,
  onOptionsChange,
}: {
  tool: Tool
  options: ToolOptions
  onOptionsChange: (patch: Partial<ToolOptions>) => void
}) {
  if (tool.options === 'image-quality' || tool.options === 'pdf-quality') {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <label htmlFor="quality" className="font-medium">
            Quality
          </label>
          <span className="text-muted-foreground">{Math.round(options.quality * 100)}%</span>
        </div>
        <input
          id="quality"
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          value={options.quality}
          onChange={(e) => onOptionsChange({ quality: Number(e.target.value) })}
          className="w-full accent-primary"
        />
        <p className="text-xs text-muted-foreground">
          Lower quality means a smaller file size.
        </p>
      </div>
    )
  }

  if (tool.options === 'resize') {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="width" className="text-sm font-medium">
              Width (px)
            </label>
            <input
              id="width"
              type="number"
              min={1}
              value={options.width}
              onChange={(e) => onOptionsChange({ width: Number(e.target.value) })}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="height" className="text-sm font-medium">
              Height (px)
            </label>
            <input
              id="height"
              type="number"
              min={1}
              value={options.height}
              onChange={(e) => onOptionsChange({ height: Number(e.target.value) })}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={options.keepAspect}
            onChange={(e) => onOptionsChange({ keepAspect: e.target.checked })}
            className="size-4 accent-primary"
          />
          Keep aspect ratio (uses width)
        </label>
      </div>
    )
  }

  if (tool.options === 'rotate') {
    const angles = [90, 180, 270]
    return (
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Rotation angle</span>
        <div className="grid grid-cols-3 gap-2">
          {angles.map((a) => (
            <button
              key={a}
              onClick={() => onOptionsChange({ angle: a })}
              className={`h-10 rounded-lg border text-sm font-medium transition-colors ${
                options.angle === a
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background hover:bg-muted'
              }`}
            >
              {a}&deg;
            </button>
          ))}
        </div>
      </div>
    )
  }

  return null
}
