import { ViewerCanvasStore, ViewerCanvasState } from '../pdf-viewer-canvas/state/store'
import { PdfViewerApi, PdfItemType } from '../pdf-viewer-api'
import { PdfViewerCanvas } from '../pdf-viewer-canvas/PdfViewerCanvas'
import { CanvasLayer, CanvasLayerClass } from './CanvasLayer'
import { PdfViewerOptions } from '../pdf-viewer-canvas/PdfViewerCanvasOptions'
import { IconDefinition } from '../common/Icon'

export interface CanvasModuleRegistration {
  annotationbar?: HTMLElement
  toolbar?: HTMLElement
  contextbar?: {
    itemTypes: PdfItemType[]
    icon: IconDefinition
    onCmd(args?: any): void
  }
}

export interface CanvasModuleClass {
  new (): CanvasModule
}

export interface CanvasLayerList {
  [name: string]: CanvasLayer
}

export abstract class CanvasModule {
  protected canvasLayers: CanvasLayerList = {}
  protected store: ViewerCanvasStore | null = null
  protected pdfApi: PdfViewerApi | null = null
  protected pdfViewerCanvas: PdfViewerCanvas | null = null
  protected options: PdfViewerOptions | null = null
  public name: string | null = null
  private containerElement: HTMLElement | null = null

  constructor() {
    this.createCanvasLayer = this.createCanvasLayer.bind(this)
    this.removeCanvasLayer = this.removeCanvasLayer.bind(this)
  }

  public register(
    containerElement: HTMLElement,
    store: ViewerCanvasStore,
    pdfApi: PdfViewerApi,
    pdfViewerCanvas: PdfViewerCanvas,
    options: PdfViewerOptions,
  ): CanvasModuleRegistration {
    this.containerElement = containerElement
    this.store = store
    this.pdfApi = pdfApi
    this.pdfViewerCanvas = pdfViewerCanvas
    this.options = options

    return this.onRegister()
  }

  public abstract onRegister(): CanvasModuleRegistration
  public abstract activate(args?: any): void

  public render(timestamp: number, state: ViewerCanvasState) {
    const keys = Object.keys(this.canvasLayers)
    for (let i = 0; i < keys.length; i++) {
      this.canvasLayers[keys[i]].render(timestamp, state)
    }
  }

  public resize(width: number, height: number) {
    const keys = Object.keys(this.canvasLayers)
    for (let i = 0; i < keys.length; i++) {
      this.canvasLayers[keys[i]].resize(width, height)
    }
  }

  public getCanvasSize() {
    const rect = {
      width: 0,
      height: 0,
    }
    if (this.containerElement !== null) {
      const clientRect = this.containerElement.getBoundingClientRect()
      rect.width = clientRect.width
      rect.height = clientRect.height
    }
    return rect
  }

  public onSave() {
    const promise = new Promise<void>((resolve, reject) => {
      const keys = Object.keys(this.canvasLayers)
      const promises = []
      for (let i = 0; i < keys.length; i++) {
        promises.push(this.canvasLayers[keys[i]].onSave())
      }
      Promise.all(promises)
        .then(() => {
          resolve()
        })
        .catch((error: any) => {
          reject('OnSave failed on a canvas layer: ' + error)
        })
    })
    return promise
  }

  public createCanvasLayer(name: string, canvasLayer: CanvasLayerClass, args?: any) {
    if (this.containerElement && this.store && this.pdfApi && this.pdfViewerCanvas && this.options) {
      if (this.canvasLayers[name]) {
        throw new Error('duplicate canvas layer name')
      }
      const layer = new canvasLayer(this, name, this.containerElement, this.store, this.pdfApi, this.pdfViewerCanvas, this.options)
      this.canvasLayers[name] = layer
      layer.onCreate(args)
    } else {
      throw new Error('canvas layer is not registered')
    }
  }

  public removeCanvasLayer(name: string) {
    if (this.canvasLayers[name]) {
      this.canvasLayers[name].onRemove()
      delete this.canvasLayers[name]
    }
  }
}
