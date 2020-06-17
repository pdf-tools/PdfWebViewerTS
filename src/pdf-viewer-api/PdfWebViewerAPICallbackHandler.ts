import { PdfFitMode, PdfPageLayoutMode } from './enums'
import { Annotation, OutlineItem, StampInfo, PdfItemsOnPage, PdfItem, PageImage, SearchResult, DeletedItem } from './types'

export class PdfWebViewerAPICallbackHandler {
  public openResolve: null | (() => void) = null
  public openReject: null | ((error: Error) => void) = null
  public closeResolve: null | (() => void) = null
  public closeReject: null | ((error: Error) => void) = null
  public saveResolve: null | ((buffer: Uint8Array) => void) = null
  public saveReject: null | ((error: Error) => void) = null
  public GetAnnotationsFromPagePromiseQueue: Array<{
    resolve: (itemsOnPage: PdfItemsOnPage) => void
    reject: (error: Error) => void
  }>
  public GetTextFragmentsFromPagePromiseQueue: Array<{
    resolve: (itemsOnPage: PdfItemsOnPage) => void
    reject: (error: Error) => void
  }>
  public GetContentElementsFromPagePromiseQueue: Array<{
    resolve: (contentElementsOnPage: PdfItemsOnPage) => void
    reject: (error: Error) => void
  }>
  public CreateItemPromiseQueue: Array<{
    resolve: (item: PdfItem) => void
    reject: (error: Error) => void
  }>
  public UpdateItemPromiseQueue: Array<{
    resolve: (item: PdfItem) => void
    reject: (error: Error) => void
  }>
  public DeleteItemPromiseQueue: Array<{
    resolve: () => void
    reject: (error: Error) => void
  }>
  public RenderPagePromiseQueue: Array<{
    resolve: (thumbnail: PageImage) => void
    reject: (error: Error) => void
  }>
  public GetStampInfoPromiseQueue: Array<{
    resolve: (stampInfo: StampInfo) => void
    reject: (error: Error) => void
  }>
  public GetOutlinesPromiseQueue: {
    [id: number]: {
      resolve: (outlines: OutlineItem[]) => void
      reject: (error: Error) => void
    }
  }
  public RegisterStampImagePromiseQueue: Array<{
    resolve: (id: number) => void,
    reject: (error: Error) => void,
  }>

  public searchResolve: null | ((searchResult: SearchResult) => void) = null
  public searchReject: null | ((error: Error) => void) = null
  public licenseResolve: null | (() => void) = null
  public licenseReject: null | ((error: Error) => void) = null
  public busyStateChanged: null | ((isBusy: boolean) => void) = null
  public error: null | ((error: Error) => void) = null
  public canvasInvalidated: null | (() => void) = null
  public zoomCompleted: null | ((zoom: number) => void) = null
  public fitModeChanged: null | ((mode: PdfFitMode) => void) = null
  public pageLayoutModeChanged: null | ((mode: PdfPageLayoutMode) => void) = null
  public rotationChanged: null | ((rotation: number) => void) = null
  public firstVisiblePageChanged: null | ((page: number) => void) = null
  public lastVisiblePageChanged: null | ((page: number) => void) = null
  public itemCreated: null | ((item: PdfItem) => void) = null
  public itemUpdated: null | ((item: PdfItem) => void) = null
  public itemDeleted: null | ((item: DeletedItem) => void) = null
  public pageChanged: null | ((pageNumber: number) => void) = null
  public outlinesLoaded: null | ((outlines: OutlineItem[]) => void) = null

  private firstVisiblePage = 0
  private lastVisiblePage = 0

  constructor() {
    this.onOpenCompleted = this.onOpenCompleted.bind(this)
    this.onCloseCompleted = this.onCloseCompleted.bind(this)
    this.onSaveCompleted = this.onSaveCompleted.bind(this)
    this.onGetAnnotationsFromPageCompleted = this.onGetAnnotationsFromPageCompleted.bind(this)
    this.onGetTextFragmentsFromPageCompleted = this.onGetTextFragmentsFromPageCompleted.bind(this)
    this.onGetContentElementsFromPageCompleted = this.onGetContentElementsFromPageCompleted.bind(this)
    this.onItemCreated = this.onItemCreated.bind(this)
    this.onItemUpdated = this.onItemUpdated.bind(this)
    this.onItemDeleted = this.onItemDeleted.bind(this)
    this.onPageRendered = this.onPageRendered.bind(this)
    this.onGetStampInfoCompleted = this.onGetStampInfoCompleted.bind(this)
    this.onSearchCompleted = this.onSearchCompleted.bind(this)
    this.onLicenseEvaluated = this.onLicenseEvaluated.bind(this)
    this.onBusyStateChanged = this.onBusyStateChanged.bind(this)
    this.onError = this.onError.bind(this)
    this.onCanvasInvalidated = this.onCanvasInvalidated.bind(this)
    this.onZoomCompleted = this.onZoomCompleted.bind(this)
    this.onFitModeChanged = this.onFitModeChanged.bind(this)
    this.onPageLayoutMode = this.onPageLayoutMode.bind(this)
    this.onRotationChanged = this.onRotationChanged.bind(this)
    this.onVisiblePageRangeChanged = this.onVisiblePageRangeChanged.bind(this)
    this.onPageChanged = this.onPageChanged.bind(this)
    this.onOutlinesLoaded = this.onOutlinesLoaded.bind(this)
    this.onStampImageRegistered = this.onStampImageRegistered.bind(this)

    this.GetAnnotationsFromPagePromiseQueue = []
    this.GetTextFragmentsFromPagePromiseQueue = []
    this.GetContentElementsFromPagePromiseQueue = []
    this.CreateItemPromiseQueue = []
    this.UpdateItemPromiseQueue = []
    this.DeleteItemPromiseQueue = []
    this.RenderPagePromiseQueue = []
    this.GetStampInfoPromiseQueue = []
    this.GetOutlinesPromiseQueue = []
    this.RegisterStampImagePromiseQueue = []
  }

  public onOpenCompleted(message: string) {
    if (!message) {
      this.openResolve && this.openResolve()
    } else {
      this.openReject && this.openReject(new Error(message))
    }
    this.openResolve = null
    this.openReject = null
  }

  public onCloseCompleted(message: string) {
    if (!message) {
      this.closeResolve && this.closeResolve()
    } else {
      this.closeReject && this.closeReject(new Error(message))
    }
    this.closeResolve = null
    this.closeReject = null
    this.firstVisiblePage = 0
    this.lastVisiblePage = 0
  }

  public onSaveCompleted(message: string, buffer: Uint8Array) {
    if (!message) {
      this.saveResolve && this.saveResolve(buffer)
    } else {
      this.saveReject && this.saveReject(new Error(message))
    }
    this.saveResolve = null
    this.saveReject = null
  }

  public onGetAnnotationsFromPageCompleted(result: any) {
    const promiseCallback = this.GetAnnotationsFromPagePromiseQueue.shift()
    if (!result.ok) {
      promiseCallback && promiseCallback.reject(new Error(result.message))
    } else {
      promiseCallback && promiseCallback.resolve(result.value)
    }
  }

  public onGetTextFragmentsFromPageCompleted(result: any) {
    const promiseCallback = this.GetTextFragmentsFromPagePromiseQueue.shift()
    if (!result.ok) {
      promiseCallback && promiseCallback.reject(new Error(result.message))
    } else {
      promiseCallback && promiseCallback.resolve(result.value)
    }
  }

  public onGetContentElementsFromPageCompleted(result: any) {
    const promiseCallback = this.GetContentElementsFromPagePromiseQueue.shift()
    if (!result.ok) {
      promiseCallback && promiseCallback.reject(new Error(result.message))
    } else {
      promiseCallback && promiseCallback.resolve(result.value)
    }
  }

  public onItemCreated(result: any) {
    const promiseCallback = this.CreateItemPromiseQueue.shift()
    if (!result.ok) {
      promiseCallback && promiseCallback.reject(new Error(result.message))
    } else {
      promiseCallback && promiseCallback.resolve(result.value)
      this.itemCreated && this.itemCreated(result.value)
    }
  }

  public onItemUpdated(result: any) {
    const promiseCallback = this.UpdateItemPromiseQueue.shift()
    if (!result.ok) {
      promiseCallback && promiseCallback.reject(new Error(result.message))
    } else {
      promiseCallback && promiseCallback.resolve(result.value)
      this.itemUpdated && this.itemUpdated(result.value)
    }
  }

  public onItemDeleted(result: any) {
    const promiseCallback = this.DeleteItemPromiseQueue.shift()
    if (!result.ok) {
      promiseCallback && promiseCallback.reject(new Error(result.message))
    } else {
      promiseCallback && promiseCallback.resolve()
      this.itemDeleted && this.itemDeleted(result.value)
    }
  }

  public onPageRendered(result: any) {
    const promiseCallback = this.RenderPagePromiseQueue[result.id]
    delete this.RenderPagePromiseQueue[result.id]
    if (!result.ok) {
      promiseCallback && promiseCallback.reject(new Error(result.message))
    } else {
      promiseCallback && promiseCallback.resolve(result.value)
    }
  }

  public onGetStampInfoCompleted(result: any) {
    const promiseCallback = this.GetStampInfoPromiseQueue.shift()
    if (!result.ok) {
      promiseCallback && promiseCallback.reject(new Error(result.message))
    } else {
      promiseCallback && promiseCallback.resolve(result.value)
    }
  }

  public onStampImageRegistered(result: any) {
    const promiseCallback = this.RegisterStampImagePromiseQueue.shift()
    if (!result.ok) {
      promiseCallback && promiseCallback.reject(new Error(result.message))
    } else {
      promiseCallback && promiseCallback.resolve(result.value)
    }
  }

  public onSearchCompleted(result: any) {
    if (this.searchReject === null) {
      return
    }
    if (!result.ok) {
      this.searchReject(new Error(result.message))
    } else {
      this.searchResolve && this.searchResolve(result.value)
    }
    this.searchReject = null
    this.searchResolve = null
  }

  public onLicenseEvaluated(reason: string) {
    if (reason === '') {
      this.licenseResolve && this.licenseResolve()
    } else {
      this.licenseReject && this.licenseReject(new Error(reason))
    }
    this.licenseResolve = null
    this.licenseReject = null
  }

  public onBusyStateChanged(isBusy: boolean) {
    this.busyStateChanged && this.busyStateChanged(isBusy)
  }

  public onError(error: any) {
    this.error && this.error(new Error(error.message))
  }

  public onCanvasInvalidated() {
    this.canvasInvalidated && this.canvasInvalidated()
  }

  public onZoomCompleted(zoomFactor: number) {
    this.zoomCompleted && this.zoomCompleted(zoomFactor)
  }

  public onFitModeChanged(mode: PdfFitMode) {
    this.fitModeChanged && this.fitModeChanged(mode)
  }

  public onPageLayoutMode(mode: PdfPageLayoutMode) {
    this.pageLayoutModeChanged && this.pageLayoutModeChanged(mode)
  }

  public onRotationChanged(rotation: number) {
    this.rotationChanged && this.rotationChanged(rotation)
  }

  public onVisiblePageRangeChanged(firstPage: number, lastPage: number) {
    this.firstVisiblePage = firstPage
    this.firstVisiblePageChanged && this.firstVisiblePageChanged(firstPage)

    this.lastVisiblePage = lastPage
    this.lastVisiblePageChanged && this.lastVisiblePageChanged(lastPage)
  }

  public onPageChanged(pageNumber: number) {
    this.pageChanged && this.pageChanged(pageNumber)
  }

  public onOutlinesLoaded(result: any) {
    const promiseCallback = this.GetOutlinesPromiseQueue[result.id]
    delete this.GetOutlinesPromiseQueue[result.id]
    if (!result.ok) {
      promiseCallback && promiseCallback.reject(new Error(result.message))
    } else {
      promiseCallback && promiseCallback.resolve(result.value)
    }
  }
}
