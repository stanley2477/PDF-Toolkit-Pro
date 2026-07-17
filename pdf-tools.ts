// PDF processing that runs fully client-side.
// - pdf-lib: create / merge / split / rotate / assemble PDFs
// - pdf.js: render pages to images and extract text
// - docx: build Word documents from extracted text
// - mammoth + jsPDF: turn Word documents into PDFs
// - jszip: bundle multi-file outputs

import {
  canvasToBlob,
  loadImage,
  makeResult,
  readAsArrayBuffer,
  stripExtension,
  type ProcessedFile,
} from './helpers'
import { getPdfjs } from './pdfjs'

async function zipFiles(
  files: { name: string; blob: Blob }[],
  zipName: string,
): Promise<ProcessedFile> {
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()
  for (const f of files) zip.file(f.name, f.blob)
  const blob = await zip.generateAsync({ type: 'blob' })
  return makeResult(zipName, blob)
}

// ---------- Images -> PDF ----------

export async function imagesToPdf(files: File[]): Promise<ProcessedFile> {
  const { PDFDocument } = await import('pdf-lib')
  const pdfDoc = await PDFDocument.create()

  for (const file of files) {
    const bytes = new Uint8Array(await readAsArrayBuffer(file))
    let image
    if (file.type === 'image/png') {
      image = await pdfDoc.embedPng(bytes)
    } else if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      image = await pdfDoc.embedJpg(bytes)
    } else {
      // Convert any other format (webp, etc.) to JPEG first via canvas.
      const img = await loadImage(file)
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      const jpgBlob = await canvasToBlob(canvas, 'image/jpeg', 0.92)
      image = await pdfDoc.embedJpg(new Uint8Array(await jpgBlob.arrayBuffer()))
    }
    const page = pdfDoc.addPage([image.width, image.height])
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height })
  }

  const out = await pdfDoc.save()
  const base = files.length === 1 ? stripExtension(files[0].name) : 'images'
  return makeResult(`${base}.pdf`, new Blob([out as BlobPart], { type: 'application/pdf' }))
}

// ---------- Merge / Split / Rotate ----------

export async function mergePdfs(files: File[]): Promise<ProcessedFile> {
  const { PDFDocument } = await import('pdf-lib')
  const merged = await PDFDocument.create()
  for (const file of files) {
    const src = await PDFDocument.load(await readAsArrayBuffer(file))
    const pages = await merged.copyPages(src, src.getPageIndices())
    pages.forEach((p) => merged.addPage(p))
  }
  const out = await merged.save()
  return makeResult('merged.pdf', new Blob([out as BlobPart], { type: 'application/pdf' }))
}

export async function splitPdf(file: File): Promise<ProcessedFile> {
  const { PDFDocument } = await import('pdf-lib')
  const src = await PDFDocument.load(await readAsArrayBuffer(file))
  const count = src.getPageCount()
  const base = stripExtension(file.name)
  const outputs: { name: string; blob: Blob }[] = []
  for (let i = 0; i < count; i++) {
    const single = await PDFDocument.create()
    const [page] = await single.copyPages(src, [i])
    single.addPage(page)
    const bytes = await single.save()
    outputs.push({
      name: `${base}-page-${i + 1}.pdf`,
      blob: new Blob([bytes as BlobPart], { type: 'application/pdf' }),
    })
  }
  if (outputs.length === 1) return makeResult(outputs[0].name, outputs[0].blob)
  return zipFiles(outputs, `${base}-pages.zip`)
}

export async function rotatePdf(file: File, angle: number): Promise<ProcessedFile> {
  const { PDFDocument, degrees } = await import('pdf-lib')
  const src = await PDFDocument.load(await readAsArrayBuffer(file))
  src.getPages().forEach((page) => {
    const current = page.getRotation().angle
    page.setRotation(degrees((current + angle) % 360))
  })
  const out = await src.save()
  return makeResult(
    `${stripExtension(file.name)}-rotated.pdf`,
    new Blob([out as BlobPart], { type: 'application/pdf' }),
  )
}

// ---------- Compress (rasterize pages to JPEG and rebuild) ----------

export async function compressPdf(file: File, quality: number): Promise<ProcessedFile> {
  const pdfjs = await getPdfjs()
  const { PDFDocument } = await import('pdf-lib')
  const data = new Uint8Array(await readAsArrayBuffer(file))
  const doc = await pdfjs.getDocument({ data }).promise
  const outDoc = await PDFDocument.create()
  const scale = 1.4

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = Math.floor(viewport.width)
    canvas.height = Math.floor(viewport.height)
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    await page.render({ canvas, canvasContext: ctx, viewport }).promise
    const jpgBlob = await canvasToBlob(canvas, 'image/jpeg', quality)
    const image = await outDoc.embedJpg(new Uint8Array(await jpgBlob.arrayBuffer()))
    const newPage = outDoc.addPage([image.width, image.height])
    newPage.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height })
  }

  const out = await outDoc.save()
  return makeResult(
    `${stripExtension(file.name)}-compressed.pdf`,
    new Blob([out as BlobPart], { type: 'application/pdf' }),
  )
}

// ---------- PDF -> Images ----------

export async function pdfToImages(
  file: File,
  format: 'jpeg' | 'png',
): Promise<ProcessedFile> {
  const pdfjs = await getPdfjs()
  const data = new Uint8Array(await readAsArrayBuffer(file))
  const doc = await pdfjs.getDocument({ data }).promise
  const base = stripExtension(file.name)
  const ext = format === 'jpeg' ? 'jpg' : 'png'
  const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png'
  const outputs: { name: string; blob: Blob }[] = []

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const viewport = page.getViewport({ scale: 2 })
    const canvas = document.createElement('canvas')
    canvas.width = Math.floor(viewport.width)
    canvas.height = Math.floor(viewport.height)
    const ctx = canvas.getContext('2d')!
    if (format === 'jpeg') {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    await page.render({ canvas, canvasContext: ctx, viewport }).promise
    const blob = await canvasToBlob(canvas, mime, 0.92)
    outputs.push({ name: `${base}-page-${i}.${ext}`, blob })
  }

  if (outputs.length === 1) return makeResult(outputs[0].name, outputs[0].blob)
  return zipFiles(outputs, `${base}-${ext}.zip`)
}

// ---------- PDF -> Word ----------

export async function pdfToWord(file: File): Promise<ProcessedFile> {
  const pdfjs = await getPdfjs()
  const { Document, Packer, Paragraph, TextRun } = await import('docx')
  const data = new Uint8Array(await readAsArrayBuffer(file))
  const doc = await pdfjs.getDocument({ data }).promise
  const paragraphs: InstanceType<typeof Paragraph>[] = []

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    let line = ''
    let lastY: number | null = null
    for (const item of content.items) {
      // @ts-expect-error pdf.js text item shape
      const str: string = item.str ?? ''
      // @ts-expect-error transform holds positioning
      const y: number = item.transform ? item.transform[5] : 0
      if (lastY !== null && Math.abs(y - lastY) > 4 && line.trim()) {
        paragraphs.push(new Paragraph({ children: [new TextRun(line.trim())] }))
        line = ''
      }
      line += str + ' '
      lastY = y
    }
    if (line.trim()) paragraphs.push(new Paragraph({ children: [new TextRun(line.trim())] }))
    if (i < doc.numPages) paragraphs.push(new Paragraph({ children: [] }))
  }

  if (paragraphs.length === 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun(
            'No selectable text was found in this PDF (it may be a scanned image).',
          ),
        ],
      }),
    )
  }

  const document = new Document({ sections: [{ children: paragraphs }] })
  const blob = await Packer.toBlob(document)
  return makeResult(`${stripExtension(file.name)}.docx`, blob)
}

// ---------- Word -> PDF ----------

export async function wordToPdf(file: File): Promise<ProcessedFile> {
  const mammoth = await import('mammoth')
  const { jsPDF } = await import('jspdf')
  const { value: html } = await mammoth.convertToHtml({
    arrayBuffer: await readAsArrayBuffer(file),
  })

  // Render the converted HTML into a hidden container, then let jsPDF paginate it.
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-10000px'
  container.style.top = '0'
  container.style.width = '620px'
  container.style.padding = '20px'
  container.style.fontFamily = 'Helvetica, Arial, sans-serif'
  container.style.fontSize = '12px'
  container.style.lineHeight = '1.5'
  container.style.color = '#000000'
  container.style.background = '#ffffff'
  container.innerHTML = html || '<p>This document appears to be empty.</p>'
  document.body.appendChild(container)

  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
  try {
    await pdf.html(container, {
      margin: [32, 32, 32, 32],
      autoPaging: 'text',
      width: 531,
      windowWidth: 620,
    })
  } finally {
    document.body.removeChild(container)
  }

  const blob = pdf.output('blob')
  return makeResult(`${stripExtension(file.name)}.pdf`, blob)
}
