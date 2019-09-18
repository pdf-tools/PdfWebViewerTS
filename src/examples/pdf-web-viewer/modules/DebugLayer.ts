import { CanvasLayer } from '../../../modules/CanvasLayer'
import { ViewerCanvasState } from '../../../pdf-viewer-canvas/state/store'
import { ViewerMode } from '../../../pdf-viewer-canvas/state/viewer'

export class DebugLayer extends CanvasLayer {

  private context: CanvasRenderingContext2D | null | undefined

  public onCreate(): void {
    this.context = this.createCanvas()
  }

  public onRemove(): void {
    this.removeCanvasElements()
    this.context = null
  }

  public render(timestamp: number, state: ViewerCanvasState): void {

    if (this.context) {
      const ctx = this.context
      const canvas = ctx.canvas
      const pixelRatio = state.canvas.pixelRatio

      ctx.restore()
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const panelHeight = 140 * pixelRatio
      const panelWidth = 340 * pixelRatio
      const panelTop = canvas.height - panelHeight - 20 * pixelRatio
      const panelLeft = 5 * pixelRatio

      ctx.fillStyle = 'rgba(245, 245, 245, .9)'
      ctx.fillRect(panelLeft, panelTop, panelWidth, panelHeight)

      ctx.font = `${12 * pixelRatio}px monospace`
      ctx.textAlign = 'start'
      ctx.textBaseline = 'top'
      ctx.fillStyle = '#000000'
      let lineTopPos = panelTop + 5 * pixelRatio
      const lineHeight = 16 * pixelRatio

      const colWidth = [10 * pixelRatio, 110 * pixelRatio, 210 * pixelRatio]

      const drawInfo = (cols: string[]) => {
        cols.forEach((text, i) => {
          ctx.fillText(text, colWidth[i], lineTopPos)
        })
        lineTopPos += lineHeight
      }

      drawInfo([
        `mode: ${ViewerMode[state.viewer.mode]}`,
      ])
      drawInfo([
        `zoom: ${state.document.zoom}`,
        '',
        `busyState: ${state.document.busyState}`,
      ])
      drawInfo([
        `pixelRatio: ${state.canvas.pixelRatio}`,
        '',
        `rotation: ${state.document.rotation}`,
      ])

      const c = state.canvas
      drawInfo([
        'canvas',
        `${Math.floor(c.width.cssPixels)}x${Math.floor(c.height.cssPixels)}`,
        `${Math.floor(c.width.devicePixels)}x${Math.floor(c.height.devicePixels)}`,
      ])

      const d = state.document
      drawInfo([
        'document',
        `${Math.floor(d.width.cssPixels)}x${Math.floor(d.height.cssPixels)}`,
        `${Math.floor(d.width.devicePixels)}x${Math.floor(d.height.devicePixels)}`,
      ])

      const s = state.scroll
      drawInfo([
        'scroll',
        `${Math.floor(s.left.cssPixels)}x${Math.floor(s.top.cssPixels)}`,
        `${Math.floor(s.left.devicePixels)}x${Math.floor(s.top.devicePixels)}`,
      ])

      const p = state.pointer
      drawInfo([
        'pointer',
        `${Math.floor(p.x.cssPixels)}x${Math.floor(p.y.cssPixels)}`,
        `${Math.floor(p.x.devicePixels)}x${Math.floor(p.y.devicePixels)}`,
      ])

      drawInfo([
        '',
        `isDown: ${p.isDown}`,
        `type: ${p.type}`,
      ])

    }
  }

}
