'use client'

import { useRef, useState } from 'react'
import { AlertCircle, Upload, X } from 'lucide-react'
import {
  DEFAULT_OPTIONS,
  runTool,
  type Tool,
  type ToolOptions,
} from '@/lib/toolkit/tools-config'
import {
  formatBytes,
  triggerDownload,
  type ProcessedFile,
} from '@/lib/toolkit/helpers'
import { InfoPage } from './info-pages'
import { ProcessModal, type Phase } from './process-modal'
import { SiteFooter, SiteHeader, type PageId } from './site-chrome'
import { ToolGrid } from './tool-grid'

const UPLOAD_ACCEPT =
  'application/pdf,.pdf,image/*,.heic,.heif,.doc,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

function isCompatible(tool: Tool, file: File): boolean {
  const name = file.name.toLowerCase()
  const type = file.type
  if (tool.accept.includes('application/pdf'))
    return type === 'application/pdf' || name.endsWith('.pdf')
  if (tool.id === 'heic-to-jpg')
    return /\.(heic|heif)$/.test(name) || type.includes('heic') || type.includes('heif')
  if (tool.accept.includes('image/png')) return type === 'image/png' || name.endsWith('.png')
  if (tool.accept.includes('image/jpeg'))
    return type === 'image/jpeg' || /\.(jpg|jpeg)$/.test(name)
  if (tool.accept.includes('image/webp')) return type === 'image/webp' || name.endsWith('.webp')
  if (tool.accept.includes('image/*'))
    return type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp|heic|heif)$/.test(name)
  if (tool.accept.includes('word') || tool.accept.includes('.docx'))
    return /\.(docx?|doc)$/.test(name)
  return true
}

function neededFilesLabel(tool: Tool): string {
  if (tool.accept.includes('application/pdf')) return 'a PDF file'
  if (tool.id === 'heic-to-jpg') return 'a HEIC or HEIF image'
  if (tool.accept.includes('image/png')) return 'a PNG image'
  if (tool.accept.includes('image/jpeg')) return 'a JPG image'
  if (tool.accept.includes('image/webp')) return 'a WebP image'
  if (tool.accept.includes('image/*')) return 'an image'
  if (tool.accept.includes('word') || tool.accept.includes('.docx')) return 'a Word document'
  return 'a supported file'
}

export function PdfToolkit() {
  const [page, setPage] = useState<PageId>('home')
  const [staged, setStaged] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)

  // Modal / processing state
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTool, setActiveTool] = useState<Tool | null>(null)
  const [activeFiles, setActiveFiles] = useState<File[]>([])
  const [phase, setPhase] = useState<Phase>('options')
  const [options, setOptions] = useState<ToolOptions>(DEFAULT_OPTIONS)
  const [result, setResult] = useState<ProcessedFile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState<Tool | null>(null)

  const uploadInputRef = useRef<HTMLInputElement>(null)
  const toolInputRef = useRef<HTMLInputElement>(null)
  const pendingTool = useRef<Tool | null>(null)

  const navigate = (p: PageId) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const startFlow = (tool: Tool, files: File[]) => {
    const scoped = tool.multiple ? files : files.slice(0, 1)
    setActiveTool(tool)
    setActiveFiles(scoped)
    setResult(null)
    setError(null)
    setOptions(DEFAULT_OPTIONS)
    setModalOpen(true)
    if (tool.options === 'none') {
      void process(tool, scoped, DEFAULT_OPTIONS)
    } else {
      setPhase('options')
    }
  }

  const process = async (tool: Tool, files: File[], opts: ToolOptions) => {
    setPhase('processing')
    try {
      const output = await runTool(tool.id, files, opts)
      setResult(output)
      setPhase('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The file could not be processed.')
      setPhase('error')
    }
  }

  const handleToolSelect = (tool: Tool) => {
    if (!tool.supported) {
      setNote(tool)
      return
    }
    const compatible = staged.filter((f) => isCompatible(tool, f))
    if (compatible.length > 0) {
      startFlow(tool, compatible)
      return
    }
    // No usable staged files: open a picker scoped to this tool.
    pendingTool.current = tool
    const input = toolInputRef.current
    if (input) {
      input.accept = tool.accept
      input.multiple = tool.multiple
      input.value = ''
      input.click()
    }
  }

  const handleToolInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tool = pendingTool.current
    const files = e.target.files ? Array.from(e.target.files) : []
    pendingTool.current = null
    if (!tool || files.length === 0) return
    const compatible = files.filter((f) => isCompatible(tool, f))
    if (compatible.length === 0) {
      setActiveTool(tool)
      setActiveFiles([])
      setError(`Please choose ${neededFilesLabel(tool)} for this tool.`)
      setPhase('error')
      setModalOpen(true)
      return
    }
    startFlow(tool, compatible)
  }

  const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length) setStaged((prev) => [...prev, ...files])
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length) setStaged((prev) => [...prev, ...files])
  }

  const closeModal = () => {
    setModalOpen(false)
    setActiveTool(null)
    setActiveFiles([])
    setResult(null)
    setError(null)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader onNavigate={navigate} />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        {page !== 'home' ? (
          <InfoPage page={page} />
        ) : (
          <>
            <h1 className="text-balance text-center text-3xl font-extrabold text-foreground sm:text-4xl">
              Convert, Compress &amp; Edit PDFs and Images for Free
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-pretty text-center text-muted-foreground">
              Fast, secure, and entirely in your browser. No registrations, no uploads, no
              hidden limits.
            </p>

            {/* Upload box */}
            <div
              onClick={() => uploadInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') uploadInputRef.current?.click()
              }}
              className={`mt-8 cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
                dragging
                  ? 'border-primary bg-accent'
                  : 'border-border bg-card hover:border-primary/60'
              }`}
            >
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent text-primary">
                <Upload className="size-6" />
              </span>
              <p className="mt-4 text-base font-semibold text-foreground">
                <span className="text-primary underline underline-offset-4">Select files</span>{' '}
                or drag &amp; drop here
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Supports PDF, WORD, JPG, PNG, HEIC, and WebP
              </p>
            </div>

            {/* Staged files */}
            {staged.length > 0 && (
              <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">
                    {staged.length} file{staged.length > 1 ? 's' : ''} ready &mdash; pick a
                    tool below
                  </p>
                  <button
                    onClick={() => setStaged([])}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  {staged.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 rounded-lg bg-card px-3 py-2 text-sm"
                    >
                      <span className="truncate">{f.name}</span>
                      <span className="flex items-center gap-3">
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatBytes(f.size)}
                        </span>
                        <button
                          onClick={() => setStaged((prev) => prev.filter((_, idx) => idx !== i))}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label={`Remove ${f.name}`}
                        >
                          <X className="size-4" />
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10">
              <ToolGrid onSelect={handleToolSelect} />
            </div>
          </>
        )}
      </main>

      <SiteFooter onNavigate={navigate} />

      {/* Hidden inputs */}
      <input
        ref={uploadInputRef}
        type="file"
        multiple
        accept={UPLOAD_ACCEPT}
        className="hidden"
        onChange={handleUploadChange}
      />
      <input
        ref={toolInputRef}
        type="file"
        className="hidden"
        onChange={handleToolInputChange}
      />

      {modalOpen && (
        <ProcessModal
          tool={activeTool}
          files={activeFiles}
          phase={phase}
          options={options}
          onOptionsChange={(patch) => setOptions((o) => ({ ...o, ...patch }))}
          result={result}
          error={error}
          onRun={() => activeTool && process(activeTool, activeFiles, options)}
          onDownload={() => result && triggerDownload(result)}
          onClose={closeModal}
        />
      )}

      {/* Unsupported tool note */}
      {note && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setNote(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center text-card-foreground shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <AlertCircle className="mx-auto size-10 text-primary" />
            <h3 className="mt-3 text-lg font-bold">{note.label}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{note.note}</p>
            <button
              onClick={() => setNote(null)}
              className="mt-5 h-10 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
