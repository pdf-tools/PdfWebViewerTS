import { CanvasLayer } from '../CanvasLayer'
import { ViewerCanvasState } from '../../pdf-viewer-canvas/state/store'
import { PdfItemType, Point, Rect, Annotation, TextStampAnnotationArgs, StampType, StampAnnotationColor } from '../../pdf-viewer-api'
import { CursorStyle } from '../../pdf-viewer-canvas/state/viewer'
import { getPageOnPoint, getRectFromSelection } from '../../pdf-viewer-canvas/state/document'
import { StampAnnotationModule } from './StampAnnotationModule'
import { createAddStampAnnotationToolbar, AddStampAnnotationToolbarActions } from './AddStampAnnotationToolbar'
import { translationManager } from '../../common/TranslationManager'

const moduleLayerName = 'AddStampAnnotation'

export class AddStampAnnotationLayer extends CanvasLayer {

  private context: CanvasRenderingContext2D | null = null

  private colors: string[] = []
  private selectedColor: string = ''
  private pointerDown: boolean = false
  private startPoint: Point | null = null
  private stampRect: Rect | null = null
  private page: number = 0
  private stampText: string | null = null
  private screenPageRect: Rect | null = null
  private translatedStampText: string | null = null
  private aspectRatio: number | null = null

  public onCreate(): void {

    this.setColor = this.setColor.bind(this)
    this.close = this.close.bind(this)
    this.onStampTextSelected = this.onStampTextSelected.bind(this)

    this.context = this.createCanvas()
    this.colors = this.options.highlightColors
    this.selectedColor = this.options.defaultHighlightColor
    this.stampText = this.options.stampText

    /* tslint:disable-next-line:align */
    ; const toolbarElement = (this.module as StampAnnotationModule).toolbarElement as HTMLElement
    createAddStampAnnotationToolbar({
      colors: this.colors,
      stampText: this.stampText,
      selectedColor: this.selectedColor,
      onStampTextSelected: this.onStampTextSelected,
      onColorChanged: this.setColor,
      onClose: this.close,
    }, toolbarElement)

    this.onStampTextSelected(this.options.stampText)

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
    ; const toolbarElement = (this.module as StampAnnotationModule).toolbarElement as HTMLElement
    toolbarElement.innerHTML = ''
    this.store.viewer.setCursorStyle(CursorStyle.DEFAULT)
    this.store.viewer.endModule(moduleLayerName)
  }

  public render(timestamp: number, state: ViewerCanvasState): void {

    if (state.viewer.modeChanged && state.viewer.selectedModuleName !== moduleLayerName) {
      this.remove()
      return
    }

    if (!this.aspectRatio) {
      return
    }

    if (this.context) {
      const update = state.viewer.modeChanged ||
        state.pointer.positionChanged ||
        state.pointer.action ||
        state.document.zoomChanged

      if (update) {
        const ctx = this.context
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        const pointerPos = { x: state.pointer.x.devicePixels, y: state.pointer.y.devicePixels }
        const pointerOnPage = getPageOnPoint(state.document, pointerPos) > 0

        if (pointerOnPage) {
          this.store.viewer.setCursorStyle(CursorStyle.CROSSHAIR)
        } else {
          this.store.viewer.setCursorStyle(CursorStyle.NOT_ALLOWED)
        }

        if (state.pointer.isDown) {

          if (!this.pointerDown) {
            this.startPoint = pointerPos
            this.page = getPageOnPoint(state.document, this.startPoint)
            this.pointerDown = true
            this.screenPageRect = this.pdfApi.getPageScreenRect(this.page)
          }

          if (this.startPoint && this.screenPageRect) {
            this.stampRect = getRectFromSelection(state.document, {
              x: this.startPoint.x,
              y: this.startPoint.y,
            }, {
                x: pointerPos.x,
                y: pointerPos.y,
              })
            if (this.stampRect) {
              this.stampRect.h = this.stampRect.w / this.aspectRatio
              const lineWidth = 2 * devicePixelRatio
              ctx.save()
              ctx.strokeStyle = this.options.textSelectionColor
              ctx.fillStyle = this.options.textSelectionColor
              ctx.lineWidth = lineWidth
              ctx.setLineDash([lineWidth, lineWidth])
              if (this.startPoint.y > pointerPos.y) {
                this.stampRect.y = this.startPoint.y - this.stampRect.h
                if (this.stampRect.y < this.screenPageRect.y) {
                  this.stampRect.y = this.screenPageRect.y
                  this.stampRect.w = this.stampRect.h * this.aspectRatio
                }
              } else {
                if (this.startPoint.y + this.stampRect.h > this.screenPageRect.y + this.screenPageRect.h) {
                  this.stampRect.h = this.screenPageRect.y + this.screenPageRect.h - this.startPoint.y
                  this.stampRect.w = this.stampRect.h * this.aspectRatio
                }
              }
              ctx.strokeRect(this.stampRect.x, this.stampRect.y, this.stampRect.w, this.stampRect.h)
              ctx.globalAlpha = .33
              ctx.fillRect(this.stampRect.x, this.stampRect.y, this.stampRect.w, this.stampRect.h)
              ctx.restore()
            }
          }

        } else if (this.pointerDown && this.startPoint) {

          if (this.stampRect) {
            this.createStampAnnotation(this.stampRect)
            this.pointerDown = false
            this.startPoint = null
            this.stampRect = null
            this.page = 0
            this.aspectRatio = null
            this.translatedStampText = null
            this.screenPageRect = null
            this.remove()
            return
          }
        }
      }
    }
  }

  private setColor(color: string) {
    this.selectedColor = color
  }

  private close() {
    this.remove()
  }

  private onStampTextSelected(stampText: string) {
    this.translatedStampText = translationManager.getText(stampText)
    this.options.stampText = stampText
    this.stampText = stampText
    const args = {
      stampType: StampType.TEXT,
      stampText: this.translatedStampText,
      name: null,
      image: null,
    }
    this.pdfApi.getStampInfo(args).then( stampInfo => {
      this.aspectRatio = stampInfo.aspectRatio
    })
  }

  private createStampAnnotation(rect: Rect) {
    const pdfRect = this.pdfApi.transformScreenRectToPdfRect(rect, this.page)

    if (this.aspectRatio && (pdfRect.pdfW < 5 || pdfRect.pdfH < 5)) {
      pdfRect.pdfW = this.options.defaultStampWidth
      pdfRect.pdfH = pdfRect.pdfW / this.aspectRatio
    }
    const stampSetting = this.options.stamps.find(item => item.name === this.stampText)
    let stampColor = null
    let stampName = null
    if (stampSetting) {
      stampColor = stampSetting.color
      stampName = stampSetting.pdfStampName !== undefined ? stampSetting.pdfStampName : null
    }
    const annotation: TextStampAnnotationArgs = {
      itemType: PdfItemType.STAMP,
      color: this.selectedColor,
      originalAuthor: this.options.author,
      page: this.page,
      pdfRect,
      stampName,
      stampText: this.translatedStampText != null ? this.translatedStampText : 'no stamptext',
      stampColor: stampColor != null ? stampColor : StampAnnotationColor.GREEN,
    }
    this.pdfApi.createItem(annotation).then(annot => {
      this.onAnnotationCreated(annot as Annotation)
    })
  }

}
