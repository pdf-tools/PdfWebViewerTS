import { PdfViewerCanvasOptions } from '../pdf-viewer-canvas/PdfViewerCanvasOptions'
import { PdfItemType } from '../pdf-viewer-api/enums'

export function convertPdfToCssPixel(pdfPixel: string): string {
  const regex = /(\d*\.?\d+)/.exec(pdfPixel)
  const size = regex && regex.length > 1 ? parseFloat(regex[1]) : 12
  return roundToTwo(size / 72 * 96) + 'px'
}

export function convertCssToPdfPixel(cssPixel: string): string {
  const regex = /(\d*\.?\d+)/.exec(cssPixel)
  const size = regex && regex.length > 1 ? parseFloat(regex[1]) : 12
  return roundToTwo(size / 96 * 72) + 'pt'
}

export function roundToTwo(num: number) {
  return Math.round(num * 100) / 100
}

export function getColorPalette(type: PdfItemType, options: PdfViewerCanvasOptions): string[] {
  if (type === PdfItemType.INK) {
    return options.foregroundColors
  } else {
    return options.highlightColors
  }
}
