import { app } from 'hyperapp'
import ResizeObserver from 'resize-observer-polyfill'
import { PdfWebViewerOptions, pdfWebViewerDefaultOptions } from './PdfWebViewerOptions'
import { App } from './views/App'
import { createState, actions, RootState, ActionDefinitions } from './state/index'
import { PdfViewerCanvas } from '../pdf-viewer-canvas/PdfViewerCanvas'
import { translations } from './translations'
import { translationManager } from '../common/TranslationManager'
import { OutlineNavigationItem } from './state/navigationPanel'
import { PdfDestination, PdfFitMode, PdfPageLayoutMode } from '../pdf-viewer-api'
import { PopupModule } from '../modules/popup/PopupModule'
import { MobilePopupModule } from '../modules/mobile-popup/MobilePopupModule'
import { OptionsToVerify, PdfViewerCanvasOptions, ColorPaletteMap } from '../pdf-viewer-canvas/PdfViewerCanvasOptions'

/** @internal */
declare var gwt: Promise<void>

/** @internal */
declare var __VERSION__: 'dev'

/** @internal */
declare global {
  interface Window {
    onGwtReady: any
  }
}

/** @internal */
const breakPoints = {
  xs: {
    width: 0,
    className: 'pwv-screen-xs',
  },
  sm: {
    width: 660,
    className: 'pwv-screen-sm',
  },
  md: {
    width: 768,
    className: 'pwv-screen-md',
  },
  lg: {
    width: 1000,
    className: 'pwv-screen-lg',
  },
  xl: {
    width: 1400,
    className: 'pwv-screen-xl',
  },
}

/** @internal */
export interface PdfWebViewerActions extends ActionDefinitions {
  api: {
    openFile(openFile: { file: File, password?: string }): void,
    openFDF(openFDF: { pdfFile: File, fdfFile: File, password?: string}): void,
    downloadFile(): Promise<void>,
    close(): Promise<void>,
    hasChanges(): void,
    setZoom(zoom: number): void,
    zoomIn(): void,
    zoomOut(): void,
    setPageNumber(page: number): void,
    nextPage(): void,
    previousPage(): void,
    setFitMode(fitMode: number): void,
    goTo(pdfDestination: PdfDestination): void,
    setPageLayoutMode(layoutMode: number): void,
    rotate(): void,
    setRotation(rotation: number): void,
    resetViewerMode(): void,
    startSearch(): void,
    nextSearchMatch(): void,
    previousSearchMatch(): void,
    endSearch(): void,
    loadNavigationItems(): void,
    addPageRangeToThumbnailsQueue(pageRange: {from: number, to: number}): void,
  }
}

export interface PdfWebViewerEventMap {
  busyState: boolean
  appLoaded: boolean
  documentLoaded: File
  error: Error
}

export type PdfWebViewerEventListener = <K extends keyof PdfWebViewerEventMap>(e: PdfWebViewerEventMap[K]) => void
export type PdfWebViewerEventTypes = keyof PdfWebViewerEventMap

/** @internal */
export interface PdfWebViewerState extends RootState {
}

export class PdfWebViewer {

  private visiblePageRange = {
    firstPage: 0,
    lastPage: 0,
  }
  private eventListeners = new Map<PdfWebViewerEventTypes, PdfWebViewerEventListener[]>()
  private options: PdfWebViewerOptions
  private element: HTMLElement
  private view: PdfWebViewerActions
  private resizeObserver: ResizeObserver
  private layoutBreakPoint: string
  private viewerCanvas: PdfViewerCanvas | undefined
  private licenseKey: string
  private loadThumbnailsQueue: number[] = []
  private thumbnailsInQueue: number[] = []
  private loadPageThumbnailsTimer: number | null = null

  constructor(containerElement: Element | null, license: string, options?: Partial<PdfWebViewerOptions>) {
    if (!containerElement) {
      throw { error: 'PdfWebViewer container element is null' }
    }

    this.handleKeyboardShortcuts = this.handleKeyboardShortcuts.bind(this)
    this.handleResize = this.handleResize.bind(this)
    this.createView = this.createView.bind(this)
    this.loadPageThumbnails = this.loadPageThumbnails.bind(this)
    this.loadDocumentOutlines = this.loadDocumentOutlines.bind(this)
    this.handleAppLoaded = this.handleAppLoaded.bind(this)

    this.handleDocumentOpened = this.handleDocumentOpened.bind(this)
    this.handleDocumentClosed = this.handleDocumentClosed.bind(this)

    this.handleFirstVisiblePageChanged = this.handleFirstVisiblePageChanged.bind(this)
    this.handleLastVisiblePageChanged = this.handleLastVisiblePageChanged.bind(this)
    this.handleZoomChanged = this.handleZoomChanged.bind(this)
    this.handleFitModeChanged = this.handleFitModeChanged.bind(this)
    this.handlePageLayoutModeChanged = this.handlePageLayoutModeChanged.bind(this)
    this.handleBusyStateChanged = this.handleBusyStateChanged.bind(this)
    this.handlePageChanged = this.handlePageChanged.bind(this)
    this.handleError = this.handleError.bind(this)
    this.addPagesToThumbnailsQueue = this.addPagesToThumbnailsQueue.bind(this)

    const deviceType = Math.min(window.screen.availHeight, window.screen.availWidth) < 570 ? 'mobile' : 'desktop'
    this.options = { ...pdfWebViewerDefaultOptions, ...options }
    if (options) {
      this.verifyOptions(options, this.options)
    }
    if (this.options.modules && deviceType === 'mobile') {
      this.options.modules = this.options.modules.filter(m => m !== PopupModule)
      this.options.modules.unshift(MobilePopupModule)
    }

    this.licenseKey = license
    this.element = containerElement as HTMLElement

    const initialState = createState(this.options)
    initialState.layout.deviceType = deviceType

    this.options.annotationBarPosition = deviceType === 'mobile' ? 'top' : 'left'

    translationManager.setLanguage(this.options.language || 'en')
    translationManager.addTranslations(translations)

    this.view = this.createView<RootState, PdfWebViewerActions>(app)(initialState, actions, App, this.element)

    this.layoutBreakPoint = ''

    document.addEventListener('keydown', this.handleKeyboardShortcuts, false)
    this.resizeObserver = new ResizeObserver(this.handleResize)
    this.resizeObserver.observe(this.element)
  }

  public openFile(file: File, password?: string) {
    if (this.view) {
      this.view.api.openFile({ file, password})
    }
  }

  public openFDF(pdfFile: File, fdfFile: File, password?: string) {
    if (this.view) {
      this.view.api.openFDF({ pdfFile, fdfFile, password})
    }
  }

  public saveFile(asFdf: boolean) {
    return (this.viewerCanvas) ?
      this.viewerCanvas.saveFile(asFdf) :
      null
  }

  public downloadFile() {
    if (this.view) {
      return this.view.api.downloadFile()
    }
  }

  public close() {
    if (this.view) {
      return this.view.api.close()
    }
  }

  public getPageCount() {
    return (this.viewerCanvas) ?
      this.viewerCanvas.getPageCount() :
      null
  }

  public setPageNumber(page: number) {
    if (this.view) {
      this.view.api.setPageNumber(page)
    }
  }

  public nextPage() {
    if (this.view) {
      this.view.api.nextPage()
    }
  }

  public previousPage() {
    if (this.view) {
      this.view.api.previousPage()
    }
  }

  public setZoom(zoom: number) {
    if (this.view) {
      this.view.api.setZoom(zoom)
    }
  }

  public setFitMode(mode: PdfFitMode) {
    if (this.view) {
      this.view.api.setFitMode(mode)
    }
  }

  public setPageLayoutMode(mode: PdfPageLayoutMode) {
    if (this.view) {
      this.view.api.setPageLayoutMode(mode)
    }
  }

  public setRotation(rotation: number) {
    if (this.view) {
      this.view.api.setRotation(rotation)
    }
  }

  public getProductVersion() {
    return __VERSION__
  }

  public addEventListener<K extends keyof PdfWebViewerEventMap>(type: K, listener: (e: PdfWebViewerEventMap[K]) => void) {
    if (this.eventListeners.has(type)) {
      (this.eventListeners.get(type) as PdfWebViewerEventListener[]).push(listener)
    } else {
      this.eventListeners.set(type, [listener])
    }
  }

  public removeEventListener<K extends keyof PdfWebViewerEventMap>(type: K, listener: (e: PdfWebViewerEventMap[K]) => void) {
    if (this.eventListeners.has(type)) {
      let listeners = this.eventListeners.get(type) as PdfWebViewerEventListener[]
      listeners = listeners.filter(listenerInArray => listenerInArray !== listener)
      if (listeners.length !== 0) {
        this.eventListeners.set(type, listeners)
      } else {
        this.eventListeners.delete(type)
      }
    }
  }

  private dispatchEvent<K extends keyof PdfWebViewerEventMap>(type: K, args: PdfWebViewerEventMap[K]) {
    if (this.eventListeners.has(type)) {
      const listeners = this.eventListeners.get(type) as PdfWebViewerEventListener[]
      listeners.forEach(listener => listener(args))
    }
  }

  private createView<S, A>(nextApp: any) {
    return (state: any, a: any, view: any, element: any): A => {
      a.createCanvasView = (elm: HTMLElement) => {
        Promise.all([gwt])
          .then(() => {
            this.viewerCanvas = new PdfViewerCanvas(elm, this.licenseKey, this.options)
            this.viewerCanvas.addEventListener('appLoaded', this.handleAppLoaded)
            this.viewerCanvas.addEventListener('firstVisiblePage', this.handleFirstVisiblePageChanged)
            this.viewerCanvas.addEventListener('lastVisiblePage', this.handleLastVisiblePageChanged)
            this.viewerCanvas.addEventListener('zoom', this.handleZoomChanged)
            this.viewerCanvas.addEventListener('fitMode', this.handleFitModeChanged)
            this.viewerCanvas.addEventListener('pageLayoutMode', this.handlePageLayoutModeChanged)
            this.viewerCanvas.addEventListener('busyState', this.handleBusyStateChanged)
            this.viewerCanvas.addEventListener('pageChanged', this.handlePageChanged)
            this.viewerCanvas.addEventListener('error', this.handleError)
          })
      }
      a.removeCanvasView = (elm: HTMLElement) => {
        if (this.viewerCanvas) {
          this.viewerCanvas.removeEventListener('firstVisiblePage', this.handleFirstVisiblePageChanged)
          this.viewerCanvas.removeEventListener('lastVisiblePage', this.handleLastVisiblePageChanged)
          this.viewerCanvas.removeEventListener('zoom', this.handleZoomChanged)
          this.viewerCanvas.removeEventListener('fitMode', this.handleFitModeChanged)
          this.viewerCanvas.removeEventListener('pageLayoutMode', this.handlePageLayoutModeChanged)
          this.viewerCanvas.removeEventListener('busyState', this.handleBusyStateChanged)
          this.viewerCanvas.removeEventListener('error', this.handleError)
          this.viewerCanvas = undefined
        }
      }
      a.api = {
        openFile: (x: { file: File, password?: string }) => {
          if (this.viewerCanvas) {
            const currentState = this.view.getState()
            const hasChanges = this.viewerCanvas.hasChanges()
            if (!currentState.unsavedChangesDialogDontSave && currentState.hasDocument && hasChanges) {
              this.view.showConfirmUnsavedChangesDialog(x.file)
              return
            }
            this.view.navigationPanel.clear()
            this.view.loadDocumentBegin()
            const reader = new FileReader()
            reader.onload = (e: any) => {
              if (this.viewerCanvas && e.target && e.target.result) {
                this.viewerCanvas.openBlob(new Blob([e.target.result]), x.password || '')
                  .then(() => {
                    if (this.viewerCanvas) {
                      this.view.pdfDocument.setFileInfo(x.file)
                      this.view.pdfDocument.setHasChanges(false)

                      const pageCount = this.viewerCanvas.getPageCount()
                      this.view.pdfDocument.setPageCount(pageCount)

                      this.handleDocumentOpened()
                      this.view.loadDocumentFulfilled()
                      this.dispatchEvent('documentLoaded', x.file)
                    }
                  })
                  .catch((error: Error) => {
                    if (error.message === 'password required') {
                      this.view.loadDocumentPasswordForm(x.file)
                    } else {
                      this.view.loadDocumentRejected(error.message)
                    }
                  })
              }
            }
            reader.readAsArrayBuffer(x.file)
          }
        },
        openFDF: (x: { pdfFile: File, fdfFile: File, password?: string }) => {
          const pdfPromise: Promise<Blob> = new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e: any) => {
              if (e.target && e.target.result) {
                resolve(new Blob([e.target.result]))
              } else {
                reject(new Error())
              }
            }
            reader.readAsArrayBuffer(x.pdfFile)
          })

          const fdfPromise: Promise<Blob> = new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e: any) => {
              if (e.target && e.target.result) {
                resolve(new Blob([e.target.result]))
              } else {
                reject(new Error())
              }
            }
            reader.readAsArrayBuffer(x.fdfFile)
          })

          Promise.all([pdfPromise, fdfPromise]).then(resultBlobs => {
            if (this.viewerCanvas) {
              this.viewerCanvas.openFDFBlob(resultBlobs[0], resultBlobs[1], x.password || '')
                .then(() => {
                  if (this.viewerCanvas) {
                    this.view.pdfDocument.setFileInfo(x.pdfFile)
                    this.view.pdfDocument.setHasChanges(false)

                    const pageCount = this.viewerCanvas.getPageCount()
                    this.view.pdfDocument.setPageCount(pageCount)

                    this.handleDocumentOpened()
                    this.view.loadDocumentFulfilled()
                    this.dispatchEvent('documentLoaded', x.pdfFile)
                  }
                })
                .catch((error: Error) => {
                  if (error.message === 'password required') {
                    this.view.loadDocumentPasswordForm(x.pdfFile)
                  } else {
                    this.view.loadDocumentRejected(error.message)
                  }
                })
            }
          })
        },
        close: () => {
          return new Promise((resolve, reject) => {
            if (this.viewerCanvas) {
              const currentState = this.view.getState()
              const hasChanges = this.viewerCanvas.hasChanges()
              if (!currentState.unsavedChangesDialogDontSave && currentState.hasDocument && hasChanges) {
                this.view.showConfirmUnsavedChangesDialog(null)
                return
              }
              this.view.closeDocument()
              this.viewerCanvas.close().then( () => {
                resolve()
              })
            }
          })
        },
        downloadFile: () => {
          return new Promise((resolve, reject) => {
            if (this.viewerCanvas) {
              this.view.saveDocumentBegin()
              const viewState = this.view.getState()
              const filename = viewState.pdfDocument.filename
              const mimetype = viewState.pdfDocument.mimetype
              this.viewerCanvas.saveFile(/\/application\/.*fdf.*/.test(mimetype)).then(data => {
                const newBlob = new Blob([data], { type: mimetype })
                const dataUrl = window.URL.createObjectURL(newBlob)
                const link = document.createElement('a')
                link.style.position = 'absolute'
                link.style.left = '-1000px'
                link.href = dataUrl
                link.download = filename
                this.element.appendChild(link)
                link.click()
                setTimeout(() => {
                  this.element.removeChild(link)
                  window.URL.revokeObjectURL(dataUrl)
                  this.view.saveDocumentFulfilled()
                }, 100)
                resolve()
              }).catch(error => {
                console.error(error)
                this.view.saveDocumentRejected(error)
              })
            }
          })
        },
        hasChanges: () => {
          if (this.viewerCanvas) {
            this.viewerCanvas.hasChanges()
          }
        },
        setZoom: (zoom: number) => {
          if (this.viewerCanvas) {
            this.viewerCanvas.setZoom(zoom / 100)
          }
        },
        zoomIn: () => {
          if (this.viewerCanvas) {
            this.viewerCanvas.zoomIn()
          }
        },
        zoomOut: () => {
          if (this.viewerCanvas) {
            this.viewerCanvas.zoomOut()
          }
        },
        setPageNumber: (page: number) => {
          if (this.viewerCanvas) {
            this.viewerCanvas.setPageNumber(page)
          }
        },
        nextPage: () => {
          if (this.viewerCanvas) {
            this.viewerCanvas.nextPage()
          }
        },
        previousPage: () => {
          if (this.viewerCanvas) {
            this.viewerCanvas.previousPage()
          }
        },
        setFitMode: (fitMode: number) => {
          if (this.viewerCanvas) {
            this.viewerCanvas.setFitMode(fitMode)
          }
        },
        setPageLayoutMode: (layoutMode: number) => {
          if (this.viewerCanvas) {
            this.viewerCanvas.setPageLayoutMode(layoutMode)
          }
        },
        rotate: () => {
          if (this.viewerCanvas) {
            const r = this.viewerCanvas.getRotation()
            const rotation = r >= 270 ? 0 : r + 90
            this.viewerCanvas.setRotation(rotation)
          }
        },
        setRotation: (rotation: number) => {
          if (this.viewerCanvas) {
            this.viewerCanvas.setRotation(rotation)
          }
        },
        startSearch: () => {
          if (this.viewerCanvas) {
            const s = this.view.getState().search
            this.viewerCanvas.startSearch(s.searchString, s.caseSensitive, s.wrapSearch, s.useRegex)
          }
        },
        nextSearchMatch: () => {
          if (this.viewerCanvas) {
            this.viewerCanvas.nextSearchMatch()
          }
        },
        previousSearchMatch: () => {
          if (this.viewerCanvas) {
            this.viewerCanvas.previousSearchMatch()
          }
        },
        endSearch: () => {
          if (this.viewerCanvas) {
            this.viewerCanvas.endSearch()
          }
        },
        goTo: (pdfDestination: PdfDestination) => {
          if (this.viewerCanvas) {
            this.viewerCanvas.goTo(pdfDestination)
          }
        },
        resetViewerMode: (pdfDestination: PdfDestination) => {
          if (this.viewerCanvas) {
            this.viewerCanvas.resetViewerMode()
          }
        },
        loadNavigationItems: () => {
          this.loadPageThumbnails()
          const viewState = this.view.getState()
          if (!viewState.navigationPanel.outlineItemsLoaded) {
            this.loadDocumentOutlines()
          }
        },
        addPageRangeToThumbnailsQueue: (pageRange: {from: number, to: number}) => {
          this.addPagesToThumbnailsQueue(pageRange.from, pageRange.to)
        },
      }
      return nextApp(state, a, view, element)
    }
  }

  private handleResize(entries: ResizeObserverEntry[], observer: ResizeObserver) {
    const containerWidth = this.element.getBoundingClientRect().width
    const setBreakPoint = (className: string) => {
      if (this.layoutBreakPoint !== className) {
        this.view.layout.setBreakPoint(className)
        this.layoutBreakPoint = className
      }
    }
    if (containerWidth > breakPoints.xl.width) {
      setBreakPoint(breakPoints.xl.className)
    } else if (containerWidth > breakPoints.lg.width) {
      setBreakPoint(breakPoints.lg.className)
    } else if (containerWidth > breakPoints.md.width) {
      setBreakPoint(breakPoints.md.className)
    } else if (containerWidth > breakPoints.sm.width) {
      setBreakPoint(breakPoints.sm.className)
    } else {
      setBreakPoint(breakPoints.xs.className)
    }
  }

  private handleKeyboardShortcuts(e: KeyboardEvent) {
    if (e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
      if (e.keyCode === 70) {
        e.preventDefault()
      }
    }
  }

  private handleDocumentOpened() {
    if (this.viewerCanvas) {
      const pageCount = this.viewerCanvas.getPageCount()
      this.view.navigationPanel.setThumbnailPlaceholders(pageCount)
      const viewerState = this.view.getState()
      if (viewerState.navigationPanel.showNavigation) {
        if (viewerState.navigationPanel.selectedNavigation === 'pages') {
          this.loadPageThumbnails()
        } else {
          this.loadDocumentOutlines()
        }
      }
    }
  }

  private loadDocumentOutlines() {
    if (this.viewerCanvas) {
      this.viewerCanvas.getDocumentOutline()
        .then(outlines => {
          this.view.navigationPanel.setOutlines(outlines as OutlineNavigationItem[])
        })
    }
  }

  private loadPageThumbnails() {
    if (this.viewerCanvas) {
      const state = this.view.getState()
      const fromPage = state.pdfDocument.firstVisiblePage - 5
      const toPage = state.pdfDocument.lastVisiblePage + 5

      this.addPagesToThumbnailsQueue(fromPage, toPage)
    }
  }

  private addPagesToThumbnailsQueue(fromPage: number, toPage: number) {
    if (this.viewerCanvas) {
      const state = this.view.getState()

      if (fromPage < 1) {
        fromPage = 1
      }
      if (toPage < fromPage) {
        toPage = state.pdfDocument.firstVisiblePage + 5
      }
      if (toPage > state.pdfDocument.pageCount) {
        toPage = state.pdfDocument.pageCount
      }

      const pagesToLoad = state.navigationPanel.pages
        .filter(p => p.pageNumber >= fromPage && p.pageNumber <= toPage && p.thumbnail === null)
        .map(p => p.pageNumber)

      this.loadThumbnailsQueue = pagesToLoad
        .filter(p => this.thumbnailsInQueue.indexOf(p) < 0)

      const getPageThumbnail = (pageNumber: number) => {
        this.updatePageThumbnail(pageNumber)
        .then(() => {
          const nextPage = this.loadThumbnailsQueue.shift()
          if (nextPage) {
            getPageThumbnail(nextPage)
          }
        })
      }
      const firstPage = this.loadThumbnailsQueue.shift()
      if (firstPage) {
        getPageThumbnail(firstPage)
      }
    }
  }

  private updatePageThumbnail(pageNumber: number) {
    this.thumbnailsInQueue.push(pageNumber)
    return new Promise<void>((resolve, reject) => {
      if (this.viewerCanvas) {
        this.viewerCanvas.renderPage(pageNumber, 200, 200)
          .then(thumbnail => {
            const index = this.thumbnailsInQueue.indexOf(thumbnail.page)
            if (index > -1) {
              this.thumbnailsInQueue.splice(index, 1)
            }
            const canvasElement = document.createElement('canvas')
            canvasElement.width = thumbnail.imageData.width
            canvasElement.height = thumbnail.imageData.height
            const ctx = canvasElement.getContext('2d')
            ctx && ctx.putImageData(thumbnail.imageData, 0, 0)
            const imageData = canvasElement.toDataURL('image/png')
            this.view.navigationPanel.updateThumbnail({
              pageNumber: thumbnail.page,
              thumbnail: imageData,
            })
            resolve()
          })
          .catch(error => reject(error))
      } else {
        reject()
      }
    })
  }

  private handleDocumentClosed() {
    return
  }

  private handleAppLoaded(loaded: boolean) {
    this.view.initializeAppFulfilled()
    this.dispatchEvent('appLoaded', loaded)
  }

  private handleFirstVisiblePageChanged(page: number) {
    this.visiblePageRange.firstPage = page
    this.updateVisiblePageRange()
    this.view.pdfDocument.setFirstVisiblePage(page)
  }

  private handleLastVisiblePageChanged(page: number) {
    this.visiblePageRange.lastPage = page
    this.updateVisiblePageRange()
    this.view.pdfDocument.setLastVisiblePage(page)
  }

  private updateVisiblePageRange() {
    const state = this.view.getState()
    if (state.navigationPanel.showNavigation && state.navigationPanel.selectedNavigation === 'pages') {
      if (this.loadPageThumbnailsTimer) {
        window.clearTimeout(this.loadPageThumbnailsTimer)
      }
      this.loadPageThumbnailsTimer = window.setTimeout(() => {
        this.loadPageThumbnailsTimer = null
        this.loadPageThumbnails()
      }, 100)
    }
  }

  private handleZoomChanged(zoom: number) {
    this.view.pdfDocument.setZoom(zoom * 100)
  }

  private handleFitModeChanged(fitMode: number) {
    this.view.pdfDocument.setFitMode(fitMode)
  }

  private handlePageLayoutModeChanged(layoutMode: number) {
    this.view.pdfDocument.setPageLayoutMode(layoutMode)
  }

  private handleBusyStateChanged(state: boolean) {
    this.dispatchEvent('busyState', state)
  }

  private handlePageChanged(pageNumber: number) {
    // the list is 0 index based. E.g. page 1 is at index 0
    const pageNavigationItem = this.view.getState().navigationPanel.pages[pageNumber - 1]
    if (pageNavigationItem && pageNavigationItem.thumbnail !== null) {
      this.updatePageThumbnail(pageNumber)
    }
  }

  private verifyOptions(clientOptions: Partial<PdfWebViewerOptions>, defaultOptions: PdfViewerCanvasOptions) {
    Object.keys(OptionsToVerify).forEach( k => {
        if (clientOptions[k]) {
          if (!this.isContainedInArray( clientOptions[k], defaultOptions[OptionsToVerify[k]])) {
            throw new Error(`Invalid ${k}: ${defaultOptions[k]} has not been found in ${OptionsToVerify[k]}.\n` +
                            `Valid values are: ${defaultOptions[OptionsToVerify[k]]}`)
          }
        }
    })

    Object.keys(ColorPaletteMap).forEach( k => {
      if (clientOptions[k] && !clientOptions[ColorPaletteMap[k]]) {
        throw new Error(`Cannot set ${k} without setting ${ColorPaletteMap[k]}. Preset ${ColorPaletteMap[k]} might not be in ${k}`)
      }
    })
  }

  private isContainedInArray<T>(item: T, list: T[]) {
    if (!list.find(el => el === item)) {
      return false
    }
    return true
  }

  private handleError(error: Error) {
    this.view.setError(error.message)
    this.dispatchEvent('error', error)
  }

}
