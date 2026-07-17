// Lazily import pdf.js and point it at a bundled worker so page rendering and
// text extraction work in the browser without any network dependency.
import type * as PdfjsModule from 'pdfjs-dist'

let pdfjs: typeof PdfjsModule | null = null

export async function getPdfjs(): Promise<typeof PdfjsModule> {
  if (pdfjs) return pdfjs
  const mod = await import('pdfjs-dist')
  mod.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString()
  pdfjs = mod
  return mod
}
