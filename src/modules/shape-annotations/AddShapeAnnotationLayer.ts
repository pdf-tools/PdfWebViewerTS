import { CanvasLayer } from '../CanvasLayer'
import { ViewerCanvasState } from '../../pdf-viewer-canvas/state/store'
import { PdfItemType, Point, ShapeDrawingAnnotationArgs, AnnotationBorderStyle, Rect } from '../../pdf-viewer-api'
import { CursorStyle } from '../../pdf-viewer-canvas/state/viewer'
import { getPageOnPoint, getRectFromSelection } from '../../pdf-viewer-canvas/state/document'
import { createShapeAnnotationToolbar, ShapeAnnotationToolbarActions } from './ShapeAnnotationToolbar'
import { ShapeAnnotationModule } from './ShapeAnnotationModule'
import { Color } from '../../common/Color'

const moduleLayerName = 'AddShapeAnnotation'

export class AddShapeAnnotationLayer extends CanvasLayer {
  private context: CanvasRenderingContext2D | null = null
  private toolbar: ShapeAnnotationToolbarActions | null = null
  private page: number = 0
  private pointerDown: boolean = false
  private startPoint: Point | null = null
  private itemType: PdfItemType | null = null

  private strokeColors: string[] = []
  private fillColors: string[] = []

  public onCreate(itemType: PdfItemType): void {
    this.setStrokeColor = this.setStrokeColor.bind(this)
    this.setStrokeWidth = this.setStrokeWidth.bind(this)
    this.setStrokeStyle = this.setStrokeStyle.bind(this)
    this.setFillColor = this.setFillColor.bind(this)
    this.cancel = this.cancel.bind(this)
    this.context = this.createCanvas()
    this.itemType = itemType
    this.strokeColors = this.options.foregroundColors
    this.fillColors = this.options.backgroundColors

    this.store.viewer.beginModule(moduleLayerName)

    /* tslint:disable-next-line:align */
    const toolbarElement = (this.module as ShapeAnnotationModule).toolbarElement as HTMLElement
    this.toolbar = createShapeAnnotationToolbar(
      {
        strokeColors: this.strokeColors,
        strokeWidths: this.options.strokeWidths,
        fillColors: this.fillColors,
        selectedStrokeColor: this.options.shapeColor,
        selectedStrokeWidth: this.options.shapeStrokeWidth,
        selectedStrokeStyle: this.options.shapeStrokeStyle,
        selectedFillColor: this.options.shapeFillColor,
        onStrokeColorChanged: this.setStrokeColor,
        onStrokeWidthChanged: this.setStrokeWidth,
        onStrokeStyleChanged: this.setStrokeStyle,
        onFillColorChanged: this.setFillColor,
        onCancel: this.cancel,
      },
      toolbarElement,
    )
  }

  public cancel() {
    this.onRemove()
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
    const toolbarElement = (this.module as ShapeAnnotationModule).toolbarElement as HTMLElement
    toolbarElement.innerHTML = ''

    this.store.viewer.setCursorStyle(CursorStyle.DEFAULT)
    this.store.viewer.endModule(moduleLayerName)
  }

  public render(timestamp: number, state: ViewerCanvasState): void {
    if (state.viewer.modeChanged && state.viewer.selectedModuleName !== moduleLayerName) {
      this.remove()
      return
    }

    if (this.context) {
      const update = state.viewer.modeChanged || state.pointer.positionChanged || state.pointer.action || state.document.zoomChanged

      if (update) {
        const ctx = this.context
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        const pointerPos = { x: state.pointer.x.devicePixels, y: state.pointer.y.devicePixels }
        const page = getPageOnPoint(state.document, pointerPos)
        const pointerOnPage = page > 0

        if (pointerOnPage) {
          this.store.viewer.setCursorStyle(CursorStyle.CROSSHAIR)
        } else {
          this.store.viewer.setCursorStyle(CursorStyle.NOT_ALLOWED)
        }

        if (state.pointer.isDown) {
          if (!this.pointerDown) {
            this.startPoint = pointerPos
            this.pointerDown = true

            if (this.page === 0 && page !== 0) {
              this.page = page
            }
          }

          if (this.startPoint) {
            const rect = getRectFromSelection(
              state.document,
              {
                x: this.startPoint.x,
                y: this.startPoint.y,
              },
              {
                x: pointerPos.x,
                y: pointerPos.y,
              },
              this.page,
            )

            if (rect) {
              ctx.save()
              ctx.strokeStyle = this.options.shapeColor
              ctx.fillStyle = this.options.shapeFillColor
              ctx.lineWidth = this.options.shapeStrokeWidth * devicePixelRatio * state.document.zoom

              if (this.options.shapeStrokeStyle === AnnotationBorderStyle.DASHED) {
                ctx.setLineDash([ctx.lineWidth])
              }
              if (this.itemType === PdfItemType.CIRCLE) {
                const cX = rect.x + rect.w / 2
                const cY = rect.y + rect.h / 2
                ctx.beginPath()
                ctx.ellipse(cX, cY, rect.w / 2, rect.h / 2, 0, 0, Math.PI * 2)
                ctx.fill()
                ctx.stroke()
              } else {
                ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
                ctx.strokeRect(rect.x + ctx.lineWidth / 2, rect.y + ctx.lineWidth / 2, rect.w - ctx.lineWidth, rect.h - ctx.lineWidth)
              }

              ctx.restore()
            }
          }
        } else if (this.pointerDown && this.startPoint) {
          const rect = getRectFromSelection(
            state.document,
            {
              x: this.startPoint.x,
              y: this.startPoint.y,
            },
            {
              x: pointerPos.x,
              y: pointerPos.y,
            },
            this.page,
          )
          if (rect) {
            this.pointerDown = false
            this.startPoint = null
            this.createRectangleAnnotation(rect)
          }
        }
      }
    }
  }

  private setStrokeColor(color: string) {
    this.options.shapeColor = color
  }

  private setStrokeWidth(width: number) {
    this.options.shapeStrokeWidth = width
  }

  private setStrokeStyle(style: AnnotationBorderStyle) {
    this.options.shapeStrokeStyle = style
  }

  private setFillColor(color: string) {
    this.options.shapeFillColor = color
  }

  private createRectangleAnnotation(rect: Rect) {
    const pdfRect = this.pdfApi.transformScreenRectToPdfRect(rect, this.page)

    const annotation: ShapeDrawingAnnotationArgs = {
      itemType: this.itemType as PdfItemType,
      color: this.options.shapeColor,
      pdfRect,
      page: this.page,
      originalAuthor: this.options.author,
      fillColor: this.options.shapeFillColor === 'transparent' ? null : this.options.shapeFillColor,
      border: {
        width: this.options.shapeStrokeWidth,
        style: this.options.shapeStrokeStyle,
      },
    }

    this.pdfApi
      .createItem(annotation)
      .then(() => {
        this.remove()
        // select new annotation
        // const pdfViewerCanvasApi = this.pdfViewerCanvas as any
        // pdfViewerCanvasApi.dispatchEvent('itemSelected', annot)
      })
      .catch((err) => {
        console.log(err)
      })
  }
}
