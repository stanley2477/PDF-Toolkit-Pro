import type { LucideIcon } from 'lucide-react'
import {
  Combine,
  FileImage,
  FileOutput,
  FileText,
  FileType,
  Image as ImageIcon,
  Images,
  Maximize2,
  Minimize2,
  RotateCw,
  Scissors,
  Shrink,
} from 'lucide-react'
import type { ProcessedFile } from './helpers'

export type OptionKind = 'none' | 'image-quality' | 'pdf-quality' | 'resize' | 'rotate'

export type Tool = {
  id: string
  label: string
  category: 'pdf' | 'image'
  icon: LucideIcon
  accept: string
  multiple: boolean
  options: OptionKind
  hint: string
  supported: boolean
  note?: string
}

export const TOOLS: Tool[] = [
  // ---- PDF Tools ----
  {
    id: 'pdf-to-word',
    label: 'PDF to Word',
    category: 'pdf',
    icon: FileType,
    accept: 'application/pdf,.pdf',
    multiple: false,
    options: 'none',
    hint: 'Extracts selectable text into an editable .docx document.',
    supported: true,
  },
  {
    id: 'word-to-pdf',
    label: 'Word to PDF',
    category: 'pdf',
    icon: FileText,
    accept: '.doc,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    multiple: false,
    options: 'none',
    hint: 'Converts a Word document into a formatted PDF.',
    supported: true,
  },
  {
    id: 'merge-pdf',
    label: 'Merge PDF',
    category: 'pdf',
    icon: Combine,
    accept: 'application/pdf,.pdf',
    multiple: true,
    options: 'none',
    hint: 'Combine several PDFs into one, in the order you select them.',
    supported: true,
  },
  {
    id: 'split-pdf',
    label: 'Split PDF',
    category: 'pdf',
    icon: Scissors,
    accept: 'application/pdf,.pdf',
    multiple: false,
    options: 'none',
    hint: 'Splits every page into its own PDF (delivered as a .zip).',
    supported: true,
  },
  {
    id: 'compress-pdf',
    label: 'Compress PDF',
    category: 'pdf',
    icon: Minimize2,
    accept: 'application/pdf,.pdf',
    multiple: false,
    options: 'pdf-quality',
    hint: 'Reduces file size by re-encoding pages. Great for scanned PDFs.',
    supported: true,
  },
  {
    id: 'jpg-to-pdf',
    label: 'JPG to PDF',
    category: 'pdf',
    icon: FileImage,
    accept: 'image/jpeg,.jpg,.jpeg',
    multiple: true,
    options: 'none',
    hint: 'Turn one or more JPG images into a single PDF.',
    supported: true,
  },
  {
    id: 'pdf-to-jpg',
    label: 'PDF to JPG',
    category: 'pdf',
    icon: FileOutput,
    accept: 'application/pdf,.pdf',
    multiple: false,
    options: 'none',
    hint: 'Renders each page to a high-quality JPG image.',
    supported: true,
  },
  {
    id: 'pdf-to-png',
    label: 'PDF to PNG',
    category: 'pdf',
    icon: FileOutput,
    accept: 'application/pdf,.pdf',
    multiple: false,
    options: 'none',
    hint: 'Renders each page to a lossless PNG image.',
    supported: true,
  },
  {
    id: 'png-to-pdf',
    label: 'PNG to PDF',
    category: 'pdf',
    icon: FileImage,
    accept: 'image/png,.png',
    multiple: true,
    options: 'none',
    hint: 'Turn one or more PNG images into a single PDF.',
    supported: true,
  },
  {
    id: 'image-to-pdf',
    label: 'Image to PDF',
    category: 'pdf',
    icon: Images,
    accept: 'image/*',
    multiple: true,
    options: 'none',
    hint: 'Combine JPG, PNG, or WebP images into one PDF.',
    supported: true,
  },
  {
    id: 'rotate-pdf',
    label: 'Rotate PDF',
    category: 'pdf',
    icon: RotateCw,
    accept: 'application/pdf,.pdf',
    multiple: false,
    options: 'rotate',
    hint: 'Rotate every page by 90, 180, or 270 degrees.',
    supported: true,
  },
  // ---- Image Tools ----
  {
    id: 'image-compressor',
    label: 'Image Compressor',
    category: 'image',
    icon: Shrink,
    accept: 'image/*',
    multiple: false,
    options: 'image-quality',
    hint: 'Shrink image file size with an adjustable quality level.',
    supported: true,
  },
  {
    id: 'image-resizer',
    label: 'Image Resizer',
    category: 'image',
    icon: Maximize2,
    accept: 'image/*',
    multiple: false,
    options: 'resize',
    hint: 'Resize an image to exact pixel dimensions.',
    supported: true,
  },
  {
    id: 'png-to-jpg',
    label: 'PNG to JPG',
    category: 'image',
    icon: ImageIcon,
    accept: 'image/png,.png',
    multiple: false,
    options: 'none',
    hint: 'Convert a PNG to a JPG (transparency flattened to white).',
    supported: true,
  },
  {
    id: 'jpg-to-png',
    label: 'JPG to PNG',
    category: 'image',
    icon: ImageIcon,
    accept: 'image/jpeg,.jpg,.jpeg',
    multiple: false,
    options: 'none',
    hint: 'Convert a JPG image to a lossless PNG.',
    supported: true,
  },
  {
    id: 'heic-to-jpg',
    label: 'HEIC to JPG',
    category: 'image',
    icon: ImageIcon,
    accept: '.heic,.heif,image/heic,image/heif',
    multiple: false,
    options: 'none',
    hint: 'Convert an Apple HEIC/HEIF photo to a universal JPG.',
    supported: true,
  },
  {
    id: 'webp-to-jpg',
    label: 'WebP to JPG',
    category: 'image',
    icon: ImageIcon,
    accept: 'image/webp,.webp',
    multiple: false,
    options: 'none',
    hint: 'Convert a WebP image to a JPG.',
    supported: true,
  },
  {
    id: 'jpg-to-webp',
    label: 'JPG to WebP',
    category: 'image',
    icon: ImageIcon,
    accept: 'image/jpeg,.jpg,.jpeg',
    multiple: false,
    options: 'none',
    hint: 'Convert a JPG image to a smaller WebP.',
    supported: true,
  },
]

export type ToolOptions = {
  quality: number
  width: number
  height: number
  keepAspect: boolean
  angle: number
}

export const DEFAULT_OPTIONS: ToolOptions = {
  quality: 0.7,
  width: 1280,
  height: 720,
  keepAspect: true,
  angle: 90,
}

export function getTool(id: string): Tool | undefined {
  return TOOLS.find((t) => t.id === id)
}

// Central dispatcher: maps a tool id to its real client-side implementation.
export async function runTool(
  id: string,
  files: File[],
  options: ToolOptions,
): Promise<ProcessedFile> {
  const image = await import('./image-tools')
  const pdf = await import('./pdf-tools')
  const single = files[0]

  switch (id) {
    // Image
    case 'image-compressor':
      return image.compressImage(single, options.quality)
    case 'image-resizer':
      return image.resizeImage(single, options.width, options.height, options.keepAspect)
    case 'png-to-jpg':
      return image.convertImage(single, 'image/jpeg', 'jpg')
    case 'jpg-to-png':
      return image.convertImage(single, 'image/png', 'png')
    case 'webp-to-jpg':
      return image.convertImage(single, 'image/jpeg', 'jpg')
    case 'jpg-to-webp':
      return image.convertImage(single, 'image/webp', 'webp')
    case 'heic-to-jpg':
      return image.heicToJpg(single)

    // PDF
    case 'merge-pdf':
      return pdf.mergePdfs(files)
    case 'split-pdf':
      return pdf.splitPdf(single)
    case 'rotate-pdf':
      return pdf.rotatePdf(single, options.angle)
    case 'compress-pdf':
      return pdf.compressPdf(single, options.quality)
    case 'jpg-to-pdf':
    case 'png-to-pdf':
    case 'image-to-pdf':
      return pdf.imagesToPdf(files)
    case 'pdf-to-jpg':
      return pdf.pdfToImages(single, 'jpeg')
    case 'pdf-to-png':
      return pdf.pdfToImages(single, 'png')
    case 'pdf-to-word':
      return pdf.pdfToWord(single)
    case 'word-to-pdf':
      return pdf.wordToPdf(single)

    default:
      throw new Error('This tool is not available.')
  }
}
