import { PdfViewerApi, Annotation } from '../../pdf-viewer-api'
import { PdfViewerCanvas, PdfViewerCanvasEventMap } from '../PdfViewerCanvas'
import { PdfViewerCanvasOptions } from '../PdfViewerCanvasOptions'
import { ViewerCanvasState, ViewerCanvasStore } from '../state/store'
import { createPdfTime } from '../../common/Tools'

export interface ViewLayer {
  resize(width: number, height: number, devicePixelRatio: number): void
  render(timestamp: number, viewerCanvasState: ViewerCanvasState): void
}

export abstract class ViewLayerBase implements ViewLayer {
  protected viewerCanvas: PdfViewerCanvas | undefined
  protected dispatchEvent: any
  protected containerElement: HTMLElement | undefined

  private canvasContexts: CanvasRenderingContext2D[]
  private htmlLayers: HTMLElement[]

  private pPdfViewerApi: PdfViewerApi | undefined
  private pStore: ViewerCanvasStore | undefined
  private pOptions: PdfViewerCanvasOptions | undefined

  constructor() {
    this.canvasContexts = []
    this.htmlLayers = []
  }

  protected get pdfViewerApi() {
    if (!this.pPdfViewerApi) {
      this.pPdfViewerApi = (this.viewerCanvas as any).pdfViewerApi as PdfViewerApi
      if (!this.pPdfViewerApi) {
        throw new Error('pdfViewerApi in undefined')
      }
    }
    return this.pPdfViewerApi
  }

  protected get store() {
    if (!this.pStore) {
      this.pStore = (this.viewerCanvas as any).store as ViewerCanvasStore
      if (!this.pStore) {
        throw new Error('pStore in undefined')
      }
    }
    return this.pStore
  }

  protected get options() {
    if (!this.pOptions) {
      this.pOptions = (this.viewerCanvas as any).options as PdfViewerCanvasOptions
      if (!this.pOptions) {
        throw new Error('options in undefined')
      }
    }
    return this.pOptions
  }
  public resize(width: number, height: number, pixelRatio: number): void {

    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = width * pixelRatio
    tempCanvas.height = height * pixelRatio
    const tempContext = tempCanvas.getContext('2d') as CanvasRenderingContext2D

    this.canvasContexts.forEach(ctx => {
      tempContext.drawImage(ctx.canvas, 0, 0)
      ctx.canvas.style.width = width + 'px'
      ctx.canvas.style.height = height + 'px'
      ctx.canvas.width = width * pixelRatio
      ctx.canvas.height = height * pixelRatio
      ctx.drawImage(tempContext.canvas, 0, 0)
    })
  }

  public register(viewerCanvas: PdfViewerCanvas, dispatchEvent: <K extends keyof PdfViewerCanvasEventMap>(type: K, args: PdfViewerCanvasEventMap[K]) => void) {
    this.viewerCanvas = viewerCanvas
    this.dispatchEvent = dispatchEvent
    this.containerElement = this.viewerCanvas.viewLayersElement
    this.create()
  }

  public abstract create(): void

  public abstract render(timestamp: number, state: ViewerCanvasState): void | boolean

  protected createHtmlLayer() {
    const element = document.createElement('div')

    this.htmlLayers.push(element)
    if (this.containerElement) {

      this.containerElement.appendChild(element)
    }
    return element
  }

  protected createCanvas() {
    const element = document.createElement('canvas')
    element.style.position = 'absolute'
    element.style.top = '0'
    element.style.left = '0'
    element.style.right = '0'
    element.style.bottom = '0'

    const context = element.getContext('2d') as CanvasRenderingContext2D
    this.canvasContexts.push(context)
    if (this.containerElement) {
      this.containerElement.appendChild(element)
      const rect = this.containerElement.getBoundingClientRect()
      context.canvas.width = rect.width * devicePixelRatio
      context.canvas.height = rect.height * devicePixelRatio
    }
    return context
  }

  protected removeHtmlElements() {
    if (this.containerElement) {
      for (let i = 0; i < this.htmlLayers.length; i++) {
        this.containerElement.removeChild(this.htmlLayers[i])
      }
      this.htmlLayers = []
    }
  }
  protected removeCanvasElements() {
    if (this.containerElement) {
      for (let i = 0; i < this.canvasContexts.length; i++) {
        this.containerElement.removeChild(this.canvasContexts[i].canvas)
      }
      this.canvasContexts = []
    }
  }

  protected addDeleteHistory(annotation: Annotation) {
      let history = annotation.custom
      if (!history) {
        history = []
      }
      history.push({Type: '/Delete', D: createPdfTime(), T: this.options.author})
      annotation.custom = history
      if (annotation.popup) {
        annotation.popup.isOpen = false
      }
      this.store.annotations.updateAnnotation(annotation)
      this.pdfViewerApi.updateItem(annotation)
  }
}
