import { PdfViewerCanvasOptions } from '../pdf-viewer-canvas/PdfViewerCanvasOptions'
import { PdfItemType } from '../pdf-viewer-api/enums'

export function convertPdfToCssPixel(pdfPixel: string): string {
  const regex = /(\d*\.?\d+)/.exec(pdfPixel)
  const size = regex && regex.length > 1 ? parseFloat(regex[1]) : 12
  return roundToTwo((size / 72) * 96) + 'px'
}

export function convertCssToPdfPixel(cssPixel: string): string {
  const regex = /(\d*\.?\d+)/.exec(cssPixel)
  const size = regex && regex.length > 1 ? parseFloat(regex[1]) : 12
  return roundToTwo((size / 96) * 72) + 'pt'
}

export function roundToTwo(num: number) {
  return Math.round(num * 100) / 100
}

export function getColorPalette(
  type: PdfItemType,
  options: PdfViewerCanvasOptions,
): string[] {
  if (type === PdfItemType.INK) {
    return options.foregroundColors
  } else {
    return options.highlightColors
  }
}

export function createPdfTime() {
  const time = new Date()
  const year = time.getFullYear()
  let month = `${time.getMonth() + 1}`
  month = padString(month, 2, '0')
  let day = `${time.getDate()}`
  day = padString(day, 2, '0')
  let hour = `${time.getHours()}`
  hour = padString(hour, 2, '0')
  let minutes = `${time.getMinutes()}`
  minutes = padString(minutes, 2, '0')
  let seconds = `${time.getSeconds()}`
  seconds = padString(seconds, 2, '0')
  let offsetString = time.getTimezoneOffset() < 0 ? '+' : ''
  const hourOffset = (-1) * Math.floor(time.getTimezoneOffset() / 60)
  offsetString += padString(hourOffset.toString(), 2, '0') + `'`
  const minuteOffset = (-1) * Math.floor(time.getTimezoneOffset() % 60)
  offsetString += padString(minuteOffset.toString(), 2, '0') + `'`
  const dateString = `(D:${year}${month}${day}${hour}${minutes}${seconds}${offsetString})`
  return dateString
}

export const formatDate = (dateStr: string) => {
  if (dateStr.indexOf('(D:') === 0) {
    // todo: convert to local time
    return `${dateStr.substr(9, 2)}.${dateStr.substr(7, 2)}.${dateStr.substr(
      3,
      4,
    )} ${dateStr.substr(11, 2)}:${dateStr.substr(13, 2)}`
  }

  return `${dateStr.substr(8, 2)}.${dateStr.substr(6, 2)}.${dateStr.substr(
    2,
    4,
  )} ${dateStr.substr(10, 2)}:${dateStr.substr(12, 2)}`
}

export function padString(s: string, paddingSize: number, fill: string) {
  if (s.length < paddingSize) {
    s = `${fill.repeat(paddingSize - s.length)}${s}`
  }
  return s
}
