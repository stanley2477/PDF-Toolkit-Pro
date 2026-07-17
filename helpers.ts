// Shared helpers for producing and downloading processed files entirely in the browser.

export type ProcessedFile = {
  name: string
  blob: Blob
  url: string
}

export function makeResult(name: string, blob: Blob): ProcessedFile {
  return { name, blob, url: URL.createObjectURL(blob) }
}

export function stripExtension(fileName: string): string {
  const idx = fileName.lastIndexOf('.')
  return idx === -1 ? fileName : fileName.slice(0, idx)
}

export function triggerDownload(file: ProcessedFile): void {
  const a = document.createElement('a')
  a.href = file.url
  a.download = file.name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

// Load a File/Blob into an HTMLImageElement via an object URL.
export function loadImage(source: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(source)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read this image file.'))
    }
    img.src = url
  })
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to encode the image.'))
      },
      type,
      quality,
    )
  })
}

export async function readAsArrayBuffer(file: Blob): Promise<ArrayBuffer> {
  return await file.arrayBuffer()
}
