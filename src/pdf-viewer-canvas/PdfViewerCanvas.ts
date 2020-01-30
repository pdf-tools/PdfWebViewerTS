import { createStore, ViewerCanvasStore } from './state/store'
import {
  PdfViewerApi, PdfFitMode, PdfPageLayoutMode, Point, Annotation,
  Rect, OutlineItem, PdfDestination, SearchResultType, PdfItemType, LinkAnnotation, PdfActionType, DeletedItem, PdfItemCategory, PdfItem, PdfItemsOnPage,
} from '../pdf-viewer-api'
import ResizeObserver from 'resize-observer-polyfill'
import { PdfViewerCanvasOptions, PdfViewerCanvasDefaultOptions } from './PdfViewerCanvasOptions'
import { translations } from './translations'
import { translationManager } from '../common/TranslationManager'
import { CanvasEvents, CanvasPointerEvent, CanvasPointerPinchEvent } from './CanvasEvents'
import { ViewLayerBase } from './view-layers/ViewLayerBase'
import { PdfDocumentLayer } from './view-layers/PdfDocumentLayer'
import { ScrollLayer } from './view-layers/ScrollLayer'
import { BusyStateLayer } from './view-layers/BusyStateLayer'
import { AnnotationSelectionLayer } from './view-layers/AnnotationSelectionLayer'
import { TextSelectionLayer } from './view-layers/TextSelectionLayer'
import { ViewerMode, CursorStyle, copyTextToClipboard } from './state/viewer'
import { CanvasModuleClass, CanvasModule } from '../modules/CanvasModule'

/** @internal */
declare var __VERSION__: 'dev'

interface ViewLayerBaseClass {
  new(): ViewLayerBase
}

export interface PdfViewerCanvasEventMap {
  firstVisiblePage: number
  lastVisiblePage: number
  zoom: number
  rotation: number
  fitMode: PdfFitMode
  pageLayoutMode: PdfPageLayoutMode
  busyState: boolean
  appLoaded: boolean
  pageChanged: number
  error: Error
  itemSelected: PdfItem
  itemDeselected: PdfItem
  itemCreated: PdfItem
  itemUpdated: PdfItem
  itemDeleted: DeletedItem
}

export type PdfViewerCanvasEventListener = <K extends keyof PdfViewerCanvasEventMap>(e: PdfViewerCanvasEventMap[K]) => void
export type PdfViewerCanvasEventTypes = keyof PdfViewerCanvasEventMap

export class PdfViewerCanvas {

  public viewLayersElement: HTMLElement
  private element: HTMLElement
  private annotationbarElement: HTMLElement | undefined
  private toolbarElement: HTMLElement

  private options: PdfViewerCanvasOptions
  private viewLayers: ViewLayerBase[]
  private modules: CanvasModule[]
  private pdfViewerApi: PdfViewerApi
  private eventListeners = new Map<PdfViewerCanvasEventTypes, PdfViewerCanvasEventListener[]>()
  private resizeObserver: ResizeObserver
  private canvasEvents: CanvasEvents
  private documentLoaded = false
  private renderLoopRunning = false
  private store: ViewerCanvasStore
  private annotTimer: number

  constructor(containerElement: HTMLElement | null, license: string, options?: Partial<PdfViewerCanvasOptions>) {

    if (!containerElement) {
      throw { error: 'PdfViewerCanvas container element is null' }
    }
    this.options = { ...PdfViewerCanvasDefaultOptions, ...options }

    this.annotTimer = 0

    translationManager.setLanguage(this.options.language || 'en')
    translationManager.addTranslations(translations)

    // bind events
    this.onResize = this.onResize.bind(this)
    this.startRenderLoop = this.startRenderLoop.bind(this)
    this.updateViewLayerContext = this.updateViewLayerContext.bind(this)
    this.onKeyboardShortcuts = this.onKeyboardShortcuts.bind(this)
    this.externalLinkHandler = this.externalLinkHandler.bind(this)
    this.dispatchEvent = this.dispatchEvent.bind(this)

    this.onCanvasPointerDown = this.onCanvasPointerDown.bind(this)
    this.onCanvasPointerMove = this.onCanvasPointerMove.bind(this)
    this.onCanvasPointerUp = this.onCanvasPointerUp.bind(this)
    this.onCanvasPointerClick = this.onCanvasPointerClick.bind(this)
    this.onCanvasPointerDblClick = this.onCanvasPointerDblClick.bind(this)
    this.onCanvasPointerLongPress = this.onCanvasPointerLongPress.bind(this)
    this.onCanvasPointerStartDrag = this.onCanvasPointerStartDrag.bind(this)
    this.onCanvasPointerEndDrag = this.onCanvasPointerEndDrag.bind(this)
    this.onCanvasPointerPinch = this.onCanvasPointerPinch.bind(this)
    this.onMouseWheel = this.onMouseWheel.bind(this)
    this.onDocumentOpened = this.onDocumentOpened.bind(this)
    this.onDocumentClosed = this.onDocumentClosed.bind(this)
    this.onCanvasInvalidated = this.onCanvasInvalidated.bind(this)
    this.onFirstVisiblePageChanged = this.onFirstVisiblePageChanged.bind(this)
    this.onLastVisiblePageChanged = this.onLastVisiblePageChanged.bind(this)
    this.onZoomChanged = this.onZoomChanged.bind(this)
    this.onFitModeChanged = this.onFitModeChanged.bind(this)
    this.onPageLayoutModeChanged = this.onPageLayoutModeChanged.bind(this)
    this.onBusyStateChanged = this.onBusyStateChanged.bind(this)
    this.onRotationChanged = this.onRotationChanged.bind(this)
    this.onItemCreated = this.onItemCreated.bind(this)
    this.onItemUpdated = this.onItemUpdated.bind(this)
    this.onItemDeleted = this.onItemDeleted.bind(this)
    this.onPageChanged = this.onPageChanged.bind(this)
    this.onApiError = this.onApiError.bind(this)
    this.beforeUnloadCallback = this.beforeUnloadCallback.bind(this)
    this.getAnnotations = this.getAnnotations.bind(this)
    this.openRoutine = this.openRoutine.bind(this)

    // create elements
    this.element = containerElement
    this.element.classList.add('pwv-viewercanvas')
    switch (this.options.annotationBarPosition) {
      case 'top':
        this.element.classList.add('pwv-annotationbar-top')
        break
      case 'left':
        this.element.classList.add('pwv-annotationbar-left')
        break
      case 'right':
        this.element.classList.add('pwv-annotationbar-right')
        break
      case 'bottom':
        this.element.classList.add('pwv-annotationbar-bottom')
        break
    }

    if (this.options.modules && this.options.modules.length > 0) {
      this.annotationbarElement = document.createElement('div')
      this.annotationbarElement.classList.add('pwv-annotationbar')
      this.element.appendChild(this.annotationbarElement)
    }

    const viewerContainer = document.createElement('div')
    viewerContainer.classList.add('pwv-canvas-container')
    this.element.appendChild(viewerContainer)

    this.toolbarElement = document.createElement('div')
    this.toolbarElement.classList.add('pwv-canvas-toolbar')
    viewerContainer.appendChild(this.toolbarElement)

    const canvasLayers = document.createElement('div')
    canvasLayers.classList.add('pwv-canvas-layers')
    viewerContainer.appendChild(canvasLayers)

    this.viewLayersElement = document.createElement('div')
    canvasLayers.appendChild(this.viewLayersElement)
    viewerContainer.appendChild(canvasLayers)

    // create store
    this.store = createStore()
    // create api
    this.pdfViewerApi = new PdfViewerApi()

    // view layers
    this.viewLayers = []
    const viewLayers = [
      PdfDocumentLayer,
      BusyStateLayer,
      AnnotationSelectionLayer,
      TextSelectionLayer,
      ScrollLayer,
    ]
    this.registerViewLayers(viewLayers)

    // register canvas modules
    this.modules = []
    if (this.options.modules) {
      this.registerModules(this.options.modules)
    }

    // events
    this.resizeObserver = new ResizeObserver(this.onResize)
    this.resizeObserver.observe(canvasLayers)

    this.pdfViewerApi.addEventListener('firstVisiblePage', this.onFirstVisiblePageChanged)
    this.pdfViewerApi.addEventListener('lastVisiblePage', this.onLastVisiblePageChanged)
    this.pdfViewerApi.addEventListener('zoom', this.onZoomChanged)
    this.pdfViewerApi.addEventListener('fitMode', this.onFitModeChanged)
    this.pdfViewerApi.addEventListener('pageLayoutMode', this.onPageLayoutModeChanged)
    this.pdfViewerApi.addEventListener('busyState', this.onBusyStateChanged)
    this.pdfViewerApi.addEventListener('canvasInvalidated', this.onCanvasInvalidated)
    this.pdfViewerApi.addEventListener('itemCreated', this.onItemCreated)
    this.pdfViewerApi.addEventListener('itemUpdated', this.onItemUpdated)
    this.pdfViewerApi.addEventListener('itemDeleted', this.onItemDeleted)
    this.pdfViewerApi.addEventListener('pageChanged', this.onPageChanged)
    this.pdfViewerApi.addEventListener('rotation', this.onRotationChanged)
    this.pdfViewerApi.addEventListener('error', this.onApiError)

    if (this.options.promptOnUnsavedChanges) {
      window.addEventListener('beforeunload', this.beforeUnloadCallback)
    }

    this.canvasEvents = new CanvasEvents(canvasLayers)
    this.canvasEvents.suspend()
    this.canvasEvents.addEventListener('pointerdown', this.onCanvasPointerDown)
    this.canvasEvents.addEventListener('pointermove', this.onCanvasPointerMove)
    this.canvasEvents.addEventListener('pointerup', this.onCanvasPointerUp)
    this.canvasEvents.addEventListener('pointerclick', this.onCanvasPointerClick)
    this.canvasEvents.addEventListener('pointerdblclick', this.onCanvasPointerDblClick)
    this.canvasEvents.addEventListener('pointerlongpress', this.onCanvasPointerLongPress)
    this.canvasEvents.addEventListener('pointerstartdrag', this.onCanvasPointerStartDrag)
    this.canvasEvents.addEventListener('pointerenddrag', this.onCanvasPointerEndDrag)
    this.canvasEvents.addEventListener('pinch', this.onCanvasPointerPinch)

    this.viewLayersElement.addEventListener('wheel', this.onMouseWheel, {passive: false})
    document.addEventListener('keydown', this.onKeyboardShortcuts, {passive: false})

    this.pdfViewerApi.setLicenseKey(license)
      .then(() => {
        this.dispatchEvent('appLoaded', true)
      })
      .catch(error => {
        this.dispatchEvent('error', new Error('Invalid License'))
      })
  }

  public open(buffer: Uint8Array, password?: string) {
    return this.pdfViewerApi.open(buffer, password)
  }

  public openFDF(pdfBuffer: Uint8Array, fdfBuffer: Uint8Array, password?: string) {
    return this.pdfViewerApi.openFDF(pdfBuffer, fdfBuffer, password)
  }

  public openUri(pdfUri: string, password?: string, pdfAuthorization?: string) {
    return this.openRoutine(this.pdfViewerApi.openUri, pdfUri, password, pdfAuthorization)
  }

  public openFDFUri(pdfUri: string, fdfUri: string, password?: string, pdfAuthorization?: string, fdfAuthorization?: string) {
    return this.openRoutine(this.pdfViewerApi.openFDFUri, pdfUri, fdfUri, password, pdfAuthorization, fdfAuthorization)
  }

  public openBlob(blob: Blob, password?: string) {
    return this.openRoutine(this.pdfViewerApi.openBlob, blob, password)
  }

  public openFDFBlob(pdfBlob: Blob, fdfBlob: Blob, password?: string) {
    return this.openRoutine(this.pdfViewerApi.openFDFBlob, pdfBlob, fdfBlob, password)
  }

  public saveFile(asFdf: boolean) {
    return this.pdfViewerApi.saveFile(asFdf)
  }

  public close() {
    this.onDocumentClosed()
    return this.pdfViewerApi.close()
  }

  public hasChanges() {
    return this.pdfViewerApi.hasChanges()
  }

  public getProductVersion(): string {
    return __VERSION__
  }

  public getZoom() {
    return this.pdfViewerApi.getZoom()
  }

  public setZoom(zoom: number, location?: Point) {
    this.pdfViewerApi.setZoom(zoom, location)
  }

  public zoomIn(location?: Point) {
    const zoom = this.pdfViewerApi.getZoom()
    this.pdfViewerApi.setZoom(zoom * 1.1, location)
  }

  public zoomOut(location?: Point) {
    const zoom = this.pdfViewerApi.getZoom()
    this.pdfViewerApi.setZoom(zoom * 0.9, location)
  }

  public getPageCount() {
    return this.pdfViewerApi.getPageCount()
  }

  public getPageNumber() {
    return this.pdfViewerApi.getPageNumber()
  }

  public setPageNumber(page: number) {
    if (page < 1) {
      page = 1
    } else {
      const pageCount = this.pdfViewerApi.getPageCount()
      if (page > pageCount) {
        page = pageCount
      }
    }
    this.pdfViewerApi.setPageNumber(page)
    this.dispatchEvent('firstVisiblePage', page)
  }

  public scrollDown(distance = 100) {
    const pos = this.pdfViewerApi.getScrollPosition()
    pos.y += distance * window.devicePixelRatio
    this.pdfViewerApi.setScrollPosition(pos)
  }

  public scrollUp(distance = 100) {
    const pos = this.pdfViewerApi.getScrollPosition()
    pos.y -= distance * window.devicePixelRatio
    this.pdfViewerApi.setScrollPosition(pos)
  }

  public scrollLeft(distance = 100) {
    const pos = this.pdfViewerApi.getScrollPosition()
    pos.x -= distance * window.devicePixelRatio
    this.pdfViewerApi.setScrollPosition(pos)
  }

  public scrollRight(distance = 100) {
    const pos = this.pdfViewerApi.getScrollPosition()
    pos.x += distance * window.devicePixelRatio
    this.pdfViewerApi.setScrollPosition(pos)
  }

  public scrollMove(distanceVertical = 0, distanceHorizontal = 0) {
    const pos = this.pdfViewerApi.getScrollPosition()
    pos.y += distanceVertical * window.devicePixelRatio
    pos.x += distanceHorizontal * window.devicePixelRatio
    this.pdfViewerApi.setScrollPosition(pos)
  }

  public nextPage() {
    const page = this.pdfViewerApi.getPageNumber()
    const layout = this.pdfViewerApi.getPageLayoutMode()
    const pageCount = this.pdfViewerApi.getPageCount()
    if (page < pageCount) {
      if (this.twoPageLayoutMode(layout)) {
        this.pdfViewerApi.setPageNumber(page + 2)
      } else {
        this.pdfViewerApi.setPageNumber(page + 1)
      }
    }
  }

  public previousPage() {
    const page = this.pdfViewerApi.getPageNumber()
    if (page > 1) {
      this.pdfViewerApi.setPageNumber(page - 1)
    }
  }

  public getFitMode() {
    return this.pdfViewerApi.getFitMode()
  }

  public setFitMode(fitMode: number) {
    this.pdfViewerApi.setFitMode(fitMode)
  }

  public getPageLayoutMode() {
    return this.pdfViewerApi.getPageLayoutMode()
  }

  public setPageLayoutMode(pageLayoutMode: number) {
    this.pdfViewerApi.setPageLayoutMode(pageLayoutMode)
  }

  public getRotation(): number {
    return this.pdfViewerApi.getRotation()
  }

  public setRotation(rotation: number) {
    this.pdfViewerApi.setRotation(rotation)
  }

  public renderPage(pageNumber: number, width: number, height: number) {
    return this.pdfViewerApi.renderPage(pageNumber, width, height)
  }

  public getDocumentOutline() {
    return this.getOutlines(null)
  }

  public goTo(pdfDestination: PdfDestination) {
    this.pdfViewerApi.goTo(pdfDestination)
  }

  public startSearch(searchString: string, caseSensitive: boolean, wrapSearch: boolean, useRegex: boolean) {
    this.store.search.start({
      searchString,
      reverse: false,
      caseSensitive,
      wrapSearch,
      useRegex,
    })
    this.doSearch(false)
  }

  public nextSearchMatch() {
    this.doSearch(false)
  }

  public previousSearchMatch() {
    this.doSearch(true)
  }

  public endSearch() {
    this.store.search.clear()
    this.store.canvas.setCanvasInvalidated(true)
  }

  public resetViewerMode() {
    this.store.viewer.setDefaultMode()
  }

  public getAnnotationsFromPage(page: number): Promise<PdfItemsOnPage> {
    const promise = this.pdfViewerApi.getItemsFromPage(page, PdfItemCategory.ANNOTATION)
    if (this.store.getState().annotations.byPage[page] === undefined) {
      promise.then( itemsOnPage => {
        this.store.annotations.setPageAnnotations(itemsOnPage)
      })
    }
    return promise
  }

  public goToAnnotation(annotation: Annotation, action?: 'select' | 'edit' | 'popup' | 'history') {
    const dest: any = {destinationType: 0, page: 0, left: null, top: null, bottom: null, right: null, zoom: null}
    dest.destinationType = 8
    dest.top = annotation.pdfRect.pdfY
    dest.left = annotation.pdfRect.pdfX
    dest.page = annotation.pdfRect.page
    this.pdfViewerApi.goToViewerDestination(dest)

    if (action === 'select') {
      this.dispatchEvent('itemSelected', annotation)
    }
  }

  public addEventListener<K extends keyof PdfViewerCanvasEventMap>(type: K, listener: (e: PdfViewerCanvasEventMap[K]) => void) {
    if (this.eventListeners.has(type)) {
      (this.eventListeners.get(type) as PdfViewerCanvasEventListener[]).push(listener)
    } else {
      this.eventListeners.set(type, [listener])
    }
  }

  public removeEventListener<K extends keyof PdfViewerCanvasEventMap>(type: K, listener: (e: PdfViewerCanvasEventMap[K]) => void) {
    if (this.eventListeners.has(type)) {
      let listeners = this.eventListeners.get(type) as PdfViewerCanvasEventListener[]
      listeners = listeners.filter(listenerInArray => listenerInArray !== listener)
      if (listeners.length !== 0) {
        this.eventListeners.set(type, listeners)
      } else {
        this.eventListeners.delete(type)
      }
    }
  }

  private dispatchEvent<K extends keyof PdfViewerCanvasEventMap>(type: K, args: PdfViewerCanvasEventMap[K]) {
    if (this.eventListeners.has(type)) {
      const listeners = this.eventListeners.get(type) as PdfViewerCanvasEventListener[]
      listeners.forEach(listener => listener(args))
    }
  }

  private async getOutlines(parent: OutlineItem | null) {
    const outlineItems = await this.pdfViewerApi.getOutlines(parent)
    for (const item of outlineItems) {
      if (item.hasDescendants) {
        const children = await this.getOutlines(item);
        (item as any).descendants = children
      }
    }
    return outlineItems
  }

  private openRoutine(openFunction: (...args: any[]) => Promise<void>, ...args: any[]) {
    return new Promise((resolve, reject) => {
      if (this.pdfViewerApi.isOpen()) {
        this.close().then(() => {
          openFunction(...args).then(() => {
            this.onDocumentOpened()
            resolve()
          }).catch(error => {
            if (error.message === 'The authentication failed due to a wrong password.') {
              reject(new Error('password required'))
            } else {
              reject(new Error('unsupported file'))
            }
          })
        })
      } else {
        openFunction(...args).then(() => {
          this.onDocumentOpened()
          resolve()
        }).catch(error => {
          if (error.message === 'The authentication failed due to a wrong password.') {
            reject(new Error('password required'))
          } else {
            reject(new Error('unsupported file'))
          }
        })
      }
    })
  }

  private doSearch(reverse: boolean) {
    const s = this.store.getState().search
    const index = reverse ? s.index - 1 : s.index

    this.pdfViewerApi.search(s.searchString, s.page, index, reverse, s.caseSensitive, s.wrapSearch, s.useRegex)
      .then(result => {

        if (result.type === SearchResultType.OK) {

          let page = 1
          result.list.forEach(rect => {
            if (rect.page > page) {
              page = rect.page
            }
          })
          this.store.search.updateMatch({
            index: result.index,
            match: result.list,
            page,
          })
        } else if (result.type === SearchResultType.END) {
          // do nothing
        } else {
          this.endSearch()
        }
      })
      .catch(error => {
        console.error(error)
      })
  }

  private onDocumentOpened() {
    this.documentLoaded = true
    this.element.classList.add('pwv-viewercanvas-document-loaded')

    // set canvas size
    const containerRect = this.viewLayersElement.getBoundingClientRect()
    this.store.canvas.resize({
      cssWidth: containerRect.width,
      cssHeight: containerRect.height,
    })

    this.startRenderLoop()
    const document = this.store.getState().document
    this.getAnnotations(document.firstVisiblePage, document.lastVisiblePage)

    window.setTimeout(() => {
      this.canvasEvents.resume()
    }, 100)
  }

  private onDocumentClosed() {
    this.canvasEvents.suspend()
    this.documentLoaded = false
    this.element.classList.remove('pwv-viewercanvas-document-loaded')
    this.stopRenderLoop()
    this.store.loadDefaultState()
  }

  private startRenderLoop() {
    const viewLayers = this.viewLayers
    const modules = this.modules
    const loop = (timestamp: number) => {
      const state = this.store.getState()
      if (this.renderLoopRunning) {

        this.store.resetChangedState()
        if (this.viewLayersElement.style.cursor !== state.viewer.cursorStyle) {
          this.viewLayersElement.style.cursor = state.viewer.cursorStyle
        }

        for (let i = 0; i < viewLayers.length; i++) {
          const res = viewLayers[i].render(timestamp, state)
          if (res === false) {
            break
          }
        }

        for (let i = 0; i < modules.length; i++) {
          modules[i].render(timestamp, state)
        }

        requestAnimationFrame(loop)
      }
    }
    this.renderLoopRunning = true
    requestAnimationFrame(loop)
  }

  private stopRenderLoop() {
    this.renderLoopRunning = false
  }

  private registerViewLayers(viewLayers: ViewLayerBaseClass[]) {
    viewLayers.forEach(viewLayerBaseClass => {
      const viewLayer = new viewLayerBaseClass()
      viewLayer.register(this, this.dispatchEvent)
      this.viewLayers.push(viewLayer)
    })
  }

  private registerModules(modules: CanvasModuleClass[]) {
    modules.forEach(module => {
      const m = new module()
      this.modules.push(m)
      const reg = m.register(this.viewLayersElement, this.store, this.pdfViewerApi, this.options)
      if (this.annotationbarElement && reg.annotationbar) {
        this.annotationbarElement.appendChild(reg.annotationbar)
      }
      if (reg.toolbar) {
        this.toolbarElement.appendChild(reg.toolbar)
      }
      if (reg.contextbar) {
        this.store.viewer.addContextBarItem(reg.contextbar)
      }
    })
  }

  private updateViewLayerContext() {
    const pixelRatio = window.devicePixelRatio
    this.store.canvas.setPixelRatio(pixelRatio)

    const rect = this.viewLayersElement.getBoundingClientRect()

    const maxScroll = this.pdfViewerApi.getScrollMaxPosition()
    const scrollPosition = this.pdfViewerApi.getScrollPosition()

    const devicePixelsWidth = (rect.width * pixelRatio) + ((maxScroll.x_max > 0) ? maxScroll.x_max : scrollPosition.x * 2)
    const devicePixelsHeight = (rect.height * pixelRatio) + ((maxScroll.y_max > 0) ? maxScroll.y_max : scrollPosition.y * 2)

    const zoom = this.pdfViewerApi.getZoom()
    this.store.document.resize({ zoom, devicePixelsHeight, devicePixelsWidth })
    this.store.scroll.scrollChanged({ cssLeft: scrollPosition.x, cssTop: scrollPosition.y })

    const state = this.store.getState()
    const pageRects: { [key: number]: Rect } = {}
    for (let page = state.document.firstVisiblePage; page <= state.document.lastVisiblePage; page++) {
      pageRects[page] = this.pdfViewerApi.getPageScreenRect(page)
    }
    this.store.document.updatePageRects(pageRects)
  }

  private onMouseWheel(e: WheelEvent) {
    if (e.deltaY !== 0) {
      if (e.ctrlKey) {
        e.preventDefault()
        e.cancelBubble = true
        const containerRect = this.viewLayersElement.getBoundingClientRect()
        const x = e.clientX - containerRect.left
        const y = e.clientY - containerRect.top
        if (e.deltaY < 0) {
          this.zoomIn({ x, y })
        } else {
          this.zoomOut({ x, y })
        }
      } else if (e.shiftKey) {
        e.preventDefault()
        e.cancelBubble = true
        const distance = e.deltaY > 0 ? 100 : -100
        this.scrollRight(distance)
      } else {
        e.preventDefault()
        e.cancelBubble = true
        const distance = e.deltaY > 0 ? 100 : -100
        this.scrollDown(distance)
      }
    } else if (e.deltaX > 0) {
      this.scrollRight()
    } else if (e.deltaX < 0) {
      this.scrollLeft()
    } else if (e.deltaZ < 0) {
      this.zoomIn()
    } else if (e.deltaZ > 0) {
      this.zoomOut()
    }
  }

  private twoPageLayoutMode(layoutMode: PdfPageLayoutMode) {
    return layoutMode === PdfPageLayoutMode.TWO_COLUMN_LEFT ||
           layoutMode === PdfPageLayoutMode.TWO_COLUMN_RIGHT ||
           layoutMode === PdfPageLayoutMode.TWO_PAGE_LEFT ||
           layoutMode === PdfPageLayoutMode.TWO_PAGE_RIGHT
  }

  private transformPointer(e: CanvasPointerEvent) {
    const containerRect = this.viewLayersElement.getBoundingClientRect()
    const x = e.clientX - containerRect.left
    const y = e.clientY - containerRect.top

    return {
      cssX: x,
      cssY: y,
      isDown: e.buttons === 1,
      type: e.type,
    }
  }

  private onCanvasPointerClick(e: CanvasPointerEvent) {
    const p = this.transformPointer(e)
    this.externalLinkHandler(p.cssX, p.cssY)
    this.store.pointer.update(p)
    this.store.pointer.setAction('click')
  }

  private onCanvasPointerDblClick(e: CanvasPointerEvent) {
    const p = this.transformPointer(e)
    this.store.pointer.update(p)
    this.store.pointer.setAction('dblclick')
  }

  private onCanvasPointerLongPress(e: CanvasPointerEvent) {
    const p = this.transformPointer(e)
    this.store.pointer.update(p)
    this.store.pointer.setAction('longpress')
  }

  private onCanvasPointerStartDrag(e: CanvasPointerEvent) {
    this.store.pointer.setAction('startdrag')
  }

  private onCanvasPointerEndDrag(e: CanvasPointerEvent) {
    this.store.pointer.setAction('enddrag')
  }

  private onCanvasPointerPinch(e: CanvasPointerPinchEvent) {
    const containerRect = this.viewLayersElement.getBoundingClientRect()
    const x = (e.clientX - containerRect.left) * devicePixelRatio
    const y = (e.clientY - containerRect.top) * devicePixelRatio

    const zoom = this.pdfViewerApi.getZoom()
    const zoomDistance = (e.movementDistance / 200 * zoom)
    const newZoom = zoom + zoomDistance
    this.setZoom(newZoom, { x, y })
  }

  private onCanvasPointerDown(e: CanvasPointerEvent) {
    const p = this.transformPointer(e)
    this.store.pointer.update(p)
    this.store.startPointer.update(p)
  }

  private onCanvasPointerUp(e: CanvasPointerEvent) {
    const p = this.transformPointer(e)
    this.store.pointer.update(p)
  }

  private onCanvasPointerMove(e: CanvasPointerEvent) {
    if (e.buttons < 2) {
      const p = this.transformPointer(e)
      this.store.pointer.update(p)
    } else if (e.buttons === 4) {
      this.scrollMove(e.movementY * -1, e.movementX * -1)
      this.store.viewer.setCursorStyle(CursorStyle.GRABBING)
    }
  }

  private externalLinkHandler(cssX: number, cssY: number) {
    const state = this.store.getState()
    if (state.viewer.mode === ViewerMode.DEFAULT) {
      const pdfPoint = this.pdfViewerApi.transformScreenPointToPdfPoint({
        x: cssX * window.devicePixelRatio,
        y: cssY * window.devicePixelRatio,
      })
      if (pdfPoint.isOnPage) {
        const annotation = this.pdfViewerApi.getAnnotationOnPoint(pdfPoint.pdfPoint, false)
        if (annotation !== null && annotation.itemType === PdfItemType.LINK) {
          const link = (annotation as any) as LinkAnnotation
          if (link.uri && link.actionType === PdfActionType.URI) {
            window.open(link.uri)
          }
        }
      }
    }
  }

  private onKeyboardShortcuts(e: KeyboardEvent) {
    if (e.key === '+') {
      e.preventDefault()
      this.zoomIn()
    } else if (e.key === '-') {
      e.preventDefault()
      this.zoomOut()
    } else if (e.key === 'PageDown') {
      e.preventDefault()
      this.nextPage()
    } else if (e.key === 'PageUp') {
      e.preventDefault()
      this.previousPage()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      this.scrollDown()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      this.scrollUp()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      this.scrollLeft()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      this.scrollRight()
    } else if (e.key === 'Home') {
      e.preventDefault()
      this.setPageNumber(1)
    } else if (e.key === 'End') {
      e.preventDefault()
      this.setPageNumber(this.getPageCount())
    } else if (e.key === 'Escape') {
      const viewerMode = this.store.getState().viewer.mode
      if (viewerMode === ViewerMode.TEXT_SELECTED) {
        e.preventDefault()
        e.cancelBubble = true
        this.store.viewer.setTextSelection(null)
      } else if (viewerMode === ViewerMode.ANNOTATION_SELECTED) {
        e.preventDefault()
        e.cancelBubble = true
        this.store.viewer.deselectAnnotation()
      }
    } else if (e.ctrlKey === true && e.key === 'c') {
      // copy selected text
      const state = this.store.getState()
      if (state.viewer.mode === ViewerMode.TEXT_SELECTED) {
        e.preventDefault()
        e.cancelBubble = true
        const selection = state.viewer.textSelection
        if (selection && selection.length > 0) {
          const text = this.pdfViewerApi.getTextFromSelection(selection)
          copyTextToClipboard(text)
        }
      }
    }
  }

  private onResize(entries: ResizeObserverEntry[], observer: ResizeObserver) {
    const containerRect = this.viewLayersElement.getBoundingClientRect()
    if (containerRect.width === 0 || containerRect.height === 0) {
      return
    }
    this.updateCanvasSize()
  }

  private updateCanvasSize() {
    const containerRect = this.viewLayersElement.getBoundingClientRect()
    const pixelRatio = window.devicePixelRatio

    this.viewLayers.forEach(viewLayer => {
      viewLayer.resize(containerRect.width, containerRect.height, pixelRatio)
    })

    this.modules.forEach(module => {
      module.resize(containerRect.width, containerRect.height)
    })

    this.store.canvas.resize({
      cssWidth: containerRect.width,
      cssHeight: containerRect.height,
    })

    this.store.canvas.setCanvasInvalidated(true)
  }

  private onCanvasInvalidated() {
    this.store.canvas.setCanvasInvalidated(true)
    this.updateViewLayerContext()
  }

  private onFirstVisiblePageChanged(page: number) {
    this.store.document.fistVisiblePageChanged(page)
    this.maybeGetAnnotations(this.store.getState().document.firstVisiblePage, this.store.getState().document.lastVisiblePage)
    this.dispatchEvent('firstVisiblePage', page)
  }

  /**
   * This function works with a timer. This avoids mass loading of annotation when scrolling
   * through a large document. It only loads the annotations once the viewport is stable (visible
   * pages didn't change for 100ms). If there is an active timer that will be cancelled.
   * @param begin first page to get annotations from
   * @param end last page to get annotations from
   */
  private maybeGetAnnotations(begin: number, end: number) {
    if (this.annotTimer) {
      window.clearTimeout(this.annotTimer)
    }
    this.annotTimer = window.setTimeout( () => { this.getAnnotations(begin, end) }, 100)
  }

  private getAnnotations(begin: number, end: number) {
    for (let page = begin; page <= end; page++) {
      if (this.store.getState().annotations.byPage[page] === undefined) {
        this.pdfViewerApi.getItemsFromPage(page, PdfItemCategory.ANNOTATION)
          .then( itemsOnPage => {
            this.store.annotations.setPageAnnotations(itemsOnPage)
          })
      }
    }
  }

  private onLastVisiblePageChanged(page: number) {
    this.store.document.lastVisiblePageChanged(page)
    this.maybeGetAnnotations(this.store.getState().document.firstVisiblePage, this.store.getState().document.lastVisiblePage)
    this.dispatchEvent('lastVisiblePage', page)
  }

  private onZoomChanged(zoom: number) {
    this.dispatchEvent('zoom', zoom)
  }

  private onFitModeChanged(fitMode: PdfFitMode) {
    this.dispatchEvent('fitMode', fitMode)
  }

  private onPageLayoutModeChanged(layoutMode: PdfPageLayoutMode) {
    this.dispatchEvent('pageLayoutMode', layoutMode)
  }

  private onBusyStateChanged(state: boolean) {
    this.store.document.busyStateChanged(state)
    this.dispatchEvent('busyState', state)
  }

  private onRotationChanged(rotation: number) {
    this.store.document.rotationChanged(rotation)
    this.dispatchEvent('rotation', rotation)
  }

  private onItemCreated(item: PdfItem) {
    if (item.itemCategory === PdfItemCategory.ANNOTATION) {
      this.store.annotations.addAnnotation(item as Annotation)
    }
    this.dispatchEvent('itemCreated', item)
  }

  private onItemUpdated(item: PdfItem) {
    if (item.itemCategory === PdfItemCategory.ANNOTATION) {
      this.store.annotations.updateAnnotation(item as Annotation)
    }
    this.dispatchEvent('itemUpdated', item)
  }

  private onItemDeleted(deletedItem: DeletedItem) {
    if (deletedItem.categoryType === PdfItemCategory.ANNOTATION) {
      this.store.annotations.deleteAnnotation(deletedItem.id)
    }
    this.dispatchEvent('itemDeleted', deletedItem)
  }

  private onPageChanged(pageNumber: number) {
    this.dispatchEvent('pageChanged', pageNumber)
  }

  private onApiError(error: Error) {
    console.error('//// PdfViewerApi Error: ', error)
    this.dispatchEvent('error', error)
  }

  private beforeUnloadCallback(e: BeforeUnloadEvent) {
    if (this.pdfViewerApi.hasChanges()) {
      e.preventDefault()
      e.returnValue = ''
    } else {
      return
    }
  }

}
