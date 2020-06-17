import { Rect, PdfItemType, PdfActionType, LinkAnnotation, PdfPoint } from '../../pdf-viewer-api'
import { ViewLayerBase } from './ViewLayerBase'
import { ViewerCanvasState } from '../state/store'
import { getAnnotationsOnPoint } from '../state/annotations'
import { ViewerMode, CursorStyle } from '../state/viewer'
import { renderTextSelection } from './canvasShapes'

/** @internal */
export class PdfDocumentLayer extends ViewLayerBase {
  public context: CanvasRenderingContext2D | null | undefined
  private canvas: HTMLCanvasElement | undefined

  constructor() {
    super()
  }

  public create() {
    this.context = this.createCanvas()
    this.canvas = this.context.canvas
  }

  public render(timestamp: number, state: ViewerCanvasState) {
    if (this.pdfViewerApi) {
      const draw =
        state.canvas.canvasInvalidated ||
        state.canvas.widthChanged ||
        state.canvas.heightChanged ||
        state.viewer.modeChanged ||
        state.viewer.textSelectionChanged

      const defaultState = state.viewer.mode === ViewerMode.DEFAULT

      // set cursor style and handle link click
      if (defaultState && (state.pointer.positionChanged || state.pointer.stateChanged)) {
        const pointerPos = {
          x: state.pointer.x.devicePixels,
          y: state.pointer.y.devicePixels,
        }

        const pointerPdfPos = this.pdfViewerApi.transformScreenPointToPdfPoint(pointerPos)

        this.store.viewer.setCursorStyle(CursorStyle.DEFAULT)

        if (pointerPdfPos.isOnPage) {
          const pdfPoint = pointerPdfPos.pdfPoint
          const annotationsOnPoint = getAnnotationsOnPoint(state.annotations, pdfPoint)
          const annotationOnPoint = annotationsOnPoint ? annotationsOnPoint[0] : null
          if (annotationOnPoint) {
            const itemType = annotationOnPoint.itemType
            if (
              (itemType === PdfItemType.HIGHLIGHT || itemType === PdfItemType.SQUIGGLY || itemType === PdfItemType.STRIKE_OUT) &&
              this.pdfViewerApi.getTextFragmentOnPoint(pdfPoint) !== null
            ) {
              this.store.viewer.setCursorStyle(CursorStyle.TEXT)
            } else if (itemType === PdfItemType.LINK) {
              const link = (annotationOnPoint as any) as LinkAnnotation
              this.store.viewer.setCursorStyle(CursorStyle.POINTER)
              if (link.destination && link.actionType === PdfActionType.GO_TO) {
                if (state.pointer.action === 'click') {
                  this.pdfViewerApi.goTo(link.destination)
                }
              }
            }
          } else {
            const textFragmentOnPoint = this.pdfViewerApi.getTextFragmentOnPoint(pdfPoint)
            if (textFragmentOnPoint) {
              this.store.viewer.setCursorStyle(CursorStyle.TEXT)
            }
          }
        }
      }

      if (draw) {
        const ctx = this.context as CanvasRenderingContext2D

        ctx.save()
        if (this.options.pageShadow) {
          ctx.shadowColor = this.options.pageShadow.color
          ctx.shadowBlur = this.options.pageShadow.blur
          ctx.shadowOffsetX = this.options.pageShadow.offsetX
          ctx.shadowOffsetY = this.options.pageShadow.offsetY
        }

        // draw pdf
        if (state.viewer.mode === ViewerMode.MODULE_SELECTED) {
          ctx.globalAlpha = 0.75
          this.pdfViewerApi.renderCanvas(ctx)
          ctx.globalAlpha = 1
          ctx.fillStyle = 'rgb(255,255,255)'
          ctx.globalCompositeOperation = 'destination-over'
          for (const k in state.document.pageRects) {
            if (state.document.pageRects[k]) {
              const pageRect = state.document.pageRects[k]
              ctx.fillRect(pageRect.x, pageRect.y, pageRect.w, pageRect.h)
            }
          }
        } else {
          this.pdfViewerApi.renderCanvas(ctx)
        }
        ctx.restore()

        // draw search
        if (state.search.match) {
          ctx.save()
          ctx.globalCompositeOperation = 'multiply'
          ctx.fillStyle = this.options.searchMatchColor
          ctx.globalAlpha = 0.9
          state.search.match.forEach((match) => {
            if (match.page >= state.document.firstVisiblePage && match.page <= state.document.lastVisiblePage) {
              const rect = this.pdfViewerApi.transformPdfPageRectToScreenRect(match)
              ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
            }
          })
          ctx.restore()
        }

        if (state.viewer.textSelection) {
          ctx.save()
          const selection = state.viewer.textSelection
          const screenRectSelection: Rect[] = []
          for (let i = 0; i < selection.length; i++) {
            const screenRect = this.pdfViewerApi.transformPdfPageRectToScreenRect(selection[i])
            screenRectSelection.push(screenRect)
          }
          renderTextSelection(ctx, devicePixelRatio * state.document.zoom, this.options.textSelectionColor, screenRectSelection)
          ctx.restore()
        }
      }
    }
  }
}
