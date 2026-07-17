// Image processing that runs fully client-side using the Canvas API (+ heic2any for HEIC).

import {
  canvasToBlob,
  loadImage,
  makeResult,
  stripExtension,
  type ProcessedFile,
} from './helpers'

async function drawToCanvas(
  img: HTMLImageElement,
  width?: number,
  height?: number,
  background?: string,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  canvas.width = width ?? img.naturalWidth
  canvas.height = height ?? img.naturalHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not supported in this browser.')
  if (background) {
    ctx.fillStyle = background
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas
}

// Re-encode a File to a target mime type. Background is used to flatten
// transparency when going to a format without alpha (e.g. JPEG).
export async function convertImage(
  file: File,
  targetMime: string,
  targetExt: string,
  quality = 0.92,
): Promise<ProcessedFile> {
  const needsBackground = targetMime === 'image/jpeg'
  const img = await loadImage(file)
  const canvas = await drawToCanvas(
    img,
    undefined,
    undefined,
    needsBackground ? '#ffffff' : undefined,
  )
  const blob = await canvasToBlob(canvas, targetMime, quality)
  return makeResult(`${stripExtension(file.name)}.${targetExt}`, blob)
}

export async function compressImage(
  file: File,
  quality: number,
): Promise<ProcessedFile> {
  const img = await loadImage(file)
  // Keep PNGs with transparency as PNG isn't lossy; compress everything as JPEG
  // which is where meaningful size reduction happens.
  const canvas = await drawToCanvas(img, undefined, undefined, '#ffffff')
  const blob = await canvasToBlob(canvas, 'image/jpeg', quality)
  return makeResult(`${stripExtension(file.name)}-compressed.jpg`, blob)
}

export async function resizeImage(
  file: File,
  targetWidth: number,
  targetHeight: number,
  keepAspect: boolean,
): Promise<ProcessedFile> {
  const img = await loadImage(file)
  let width = targetWidth
  let height = targetHeight
  if (keepAspect) {
    const ratio = img.naturalWidth / img.naturalHeight
    if (targetWidth && !targetHeight) height = Math.round(targetWidth / ratio)
    else if (targetHeight && !targetWidth) width = Math.round(targetHeight * ratio)
    else height = Math.round(targetWidth / ratio)
  }
  const isPng = file.type === 'image/png'
  const canvas = await drawToCanvas(
    img,
    width,
    height,
    isPng ? undefined : '#ffffff',
  )
  const mime = isPng ? 'image/png' : 'image/jpeg'
  const ext = isPng ? 'png' : 'jpg'
  const blob = await canvasToBlob(canvas, mime, 0.92)
  return makeResult(`${stripExtension(file.name)}-${width}x${height}.${ext}`, blob)
}

// HEIC is not natively decodable by <img> in most browsers, so we use heic2any.
export async function heicToJpg(file: File): Promise<ProcessedFile> {
  const heic2any = (await import('heic2any')).default
  const converted = (await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality: 0.92,
  })) as Blob
  return makeResult(`${stripExtension(file.name)}.jpg`, converted)
}
