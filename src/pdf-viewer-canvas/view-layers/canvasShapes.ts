import { Rect, Point } from '../../pdf-viewer-api'

/** @internal */
/* tslint:disable-next-line */
export const renderAnnotationSelection = (ctx: CanvasRenderingContext2D, scale: number, color: string, rect: Rect, resizable: boolean) => {

  const handle = 10 * scale
  const handleOffset = handle / 2
  const padding = 4 * scale
  const x = rect.x - padding
  const y = rect.y - padding
  const w = rect.w + 2 * padding
  const h = rect.h + 2 * padding

  ctx.lineWidth = 2 * scale
  ctx.strokeStyle = color
  ctx.fillStyle = color

  if (resizable) {
    const x1 = x - handleOffset
    const x2 = x1 + w
    const y1 = y - handleOffset
    const y2 = y1 + h
    ctx.fillRect(x1, y1, handle, handle)
    ctx.fillRect(x1, y2, handle, handle)
    ctx.fillRect(x2, y1, handle, handle)
    ctx.fillRect(x2, y2, handle, handle)
  }

  ctx.strokeRect(x, y, w, h)
}

/** @internal */
export const renderTextMarker = (ctx: CanvasRenderingContext2D, scale: number, type: 'start' | 'end', color: string, rect: Rect) => {
  ctx.save()
  const startType = type === 'start'
  const lineWidth = 2 * scale

  const p = 3 * scale
  const x = startType ? rect.x - lineWidth / 2 : rect.x + rect.w + lineWidth / 2
  const y1 = startType ? rect.y - p : rect.y + rect.h + p
  const y2 = startType ? rect.y + rect.h : rect.y

  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = lineWidth
  ctx.globalAlpha = .8
  ctx.beginPath()
  ctx.moveTo(x, y1)
  ctx.lineTo(x, y2)
  ctx.closePath()
  ctx.stroke()

  ctx.restore()
}

/** @internal */
export const renderTextSelection = (ctx: CanvasRenderingContext2D, scale: number, color: string, selection: Rect[]) => {
  ctx.save()
  ctx.globalCompositeOperation = 'multiply'
  ctx.globalAlpha = .3
  ctx.fillStyle = color
  const fontSize = 12 * scale
  ctx.font = `${fontSize}px Arial`
  for (let i = 0; i < selection.length; i++) {
    const screenRect = selection[i]
    ctx.fillStyle = color
    ctx.globalAlpha = .3
    ctx.fillRect(screenRect.x, screenRect.y, screenRect.w, screenRect.h)
  }
  ctx.restore()
}

/** @internal */
export const renderPopupMarker = (ctx: CanvasRenderingContext2D, scale: number, color: string, pos: Point) => {
  const posX = pos.x
  const posY = pos.y
  ctx.beginPath()
  ctx.moveTo(posX - 5 * scale, posY - 5 * scale)
  ctx.lineTo(posX + 6 * scale, posY - 5 * scale)
  ctx.lineTo(posX + 6 * scale, posY + 3 * scale)
  ctx.lineTo(posX + 3 * scale, posY + 3 * scale)
  ctx.lineTo(posX, posY + 6 * scale)
  ctx.lineTo(posX - 3 * scale, posY + 3 * scale)
  ctx.lineTo(posX - 5 * scale, posY + 3 * scale)
  ctx.closePath()
  ctx.stroke()
  ctx.globalAlpha = 0.5
  ctx.fillStyle = color
  ctx.fill()
  ctx.globalAlpha = 1
}

/** @internal */
export const renderStickyNote = (ctx: CanvasRenderingContext2D, scale: number, rect: Rect, fillColor: string, strokeColor: string) => {
  const w = rect.w
  const h1 = rect.h * .8
  const h2 = rect.h
  const r = rect.w / 6
  const s = rect.w / 10

  const x1 = rect.x
  const y1 = rect.y
  const x1r = x1 + r
  const y1r = y1 + r
  const x2 = x1 + w
  const y2 = y1 + h1
  const x2r = x2 - r
  const y2r = y2 - r

  const xs1 = x1r + r
  const xs2 = xs1 + r
  const xs3 = x1r + s
  const ys3 = y1 + h2

  ctx.beginPath()
  ctx.moveTo(x1r, y1)
  ctx.lineTo(x2r, y1)
  ctx.arcTo(x2, y1, x2, y1r, r)
  ctx.lineTo(x2, y2r)
  ctx.arcTo(x2, y2, x2r, y2, r)
  ctx.lineTo(xs2, y2)
  ctx.lineTo(xs3, ys3)
  ctx.lineTo(xs1, y2)
  ctx.lineTo(x1r, y2)
  ctx.arcTo(x1, y2, x1, y2r, r)
  ctx.lineTo(x1, y1r)
  ctx.arcTo(x1, y1, x1r, y1, r)

  ctx.closePath()
  ctx.lineWidth = .75 * scale
  ctx.fillStyle = fillColor
  ctx.strokeStyle = strokeColor
  ctx.fill()
  ctx.stroke()

  const x1l = x1r + 1 * scale
  const x2l = x2r - 1 * scale
  const x3l = x2r - r
  const y1l = y1r + 1 * scale
  const y3l = y2r - 1 * scale
  const y2l = y1l + ((y3l - y1l) / 2)

  ctx.beginPath()
  ctx.moveTo(x1l, y1l)
  ctx.lineTo(x2l, y1l)
  ctx.closePath()
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x1l, y2l)
  ctx.lineTo(x2l, y2l)
  ctx.closePath()
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x1l, y3l)
  ctx.lineTo(x3l, y3l)
  ctx.closePath()
  ctx.stroke()
}
