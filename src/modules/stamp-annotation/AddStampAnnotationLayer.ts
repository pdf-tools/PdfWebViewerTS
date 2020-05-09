import { CanvasLayer } from '../CanvasLayer'
import { ViewerCanvasState } from '../../pdf-viewer-canvas/state/store'
import { PdfItemType, Point, Rect, Annotation, TextStampAnnotationArgs, ImageStampAnnotationArgs, StampType, StampAnnotationColor } from '../../pdf-viewer-api'
import { CursorStyle } from '../../pdf-viewer-canvas/state/viewer'
import { getPageOnPoint, getRectFromSelection } from '../../pdf-viewer-canvas/state/document'
import { StampAnnotationModule } from './StampAnnotationModule'
import { createAddStampAnnotationToolbar } from './AddStampAnnotationToolbar'
import { translationManager } from '../../common/TranslationManager'
import { imageDataUrlToUint8Array } from '../../common/Tools'

const moduleLayerName = 'AddStampAnnotation'

export class AddStampAnnotationLayer extends CanvasLayer {
  private context: CanvasRenderingContext2D | null = null

  private pointerDown: boolean = false
  private startPoint: Point | null = null
  private stampRect: Rect | null = null
  private page: number = 0
  private screenPageRect: Rect | null = null
  private selectedStamp: number = -1
  private aspectRatio: number | null = null
  private stamps: any[] = []

  public onCreate(): void {
    this.setStamp = this.setStamp.bind(this)
    this.close = this.close.bind(this)
    this.context = this.createCanvas()
    this.stamps = this.options.stamps

    /* tslint:disable-next-line:align */
    const toolbarElement = (this.module as StampAnnotationModule).toolbarElement as HTMLElement
    createAddStampAnnotationToolbar(
      {
        selectedStamp: this.selectedStamp,
        stamps: this.stamps,
        onStampChanged: this.setStamp,
        onClose: this.close,
      },
      toolbarElement,
    )

    this.store.viewer.beginModule(moduleLayerName)
  }

  public onSave() {
    const promise = new Promise<void>((resolve, reject) => {
      resolve()
    })
    return promise
  }

  public onRemove(): void {
    this.removeCanvasElements()
    this.context = null

    /* tslint:disable-next-line:align */
    const toolbarElement = (this.module as StampAnnotationModule).toolbarElement as HTMLElement
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
      const update = state.viewer.modeChanged || state.pointer.positionChanged || state.pointer.action || state.document.zoomChanged

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
            this.stampRect = getRectFromSelection(
              state.document,
              {
                x: this.startPoint.x,
                y: this.startPoint.y,
              },
              {
                x: pointerPos.x,
                y: pointerPos.y,
              },
            )
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
              ctx.globalAlpha = 0.33
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
            this.selectedStamp = -1
            this.screenPageRect = null
            this.remove()
            return
          }
        }
      }
    }
  }

  private close() {
    this.remove()
  }

  private setStamp(stampIndex: number) {
    this.selectedStamp = stampIndex

    const stamp = this.stamps[stampIndex]

    if (stamp.image) {
      const img = new Image()
      img.onload = () => {
        this.aspectRatio = img.width / img.height
      }
      img.src = stamp.image
      return
    }

    const getStampInfoArgs = {
      stampType: StampType.TEXT,
      stampText: translationManager.getText(stamp.name),
      name: null,
      image: null,
    }
    this.pdfApi.getStampInfo(getStampInfoArgs).then((stampInfo) => {
      this.aspectRatio = stampInfo.aspectRatio
    })
  }

  private createStampAnnotation(rect: Rect) {
    const pdfRect = this.pdfApi.transformScreenRectToPdfRect(rect, this.page)

    if (this.aspectRatio && (pdfRect.pdfW < 5 || pdfRect.pdfH < 5)) {
      pdfRect.pdfW = this.options.defaultStampWidth
      pdfRect.pdfH = pdfRect.pdfW / this.aspectRatio
    }

    const stampSetting = this.stamps[this.selectedStamp]

    if (stampSetting.image) {
      const imgData = imageDataUrlToUint8Array(stampSetting.image)
      this.pdfApi.registerStampImage(imgData).then((imageId) => {
        const annotation: ImageStampAnnotationArgs = {
          itemType: PdfItemType.STAMP,
          imageId,
          page: pdfRect.page,
          color: this.options.defaultHighlightColor,
          pdfRect,
          originalAuthor: this.options.author,
        }

        this.pdfApi.createItem(annotation).then((annot) => {
          this.onAnnotationCreated(annot as Annotation)
        })
      })
    } else {
      let stampColor = null
      let stampName = null
      if (stampSetting) {
        stampColor = stampSetting.color
        stampName = stampSetting.pdfStampName !== undefined ? stampSetting.pdfStampName : null
      }
      const annotation: TextStampAnnotationArgs = {
        itemType: PdfItemType.STAMP,
        color: this.options.defaultHighlightColor,
        originalAuthor: this.options.author,
        page: pdfRect.page,
        pdfRect,
        stampName,
        stampText: translationManager.getText(stampSetting.name),
        stampColor: stampColor != null ? stampColor : StampAnnotationColor.GREEN,
      }
      this.pdfApi.createItem(annotation).then((annot) => {
        this.onAnnotationCreated(annot as Annotation)
      })
    }
  }
}
