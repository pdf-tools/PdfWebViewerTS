import { CanvasLayer } from '../CanvasLayer'
import { ViewerCanvasState } from '../../pdf-viewer-canvas/state/store'
import { PdfItemType, PdfPoint, PdfRect, Rect, HighlightAnnotationArgs } from '../../pdf-viewer-api'
import { CursorStyle } from '../../pdf-viewer-canvas/state/viewer'
import { renderTextSelection } from '../../pdf-viewer-canvas/view-layers/canvasShapes'
import { Color } from '../../common/Color'
import { HighlightAnnotationModule } from './HighlightAnnotationModule'
import { createAddHighlightAnnotationToolbar } from './AddHighlightAnnotationToolbar'

const moduleLayerName = 'AddHighlightAnnotation'

export class AddHighlightAnnotationLayer extends CanvasLayer {

  private context: CanvasRenderingContext2D | null | undefined

  private colors: string[] = []
  private selectedColor: string = ''
  private selectedItemType: PdfItemType = PdfItemType.HIGHLIGHT
  private startPoint: PdfPoint | null = null
  private endPoint: PdfPoint | null = null
  private selecting: boolean = false
  private selection: PdfRect[] | null = []

  public onCreate(): void {
    this.setColor = this.setColor.bind(this)
    this.close = this.close.bind(this)
    this.setItemType = this.setItemType.bind(this)

    this.context = this.createCanvas()
    this.colors = this.options.highlightColors
    this.selectedColor = this.options.defaultHighlightAnnotationColor ?
                         this.options.defaultHighlightAnnotationColor :
                         this.options.defaultHighlightColor
    /* tslint:disable-next-line:align */
    ; const toolbarElement = (this.module as HighlightAnnotationModule).toolbarElement as HTMLElement
    createAddHighlightAnnotationToolbar({
      colors: this.colors,
      selectedColor: this.selectedColor,
      selectedItemType: this.selectedItemType,
      onColorChanged: this.setColor,
      onItemTypeChanged: this.setItemType,
      onClose: this.close,
    }, toolbarElement)
    this.store.viewer.beginModule(moduleLayerName)
  }

  public onRemove(): void {
    this.removeCanvasElements()
    this.context = null
    /* tslint:disable-next-line:align */
    ; const toolbarElement = (this.module as HighlightAnnotationModule).toolbarElement as HTMLElement
    toolbarElement.innerHTML = ''

    this.store.viewer.endModule(moduleLayerName)
  }

  public render(timestamp: number, state: ViewerCanvasState): void {

    if (state.viewer.modeChanged && state.viewer.selectedModuleName !== moduleLayerName) {
      this.remove()
      return
    }

    if (this.context) {

      let drawSelection = state.canvas.canvasInvalidated

      if (state.pointer.positionChanged) {

        const pointerPos = {
          x: state.pointer.x.devicePixels,
          y: state.pointer.y.devicePixels,
        }

        const pointerPdfPos = this.pdfApi.transformScreenPointToPdfPoint(pointerPos)

        let currentTextFragment = null
        if (pointerPdfPos.isOnPage) {
          currentTextFragment = this.pdfApi.getTextFragmentOnPoint(pointerPdfPos.pdfPoint)
          if (currentTextFragment) {
            this.store.viewer.setCursorStyle(CursorStyle.TEXT)
          } else {
            this.store.viewer.setCursorStyle(CursorStyle.DEFAULT)
          }
        } else {
          this.store.viewer.setCursorStyle(CursorStyle.DEFAULT)
        }

        if (state.pointer.stateChanged) {
          if (state.pointer.isDown) {
            if (pointerPdfPos.isOnPage) {
              if (currentTextFragment) {
                this.selecting = true
                this.selection = []
                this.startPoint = pointerPdfPos.pdfPoint
                drawSelection = true
              }
            }
          } else {
            if (this.selecting) {
              this.createHighlightAnnotation()
              this.selecting = false
              this.selection = []
              drawSelection = true
            }
          }
        }

        if (this.selecting && this.startPoint && this.startPoint !== pointerPdfPos.pdfPoint) {
          this.selection = this.pdfApi.getTextSelection(this.startPoint, pointerPdfPos.pdfPoint)
          drawSelection = true
        }

      }

      if (drawSelection && this.selection) {
        const ctx = this.context
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        const screenRectSelection: Rect[] = []
        for (let i = 0; i < this.selection.length; i++) {
          const screenRect = this.pdfApi.transformPdfPageRectToScreenRect(this.selection[i])
          screenRectSelection.push(screenRect)
        }
        renderTextSelection(ctx, devicePixelRatio * state.document.zoom, this.options.textSelectionColor, screenRectSelection)
      }
    }
  }

  private setColor(color: string) {
    this.selectedColor = color
  }

  private setItemType(itemType: PdfItemType) {
    this.selectedItemType = itemType
  }

  private close() {
    this.remove()
  }

  private createHighlightAnnotation() {
    if (this.pdfApi && this.store) {
      const selection = this.selection
      if (selection) {
        const selByPage: PdfRect[][] = []
        for (let i = 0; i < selection.length; i++) {
          const rect = selection[i]
          if (!selByPage[rect.page]) {
            selByPage[rect.page] = []
          }
          selByPage[rect.page].push(rect)
        }
        let color = this.selectedColor
        if (this.selectedItemType === PdfItemType.HIGHLIGHT) {
          const colorObj = new Color(color)
          colorObj.setOpacity(this.options.highlightOpacity)
          color = colorObj.toRgba()
        }
        for (let i = 0; i < selByPage.length; i++) {
          if (selByPage[i]) {
            const quadPointRects = selByPage[i]
            const args: HighlightAnnotationArgs = {
              itemType: this.selectedItemType,
              page: i,
              pdfRect: {
                pdfX: 0,
                pdfY: 0,
                pdfW: 0,
                pdfH: 0,
                page: i,
              },
              color,
              originalAuthor: this.options.author,
              quadPointRects,
            }
            this.pdfApi.createItem(args)
          }
        }
      }
    }
  }
}
