import { CanvasLayer } from '../CanvasLayer'
import { ViewerCanvasState } from '../../pdf-viewer-canvas/state/store'
import { PdfItemType, Point, AnnotationArgs, Annotation } from '../../pdf-viewer-api'
import { CursorStyle } from '../../pdf-viewer-canvas/state/viewer'
import { renderStickyNote } from '../../pdf-viewer-canvas/view-layers/canvasShapes'
import { TextAnnotationModule } from './TextAnnotationModule'
import { createAddTextAnnotationToolbar } from './AddTextAnnotationToolbar'

const moduleLayerName = 'AddTextAnnotation'

export class AddTextAnnotationLayer extends CanvasLayer {

  private context: CanvasRenderingContext2D | null | undefined
  private colors: string[] = []
  private selectedColor: string = ''

  public onCreate(): void {

    this.setColor = this.setColor.bind(this)
    this.close = this.close.bind(this)

    this.context = this.createCanvas()
    this.colors = this.options.highlightColors
    this.selectedColor = this.options.stickyNoteColor

    /* tslint:disable-next-line:align */
    ; const toolbarElement = (this.module as TextAnnotationModule).toolbarElement as HTMLElement
    createAddTextAnnotationToolbar({
      colors: this.colors,
      selectedColor: this.selectedColor,
      onColorChanged: this.setColor,
      onClose: this.close,
    }, toolbarElement)

    this.store.viewer.beginModule(moduleLayerName)
  }

  public onSave() {
    const promise = new Promise<void>( (resolve, reject) => {
      resolve()
    })
    return promise
  }

  public onRemove(): void {
    this.removeCanvasElements()
    this.context = null

    /* tslint:disable-next-line:align */
    ; const toolbarElement = (this.module as TextAnnotationModule).toolbarElement as HTMLElement
    toolbarElement.innerHTML = ''

    this.store.viewer.endModule(moduleLayerName)
  }

  public render(timestamp: number, state: ViewerCanvasState): void {

    if (state.viewer.modeChanged && state.viewer.selectedModuleName !== moduleLayerName) {
      this.remove()
      return
    }

    if (this.context && (state.viewer.modeChanged || state.pointer.positionChanged || state.pointer.action || state.canvas.canvasInvalidated)) {
      const ctx = this.context
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      const scale = state.canvas.pixelRatio * state.document.zoom

      const s = 6 * scale
      const h = 22 * scale
      const rect = {
        w: 26 * scale,
        h,
        x: state.pointer.x.devicePixels - s,
        y: state.pointer.y.devicePixels - h,
      }

      let rectOnPage = false
      for (const k in state.document.pageRects) {
        if (state.document.pageRects[k]) {
          const p = state.document.pageRects[k]
          const px2 = p.x + p.w
          const rx2 = rect.x + rect.w
          const py2 = p.y + p.h
          const ry2 = rect.y + rect.h
          if (rect.x >= p.x && rx2 <= px2 && rect.y >= p.y && ry2 <= py2) {
            rectOnPage = true
            break
          }
        }
      }

      if (rectOnPage) {
        if (state.pointer.type === 'mouse') {
          renderStickyNote(ctx, scale, rect, this.selectedColor, '#000000')
          this.store.viewer.setCursorStyle(CursorStyle.DEFAULT)
        }

        if (state.pointer.action === 'click') {
          rect.y = rect.y + rect.h
          this.createTextAnnotation(rect, this.selectedColor)
          this.remove()
          return
        }
      } else {
        this.store.viewer.setCursorStyle(CursorStyle.NOT_ALLOWED)
      }
    }
  }

  private setColor(color: string) {
    this.selectedColor = color
    this.options.stickyNoteColor = color
  }

  private close() {
    this.remove()
  }

  private createTextAnnotation(point: Point, color: string) {

    const pdfPoint = this.pdfApi.transformScreenPointToPdfPoint({
      x: point.x,
      y: point.y,
    }).pdfPoint

    const annotation: AnnotationArgs = {
      itemType: PdfItemType.TEXT,
      color,
      originalAuthor: this.options.author,
      page: pdfPoint.page,
      pdfRect: {
        pdfX: pdfPoint.pdfX,
        pdfY: pdfPoint.pdfY,
        pdfW: 0,
        pdfH: 0,
        page: pdfPoint.page,
      },
    }
    this.pdfApi.createItem(annotation).then( annot => {
      this.onAnnotationCreated(annot as Annotation)
    })
  }
}
