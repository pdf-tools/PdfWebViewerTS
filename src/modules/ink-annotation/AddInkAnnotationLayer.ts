import { CanvasLayer } from '../CanvasLayer'
import { ViewerCanvasState } from '../../pdf-viewer-canvas/state/store'
import { PdfItemType, Point, AnnotationArgs, InkAnnotationArgs, PdfPoint, AnnotationBorderStyle, PdfRect } from '../../pdf-viewer-api'
import { CursorStyle } from '../../pdf-viewer-canvas/state/viewer'
import { getPageOnPoint } from '../../pdf-viewer-canvas/state/document'
import { createAddInkAnnotationToolbar, AddInkAnnotationToolbarActions } from './AddInkAnnotationToolbar'
import { InkAnnotationModule } from './InkAnnotationModule'
import { Color } from '../../common/Color'

const moduleLayerName = 'AddInkAnnotation'

export class AddInkAnnotationLayer extends CanvasLayer {

  private context: CanvasRenderingContext2D | null = null
  private drawing: boolean = false
  private lines: PdfPoint[][] | null = []
  private page: number | null = null
  private penColors: string[] = []
  private penWidths: number[] = []
  private penOpacity: number = 100
  private selectedPenColor: string = ''
  private selectedPenSize: number = 1
  private penRgbaColor: string = ''
  private boundingBox: PdfRect | null = null
  private toolbar: AddInkAnnotationToolbarActions | null = null

  public onCreate(): void {
    this.setPenColor = this.setPenColor.bind(this)
    this.setPenSize = this.setPenSize.bind(this)
    this.setPenOpacity = this.setPenOpacity.bind(this)
    this.add = this.add.bind(this)
    this.undo = this.undo.bind(this)
    this.save = this.save.bind(this)

    this.context = this.createCanvas()
    this.penColors = this.options.foregroundColors
    this.penWidths = [1, 2, 3, 5, 8, 13, 21]
    this.selectedPenColor = this.options.defaultInkColor ?
                            this.options.defaultInkColor :
                            this.options.defaultForegroundColor
    this.selectedPenSize = this.options.defaultBorderSize
    this.penRgbaColor = this.selectedPenColor
    this.store.viewer.beginModule(moduleLayerName)

    /* tslint:disable-next-line:align */
    ; const toolbarElement = (this.module as InkAnnotationModule).toolbarElement as HTMLElement
    this.toolbar = createAddInkAnnotationToolbar({
      penColors: this.penColors,
      penWidths: this.penWidths,
      selectedPenColor: this.selectedPenColor,
      selectedPenSize: this.selectedPenSize,
      penOpacity: this.penOpacity,
      onPenColorChanged: this.setPenColor,
      onPenSizeChanged: this.setPenSize,
      onPenOpacityChanged: this.setPenOpacity,
      onSave: this.save,
      onUndo: this.undo,
      onAdd: this.add,
      onCancel: this.remove,
    }, toolbarElement)
  }

  public onRemove(): void {
    this.removeCanvasElements()
    this.context = null
    /* tslint:disable-next-line:align */
    ; const toolbarElement = (this.module as InkAnnotationModule).toolbarElement as HTMLElement
    toolbarElement.innerHTML = ''

    this.store.viewer.endModule(moduleLayerName)
  }

  public render(timestamp: number, state: ViewerCanvasState): void {

    if (state.viewer.modeChanged && state.viewer.selectedModuleName !== moduleLayerName) {
      this.remove()
      return
    }

    if (this.context && this.lines) {

      let drawPath = state.canvas.canvasInvalidated

      if (state.pointer.stateChanged) {
        if (state.pointer.isDown) {

          const page = getPageOnPoint(state.document, {
            x: state.pointer.x.devicePixels,
            y: state.pointer.y.devicePixels,
          })

          if (this.page === null && page > 0) {
            this.page = page
          }

          if (this.page === page) {
            this.drawing = true
            this.lines.push([])
            if (this.toolbar) {
              this.toolbar.setLineCount(this.lines.length)
            }
          }
        } else {
          this.drawing = false
          if (this.lines.length > 0 && this.lines[this.lines.length - 1].length < 3) {
            this.lines.pop()
            if (this.toolbar) {
              this.toolbar.setLineCount(this.lines.length)
            }
          }
          this.boundingBox = this.getBoundingBox()
          this.store.canvas.setCanvasInvalidated(true)
        }
      }

      // capture mouse move
      if (this.drawing && state.pointer.positionChanged && this.page) {

        const pos = {
          x: state.pointer.x.devicePixels,
          y: state.pointer.y.devicePixels,
        }
        const pdfPointRes = this.pdfApi.transformScreenPointToPdfPoint(pos, this.page)

        if (pdfPointRes.isOnPage) {
          this.lines[this.lines.length - 1].push(pdfPointRes.pdfPoint)
          drawPath = true
        }
      }

      if (state.pointer.positionChanged) {
        const page = getPageOnPoint(state.document, {
          x: state.pointer.x.devicePixels,
          y: state.pointer.y.devicePixels,
        })

        if (this.page !== null) {
          if (this.page === page) {
            this.store.viewer.setCursorStyle(CursorStyle.CROSSHAIR)
          } else {
            this.store.viewer.setCursorStyle(CursorStyle.NOT_ALLOWED)
          }
        } else {
          if (page) {
            this.store.viewer.setCursorStyle(CursorStyle.CROSSHAIR)
          } else {
            this.store.viewer.setCursorStyle(CursorStyle.NOT_ALLOWED)
          }
        }
      }

      if (drawPath) {
        const ctx = this.context
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        const pageRect = state.document.pageRects[this.page as number]
        if (pageRect) {

          const ox = pageRect.x
          const oy = pageRect.y
          const s = this.pdfApi.transformPdfLengthToDeviceLength(1000) / 1000
          ctx.strokeStyle = this.penRgbaColor
          ctx.lineWidth = this.selectedPenSize * devicePixelRatio * state.document.zoom
          this.lines.forEach(pointList => {
            ctx.beginPath()
            const p1 = pointList[0]
            ctx.moveTo(ox + (p1.pdfX * s), oy + (p1.pdfY * s))
            for (let i = 0; i < pointList.length; i++) {
              const p = pointList[i]
              ctx.lineTo(ox + (p.pdfX * s), oy + (p.pdfY * s))
            }
            ctx.stroke()
          })
        }

        if (!this.drawing && this.boundingBox) {
          const pdfRect = this.boundingBox
          if (pdfRect.page) {
            const rect = this.pdfApi.transformPdfPageRectToScreenRect(pdfRect)
            ctx.save()
            ctx.strokeStyle = this.options.textSelectionColor
            ctx.lineWidth = 1 * devicePixelRatio
            ctx.setLineDash([2 * devicePixelRatio, 3 * devicePixelRatio])
            const p = this.selectedPenSize * devicePixelRatio
            const p2 = p * 2
            ctx.strokeRect(
              rect.x - p,
              rect.y - p,
              rect.w + p2,
              rect.h + p2,
            )
            ctx.restore()
          }
        }
      }
    }
  }

  private setPenColor(color: string) {
    this.selectedPenColor = color
    const rgbaColor = new Color(color)
    rgbaColor.setOpacity(this.penOpacity / 100)
    this.penRgbaColor = rgbaColor.toRgba()
    this.store.canvas.setCanvasInvalidated(true)
  }

  private setPenSize(size: number) {
    this.selectedPenSize = size
    this.store.canvas.setCanvasInvalidated(true)
  }

  private setPenOpacity(opacity: number) {
    this.penOpacity = opacity
    const rgbaColor = new Color(this.selectedPenColor)
    rgbaColor.setOpacity(this.penOpacity / 100)
    this.penRgbaColor = rgbaColor.toRgba()
    this.store.canvas.setCanvasInvalidated(true)
  }

  private save() {
    this.createInkAnnotation()
    this.remove()
  }

  private add() {
    this.createInkAnnotation()
  }

  private undo() {
    if (this.lines && this.lines.length > 0) {
      this.lines.pop()
      if (this.lines.length === 0) {
        this.page = null
        this.boundingBox = null
      } else {
        this.boundingBox = this.getBoundingBox()
      }
      if (this.toolbar) {
        this.toolbar.setLineCount(this.lines.length)
      }
      this.store.canvas.setCanvasInvalidated(true)
    }
  }

  private createInkAnnotation() {
    if (this.pdfApi && this.page && this.lines && this.lines.length > 0) {
      const inkList: number[][] = []

      let x1 = 1000000000
      let x2 = 0
      let y1 = 1000000000
      let y2 = 0

      this.lines.forEach(pointList => {
        const line: number[] = []
        for (let i = 0; i < pointList.length; i++) {
          const p = pointList[i]
          if (p.pdfX < x1) {
            x1 = p.pdfX
          }
          if (p.pdfX > x2) {
            x2 = p.pdfX
          }
          if (p.pdfY < y1) {
            y1 = p.pdfY
          }
          if (p.pdfY > y2) {
            y2 = p.pdfY
          }
          line.push(p.pdfX)
          line.push(p.pdfY)
        }
        inkList.push(line)
      })

      const inkAnnotation: InkAnnotationArgs = {
        itemType: PdfItemType.INK,
        page: this.page,
        pdfRect: {
          pdfX: x1,
          pdfY: y1,
          pdfW: x2 - x1,
          pdfH: y2 - y1,
          page: this.page,
        },
        color: this.penRgbaColor,
        originalAuthor: this.options.author,
        border: {
          style: AnnotationBorderStyle.SOLID,
          width: this.selectedPenSize,
        },
        inkList,
      }

      this.lines = []
      this.page = null
      this.boundingBox = null
      if (this.toolbar) {
        this.toolbar.setLineCount(0)
      }

      this.pdfApi.createItem(inkAnnotation)
    }
  }

  private getBoundingBox() {
    const pdfRect = {
      pdfX: 0,
      pdfY: 0,
      pdfW: 0,
      pdfH: 0,
      page: this.page ? this.page : 0,
    }

    if (this.lines && this.lines.length > 0) {

      let x1 = 1000000000
      let x2 = 0
      let y1 = 1000000000
      let y2 = 0

      this.lines.forEach(pointList => {
        const line: number[] = []
        for (let i = 0; i < pointList.length; i++) {
          const p = pointList[i]
          if (p.pdfX < x1) {
            x1 = p.pdfX
          }
          if (p.pdfX > x2) {
            x2 = p.pdfX
          }
          if (p.pdfY < y1) {
            y1 = p.pdfY
          }
          if (p.pdfY > y2) {
            y2 = p.pdfY
          }
        }
      })
      pdfRect.pdfX = x1
      pdfRect.pdfY = y1
      pdfRect.pdfW = x2 - x1
      pdfRect.pdfH = y2 - y1
    }
    return pdfRect
  }
}
