import { CanvasLayer } from '../CanvasLayer'
import { ViewerCanvasState } from '../../pdf-viewer-canvas/state/store'
import { PdfItemType, Point, ShapeAnnotationArgs, AnnotationBorderStyle, Rect } from '../../pdf-viewer-api'
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
  private strokeWidths: number[] = []
  private fillColors: string[] = []
  private selectedStrokeColor: string = ''
  private selectedStrokeWidth: number = 1
  private selectedStrokeStyle: AnnotationBorderStyle = AnnotationBorderStyle.SOLID
  private selectedFillColor: string = ''

  public onCreate(itemType: PdfItemType): void {
    this.setStrokeColor = this.setStrokeColor.bind(this)
    this.setStrokeWidth = this.setStrokeWidth.bind(this)
    this.setStrokeStyle = this.setStrokeStyle.bind(this)
    this.setFillColor = this.setFillColor.bind(this)
    this.cancel = this.cancel.bind(this)
    this.context = this.createCanvas()
    this.itemType = itemType
    this.strokeColors = this.options.strokeColors
    this.strokeWidths = this.options.strokeWidths
    this.fillColors = this.options.fillColors
    this.selectedStrokeColor = this.options.defaultStrokeColor ? this.options.defaultStrokeColor : this.options.defaultForegroundColor
    this.selectedStrokeWidth = this.options.defaultStrokeWidth
    this.selectedFillColor = this.options.defaultFillColor ? this.options.defaultFillColor : this.options.fillColors[0]

    this.store.viewer.beginModule(moduleLayerName)

    /* tslint:disable-next-line:align */
    const toolbarElement = (this.module as ShapeAnnotationModule).toolbarElement as HTMLElement
    this.toolbar = createShapeAnnotationToolbar(
      {
        strokeColors: this.strokeColors,
        strokeWidths: this.strokeWidths,
        fillColors: this.fillColors,
        selectedStrokeColor: this.selectedStrokeColor,
        selectedStrokeWidth: this.selectedStrokeWidth,
        selectedStrokeStyle: this.selectedStrokeStyle,
        selectedFillColor: this.selectedFillColor,
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
              ctx.strokeStyle = this.selectedStrokeColor
              ctx.fillStyle = this.selectedFillColor
              ctx.lineWidth = this.selectedStrokeWidth * devicePixelRatio * state.document.zoom
              // ctx.lineWidth = this.pdfApi.transformPdfLengthToDeviceLength(this.selectedStrokeWidth) * 2

              if (this.selectedStrokeStyle === AnnotationBorderStyle.DASHED) {
                ctx.setLineDash([ctx.lineWidth])
              }

              if (this.itemType === PdfItemType.CIRCLE) {
                console.log('draw circle')
                const cX = rect.x + rect.w / 2
                const cY = rect.y + rect.h / 2
                ctx.beginPath()
                ctx.ellipse(cX, cY, rect.w / 2, rect.h / 2, 0, 0, Math.PI * 2)
                ctx.fill()
                ctx.stroke()
              } else {
                ctx.strokeRect(rect.x, rect.y, rect.w, rect.h)
                ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
              }

              ctx.restore()
            }
          }
          console.log('pointer down')
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
    this.selectedStrokeColor = color
  }

  private setStrokeWidth(width: number) {
    this.selectedStrokeWidth = width
  }

  private setStrokeStyle(style: AnnotationBorderStyle) {
    this.selectedStrokeStyle = style
  }

  private setFillColor(color: string) {
    this.selectedFillColor = color
  }

  private createRectangleAnnotation(rect: Rect) {
    const pdfRect = this.pdfApi.transformScreenRectToPdfRect(rect, this.page)

    const annotation: ShapeAnnotationArgs = {
      itemType: this.itemType as PdfItemType,
      color: this.selectedStrokeColor,
      pdfRect,
      page: this.page,
      originalAuthor: this.options.author,
      fillColor: this.selectedFillColor,
      border: {
        width: this.selectedStrokeWidth,
        style: this.selectedStrokeStyle,
      },
    }

    this.pdfApi
      .createItem(annotation)
      .then((annot) => {
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
