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

export function createPdfTime() {
  const time = new Date()
  const year = time.getUTCFullYear()
  let month = `${time.getUTCMonth() + 1}`
  month = padString(month, 2, '0')
  let day = `${time.getUTCDate()}`
  day = padString(day, 2, '0')
  let hour = `${time.getUTCHours()}`
  hour = padString(hour, 2, '0')
  let minutes = `${time.getUTCMinutes()}`
  minutes = padString(minutes, 2, '0')
  let seconds = `${time.getUTCSeconds()}`
  seconds = padString(seconds, 2, '0')
  const dateString = `(D:${year}${month}${day}${hour}${minutes}${seconds}Z)`
  return dateString
}

export function padString(s: string, paddingSize: number, fill: string) {
  if (s.length < paddingSize) {
    s = `${fill.repeat(paddingSize - s.length)}${s}`
  }
  return s
}