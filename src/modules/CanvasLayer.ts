import { ViewerCanvasState, ViewerCanvasStore } from '../pdf-viewer-canvas/state/store'
import { PdfViewerApi } from '../pdf-viewer-api'
import { Annotation, PdfItem } from '../pdf-viewer-api/types'
import { PdfViewerOptions } from '../pdf-viewer-canvas/PdfViewerCanvasOptions'
import { CanvasModule } from './CanvasModule'
import { addHistoryEntry } from '../custom/history'

export interface CanvasLayerClass {
  new(module: CanvasModule, name: string, containerElement: HTMLElement, store: ViewerCanvasStore,
      pdfApi: PdfViewerApi, options: PdfViewerOptions): CanvasLayer
}

export abstract class CanvasLayer {

  protected containerElement: HTMLElement
  protected store: ViewerCanvasStore
  protected pdfApi: PdfViewerApi
  protected options: PdfViewerOptions
  protected module: CanvasModule
  private canvasContexts: CanvasRenderingContext2D[] = []
  private htmlLayers: HTMLElement[] = []
  private name: string

  constructor(module: CanvasModule, name: string, containerElement: HTMLElement,
              store: ViewerCanvasStore, pdfApi: PdfViewerApi, options: PdfViewerOptions) {
    this.containerElement = containerElement
    this.store = store
    this.pdfApi = pdfApi
    this.options = options
    this.module = module
    this.name = name

    this.remove = this.remove.bind(this)
    this.canEdit = this.canEdit.bind(this)
    this.onAnnotationCreated = this.onAnnotationCreated.bind(this)
  }

  public abstract onCreate(args?: any): void
  public abstract onRemove(): void
  public abstract render(timestamp: number, state: ViewerCanvasState): void
  public abstract onSave(): Promise<void>

  public resize(width: number, height: number): void {

    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = width * devicePixelRatio
    tempCanvas.height = height * devicePixelRatio
    const tempContext = tempCanvas.getContext('2d') as CanvasRenderingContext2D

    this.canvasContexts.forEach(ctx => {
      tempContext.drawImage(ctx.canvas, 0, 0)
      ctx.canvas.style.width = width + 'px'
      ctx.canvas.style.height = height + 'px'
      ctx.canvas.width = width * devicePixelRatio
      ctx.canvas.height = height * devicePixelRatio
      ctx.drawImage(tempContext.canvas, 0, 0)
    })
  }

  protected remove() {
    this.module.removeCanvasLayer(this.name)
  }

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
      context.canvas.style.width = rect.width + 'px'
      context.canvas.style.height = rect.height + 'px'
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

  protected onAnnotationCreated(annotation: Annotation): Promise<PdfItem> | undefined {
    if (this.options.ms_custom) {
      addHistoryEntry(annotation, 'create', this.options.author)
      return this.pdfApi.updateItem(annotation)
    }
  }

  protected canEdit(author: string) {
    if (this.options.ms_custom) {
        return this.options.author === author
      }
    return true
  }
}
