import { PdfItem, ScrollPosition, MaxScrollPosition, PageImage, PdfItemsOnPage,
  PdfDestination, Point, SearchResult, Rect, PdfRect, StampInfo, PdfPoint, TextFragment, TextSelectionRect, DeletedItem } from './types'
import { PdfPageLayoutMode, PdfItemCategory, PdfFitMode } from './enums'
import { PdfWebViewerAPICallbackHandler } from './PdfWebViewerAPICallbackHandler'
import { Annotation, ScreenPointToPdfPointResult, AnnotationArgs, OutlineItem, StampInfoArgs } from './types'

const script = document.createElement('script')
script.src = (window as any).PDFTOOLS_WEBVIEWER_BASEURL + '/pdfwebviewer/pdfwebviewer.nocache.js'
if (document.head) {
  document.head.appendChild(script as Node)
}

declare var window: any
window.gwt = new Promise((resolve, reject) => {
  if (window.onGwtReady === undefined) {
    window.onGwtReady = resolve
  } else {
    resolve()
  }
})

const checkType = (object: any, typeName: string, methodName: string, optional: boolean = false) => {
  if (!optional && (object === null || typeof (object) !== typeName)) {
    throw new TypeError(`Method ${methodName} requires argument of type '${typeName}' but is '${typeof (object)}'`)
  } else {
    return
  }
}

declare var PdfToolsApi: any

export interface PdfViewerApiEventMap {
  firstVisiblePage: number
  lastVisiblePage: number
  rotation: number
  zoom: number
  fitMode: PdfFitMode
  pageLayoutMode: PdfPageLayoutMode
  busyState: boolean
  unsavedChanges: boolean
  canvasInvalidated: boolean
  error: Error
  itemCreated: PdfItem
  itemUpdated: PdfItem
  itemDeleted: DeletedItem
  pageChanged: number
  outlinesLoaded: OutlineItem[]
}
export type PdfViewerApiEventListener = <K extends keyof PdfViewerApiEventMap>(e: PdfViewerApiEventMap[K]) => void
export type PdfViewerApiEventTypes = keyof PdfViewerApiEventMap

export class PdfViewerApi {
  private instance: any
  private apiCallbackHandler: PdfWebViewerAPICallbackHandler
  private eventListeners = new Map<PdfViewerApiEventTypes, PdfViewerApiEventListener[]>()

  constructor() {
    this.apiCallbackHandler = new PdfWebViewerAPICallbackHandler()
    this.apiCallbackHandler.busyStateChanged = isBusy => { this.dispatchEvent('busyState', isBusy) }
    this.apiCallbackHandler.canvasInvalidated = () => { this.dispatchEvent('canvasInvalidated', true) }
    this.apiCallbackHandler.error = error => { this.dispatchEvent('error', error) }
    this.apiCallbackHandler.fitModeChanged = mode => { this.dispatchEvent('fitMode', mode) }
    this.apiCallbackHandler.pageLayoutModeChanged = mode => { this.dispatchEvent('pageLayoutMode', mode) }
    this.apiCallbackHandler.rotationChanged = rotation => { this.dispatchEvent('rotation', rotation) }
    this.apiCallbackHandler.zoomCompleted = zoom => { this.dispatchEvent('zoom', zoom) }
    this.apiCallbackHandler.firstVisiblePageChanged = page => { this.dispatchEvent('firstVisiblePage', page) }
    this.apiCallbackHandler.lastVisiblePageChanged = page => { this.dispatchEvent('lastVisiblePage', page) }
    this.apiCallbackHandler.itemCreated = item => { this.dispatchEvent('itemCreated', item) }
    this.apiCallbackHandler.itemUpdated = item => { this.dispatchEvent('itemUpdated', item) }
    this.apiCallbackHandler.itemDeleted = itemId => { this.dispatchEvent('itemDeleted', itemId) }
    this.apiCallbackHandler.pageChanged = page => { this.dispatchEvent('pageChanged', page) }
    this.apiCallbackHandler.outlinesLoaded = outlinesItems => { this.dispatchEvent('outlinesLoaded', outlinesItems)}

    this.openBlob = this.openBlob.bind(this)
    this.openFDFBlob = this.openFDFBlob.bind(this)
    this.openUri = this.openUri.bind(this)
    this.openFDFUri = this.openFDFUri.bind(this)

    this.instance = new PdfToolsApi.PdfWebViewerAPI(this.apiCallbackHandler)

    /* iOS warns whenever an app uses resources too aggressively.
     * For Cordova this plugin redirects this warning as an event to the document.
     * When triggered flush the render cache.
     * https://www.npmjs.com/package/cordova-plugin-memory-warning
     */
    document.addEventListener('memorywarning', this.instance.forceFlushCache, {passive: false})
  }

  /**
   * Open a new PDF file.
   * NOTE: Any previously opened file must be closed first.
   * @param buffer            A buffer holding the PDF in memory.
   * @param password          The password needed to decrypt the PDF.
   * @returns                 A promise returning void if resolved or returning an error message if rejected.
   */
  public open(buffer: Uint8Array, password?: string) {
    checkType(buffer, 'object', 'open')
    checkType(password, 'string', 'open', true)
    return new Promise<void>((resolve, reject) => {
      this.apiCallbackHandler.openResolve = resolve
      this.apiCallbackHandler.openReject = reject
      this.instance.open(buffer, password)
    })
  }

  /**
   * Open a PDF file with an FDF file. The two files are opened to build a merged file
   * such that the annotations defined in the FDF file are then contained in the PDF file.
   * NOTE: Any previously opened file must be closed first.
   * @param pdfBuffer         A buffer holding the PDF in memory.
   * @param fdfBuffer         A buffer holding the FDF in memory.
   * @param password          The password needed to decrypt the PDF.
   * @returns                 A promise returning void if resolved or returning an error message if rejected.
   */
  public openFDF(pdfBuffer: Uint8Array, fdfBuffer: Uint8Array, password?: string) {
    checkType(pdfBuffer, 'object', 'openFDF')
    checkType(fdfBuffer, 'object', 'openFDF')
    checkType(password, 'string', 'openFDF', true)
    return new Promise<void>((resolve, reject) => {
      this.apiCallbackHandler.openResolve = resolve
      this.apiCallbackHandler.openReject = reject
      this.instance.openFDF(pdfBuffer, fdfBuffer, password)
    })
  }

  /**
   * Open a PDF file via URL.
   * NOTE: Any previously opened file must be closed first.
   * @param pdfUri           A URI string of the PDF
   * @param password         The password needed to decrypt the PDF
   * @returns                A promise returning void if resolved or returning an error message if rejected.
   */
  public openUri(pdfUri: string, password?: string, pdfAuthorization?: string) {
    checkType(pdfUri, 'string', 'openUri')
    checkType(password, 'string', 'openUri', true)
    checkType(pdfAuthorization, 'string', 'openUri', true)
    return new Promise<void>((resolve, reject) => {
      this.apiCallbackHandler.openResolve = resolve
      this.apiCallbackHandler.openReject = reject
      this.instance.openUri(pdfUri, password, pdfAuthorization)
    })
  }

  /**
   * Open a PDF with an FDF via URL.
   * NOTE: Any previously opened file must be closed first
   * @param pdfUri          A URI string of the PDF
   * @param fdfUri          A URI string of the FDF
   * @param password        The password needed to decrypt the PDF
   * @returns               A promise returning void if resolved or returning an error message if rejected.
   */
  public openFDFUri(pdfUri: string, fdfUri: string, password?: string, pdfAuthorization?: string, fdfAuthorization?: string) {
    checkType(pdfUri, 'string', 'openFDFUri')
    checkType(fdfUri, 'string', 'openFDFUri')
    checkType(password, 'string', 'openFDFUri', true)
    checkType(pdfAuthorization, 'string', 'openFDFUri', true)
    checkType(fdfAuthorization, 'string', 'openFDFUri', true)
    return new Promise<void>((resolve, reject) => {
      this.apiCallbackHandler.openResolve = resolve
      this.apiCallbackHandler.openReject = reject
      this.instance.openFDFUri(pdfUri, fdfUri, password, pdfAuthorization, fdfAuthorization)
    })
  }

  /**
   * Open a PDF file from a blob.
   * NOTE: Any previously opened file must be closed first.
   * @param blob              The blob of the file.
   * @param password          The password needed to decrypt the PDF.
   * @returns                 A promise returning void if resolved or returning an error message if rejected.
   */
  public openBlob(blob: Blob, password?: string) {
    checkType(blob, 'object', 'openBlob')
    checkType(password, 'string', 'openBlob', true)
    return new Promise<void>((resolve, reject) => {
      this.apiCallbackHandler.openResolve = resolve
      this.apiCallbackHandler.openReject = reject
      this.instance.openBlob(blob, password)
    })
  }

  /**
   * Open a PDF file with an FDF file from blobs. The two files are opened to build a merged file
   * such that the annotations defined in the FDF file are then contained in the PDF file.
   * NOTE: Any previously opened file must be closed first.
   * @param pdfBlob           The blob of the PDF file.
   * @param fdfBlob           The blob of the FDF file.
   * @param password          The password needed to decrypt the PDF.
   * @returns                 A promise returning void if resolved or returning an error message if rejected.
   */
  public openFDFBlob(pdfBlob: Blob, fdfBlob: Blob, password?: string) {
    checkType(pdfBlob, 'object', 'openFDFBlob')
    checkType(fdfBlob, 'object', 'openFDFBlob')
    checkType(password, 'string', 'openFDFBlob', true)
    return new Promise<void>((resolve, reject) => {
      this.apiCallbackHandler.openResolve = resolve
      this.apiCallbackHandler.openReject = reject
      this.instance.openFDFBlob(pdfBlob, fdfBlob, password)
    })
  }

  /**
   * Save the currently opened PDF file.
   * @param asFdf             Whether the file should be saved as
   *                          a PDF containing the document and annotations,
   *                          or an FDF containing ONLY the annotations.
   * @returns                 A promise returning a memory buffer containing the saved file if resolved or an error message if rejected.
   */
  public saveFile(asFdf: boolean) {
    checkType(asFdf, 'boolean', 'saveFile')
    return new Promise<Uint8Array>((resolve, reject) => {
      this.apiCallbackHandler.saveResolve = resolve
      this.apiCallbackHandler.saveReject = reject
      this.instance.saveFile(asFdf)
    })
  }

  /**
   * Close the currently opened PDF file.
   * @returns                 A promise returning nothing if resolved and an error message if rejected.
   */
  public close() {
    return new Promise<void>((resolve, reject) => {
      this.apiCallbackHandler.closeResolve = resolve
      this.apiCallbackHandler.closeReject = reject
      this.instance.close()
    })
  }

  /**
   * Clear the rendered pages cache to free memory.
   */
  public forceFlushCache() {
    this.instance.forceFlushCache()
  }

  /**
   * Get the current maximum size of the rendered pages cache.
   * @returns                 The current maximum cache size in MB.
   */
  public getMaxCacheSize(): number {
    return this.instance.getMaxCacheSize()
  }

  /**
   * Set the maximum size of the rendered pages cache.
   * @param cacheSize         The maximum cache size in MB. Default is 120 MB.
   */
  public setMaxCacheSize(cacheSize: number) {
    this.instance.setMaxCacheSize(cacheSize)
  }

  /**
   * Get the total page count of the opened document.
   * @returns                 The total number of pages of the currently opened file.
   *                          0 if no document is open.
   */
  public getPageCount(): number {
    return this.instance.getPageCount()
  }

  /**
   * Get the page number of the first visible page.
   * @returns                 The number of the topmost page shown in the viewport at this moment.
   */
  public getPageNumber(): number {
    return this.instance.getPageNumber()
  }

  /**
   * Go to a given page.
   * @param pageNumber        The number of the page to be shown in the viewport.
   */
  public setPageNumber(pageNumber: number) {
    checkType(pageNumber, 'number', 'setPageNumber')
    const ret = this.instance.setPageNumber(pageNumber)
    if (!ret.ok) {
      throw new Error(ret.message)
    }
  }

  /**
   * Get the viewer rotation.
   * @returns                 The currently used viewer rotation on all pages.
   */
  public getRotation(): number {
    return this.instance.getRotation()
  }

  /**
   * Set the viewer rotation.
   * NOTE: This only changes the view of the document and is not an operation on the document.
   * @param rotation          The rotation to be applied on all pages (cumulative with the embedded rotation per page).
   */
  public setRotation(rotation: number) {
    checkType(rotation, 'number', 'setRotation')
    const ret = this.instance.setRotation(rotation)
    if (!ret.ok) {
      throw new Error(ret.message)
    }
  }

  /**
   * Get the viewer zoom.
   * @returns                 The currently used zoom factor.
   */
  public getZoom(): number {
    return this.instance.getZoom()
  }

  /**
   * Set the viewer zoom.
   * @param zoom              The zoom factor as a percentage of the original size.
   */
  public setZoom(zoom: number, location?: Point) {
    checkType(zoom, 'number', 'setZoom')
    const ret = this.instance.setZoom(zoom, location)
    if (!ret.ok) {
      throw new Error(ret.message)
    }
  }

  /**
   * Get the maximum scroll position.
   * @returns                 The maximum scroll position in device pixels.
   */
  public getScrollMaxPosition(): MaxScrollPosition {
    return this.instance.getScrollMaxPosition()
  }

  /**
   * Get the current scroll position.
   * @returns                 The current scroll position in device pixels.
   */
  public getScrollPosition(): ScrollPosition {
    return this.instance.getScrollPosition()
  }

  /**
   * Set the scroll position.
   * @param pos               The scroll position to be shown in the viewer.
   */
  public setScrollPosition(pos: ScrollPosition) {
    this.instance.setScrollPosition(pos)
  }

  /**
   * Jump to a given destination in the document.
   * @param destination       The target destination.
   */
  public goTo(destination: PdfDestination) {
    this.instance.goTo(destination)
  }

  /**
   * Check if a document is opened
   * @returns                 Whether a file is opened by the viewer.
   *                          A file counts as open if opening it has completed successfully
   *                          and closing it has not started yet.
   */
  public isOpen(): boolean {
    return this.instance.getIsOpen()
  }

  /**
   * Set the page layout mode.
   * @param mode              The mode to be used for arranging pages on the canvas.
   */
  public setPageLayoutMode(mode: PdfPageLayoutMode) {
    const ret = this.instance.setPageLayoutMode(mode)
    if (!ret.ok) {
      throw new Error(ret.message)
    }
  }

  /**
   * Get the current page layout mode.
   * @returns                 The mode that is currently used for arranging pages on the canvas.
   */
  public getPageLayoutMode(): PdfPageLayoutMode {
    return this.instance.getPageLayoutMode()
  }

  /**
   * Set the fit mode.
   * @param fitMode           The mode to be used for fitting the viewport to the visible pages.
   */
  public setFitMode(fitMode: PdfFitMode) {
    const ret = this.instance.setFitMode(fitMode)
    if (!ret.ok) {
      throw new Error(ret.message)
    }
  }

  /**
   * Get the current fit mode.
   * @returns                 The mode that is currently used for fitting the viewport to the visible pages.
   */
  public getFitMode(): PdfFitMode {
    return this.instance.getFitMode()
  }

  /**
   * Get the size of the border shown in between pages.
   * @returns                 The border size in pixels at 100% zoom.
   */
  public getBorderSize(): number {
    return this.instance.getBorderSize()
  }

  /**
   * Set the size of the border shown in between pages.
   * @param borderSize          The border size in pixels at 100% zoom.
   */
  public setBorderSize(borderSize: number) {
    const ret = this.instance.setBorderSize(borderSize)
    if (!ret.ok) {
      throw new Error(ret.message)
    }
  }

  /**
   * Get the sliding window size.
   * @returns                 The number of pages the viewer renders before and after the visible pages.
   */
  public getSlidingWindowSize() {
    return this.instance.getSlidingWindowSize()
  }

  /**
   * Set the sliding window size.
   * NOTE: Changing this value will impact caching behavior, because the sliding
   * window has priority over cache size. This means that the cache can grow beyond
   * the set cache limit if the sliding window is very large.
   * @param slidingWindowSize The number of pages the viewer renders before and after the visible pages.
   */
  public setSlidingWindowSize(slidingWindowSize: number) {
    checkType(slidingWindowSize, 'number', 'setSlidingWindowSize')
    const ret = this.instance.setSlidingWindowSize(slidingWindowSize)
    if (!ret.ok) {
      throw new Error(ret.message)
    }
  }

  /**
   * Suspend drawing for all actions until {@link PdfWebViewer#resumeDrawing|resumeDrawing} is called.
   */
  public suspendDrawing() {
    this.instance.suspendDrawing()
  }

  /**
   * Resume drawing if currently suspended by {@link PdfWebViewer#suspendDrawing|suspendDrawing}.
   * NOTE: previously given commands that have not yet been executed will not trigger separate render updates.
   * However, a single render update will be made once all commands before the resumeDrawing call have been executed.
   */
  public resumeDrawing() {
    this.instance.resumeDrawing()
  }

  /**
   * Draw into the canvas to update the viewport.
   * This method has to be called whenever the canvas has been invalidated or after zoom/scroll.
   * @param context           The canvas context in which the viewer will render.
   */
  public renderCanvas(context: CanvasRenderingContext2D) {
    this.instance.render(context)
  }

  /**
   * Explicitly render a page with the given dimensions.
   * The width and height will be adjusted to the aspect ratio of the page, clamping it to the smaller of the two values.
   * @param pageNumber        The number of the page to be rendered.
   * @param width             The width of the output file.
   * @param height            The height of the output file.
   * @returns                 A promise returning PageImage if resolved or returning an error message if rejected.
   */
  public renderPage(pageNumber: number, width: number, height: number) {
    return new Promise<PageImage>((resolve, reject) => {
      this.apiCallbackHandler.RenderPagePromiseQueue[pageNumber] = { resolve, reject }
      this.instance.renderPage(pageNumber, width, height)
    })
  }

  /**
   * Set whether embedded preferences for the startup viewport should be ignored
   * when opening a PDF file (first shown page, fitmode etc.).
   * @param ignore            Whether the embedded preferences should be ignored.
   */
  public setIgnoringPreferences(ignore: boolean) {
    this.instance.setIgnoringPreferences(ignore)
  }

  /**
   * Get whether embedded preferences are ignored when opening a PDF file.
   * @returns                 Whether embedded preferences are ignored.
   */
  public getIgnoringPreferences(): boolean {
    return this.instance.getIgnoringPreferences()
  }

  /**
   * Get the product version of the viewer.
   * @returns                 The product version of the 3-Heights(TM) PDF Web Viewer.
   */
  public getProductVersion(): string {
    return this.instance.getProductVersion()
  }

  /**
   * Load outlines for a given parent.
   * Can be used to call recursively on children which have descendants.
   * @param parent            The parent outline item. If null then the root outline will be loaded.
   * @returns                 A promise with the children of the parent outline.
   */
  public getOutlines(parent: OutlineItem | null) {
    return new Promise<OutlineItem[]>((resolve, reject) => {
      this.apiCallbackHandler.GetOutlinesPromiseQueue[parent !== null ? parent.id : -1] = { resolve, reject }
      this.instance.getOutlines(parent)
    })
  }

  /**
   * Get the text fragment located at a given position.
   * @param point             The point in PDF coordinates.
   * @returns                 The text fragment or null if no text fragment can be found at the given point.
   */
  public getTextFragmentOnPoint(point: PdfPoint): TextFragment {
    checkType(point, 'object', 'getTextFragmentOnPoint')
    return this.instance.getTextFragmentOnPoint(point)
  }

  /**
   * Get the text selection rectangles between the two points.
   * @param startPoint        The starting point of the selection in PDF coordinates.
   * @param endPoint          The end point of the selection in PDF coordinates.
   * @returns                 The rectangles of the text fragments contained between the two points.
   */
  public getTextSelection(startPoint: PdfPoint, endPoint: PdfPoint): TextSelectionRect[] {
    return this.instance.getTextSelection(startPoint, endPoint)
  }

  /**
   * Get the text contained in given rectangles.
   * @param selection         The rectangles in PDF coordinates.
   * @returns                 The string of the selected text.
   */
  public getTextFromSelection(selection: PdfRect[]): string {
    return this.instance.getTextFromSelection(selection)
  }

  /**
   * Get the annotation located at a given point.
   * @param point             The point in PDF coordinates.
   * @returns                 The annotation or null.
   */
  public getAnnotationOnPoint(point: PdfPoint, onlySelectable: boolean = false): Annotation {
    return this.instance.getAnnotationOnPoint(point, onlySelectable)
  }

  /**
   * Get all popups from <firstPage> to <lastPage>.
   * @param firstPage         The first page.
   * @param lastPage          The last page.
   * @returns                 The list of annotations with a popup in the given range.
   */
  public getPopups(firstPage: number, lastPage: number): Annotation[] {
    return this.instance.getPopups(firstPage, lastPage)
  }

  /**
   * Get all open popups from <firstPage> to <lastPage>.
   * @param firstPage         The first page.
   * @param lastPage          The last page.
   * @returns                 The list of annotations with an open popup in the given range.
   */
  public getOpenPopups(firstPage: number, lastPage: number): Annotation[] {
    return this.instance.getOpenPopups(firstPage, lastPage)
  }
  /**
   * Load items of type {@link PdfItemCategory} for a given page.
   * @param page              The page for which the items should be loaded.
   * @param type              The type of item to be loaded. See {@link PdfItemCategory}.
   * @returns                 The list of items.
   */
  public getItemsFromPage(page: number, category: PdfItemCategory) {
    checkType(page, 'number', 'getItemsFromPage')
    checkType(category, 'number', 'getItemsFromPage')
    return new Promise<PdfItemsOnPage>((resolve, reject) => {
      if (category === PdfItemCategory.ANNOTATION) {
        this.apiCallbackHandler.GetAnnotationsFromPagePromiseQueue.push({ resolve, reject })
      } else if (category === PdfItemCategory.TEXT_FRAGMENT) {
        this.apiCallbackHandler.GetTextFragmentsFromPagePromiseQueue.push({ resolve, reject })
      } else if (category === PdfItemCategory.CONTENT_ELEMENT) {
        this.apiCallbackHandler.GetContentElementsFromPagePromiseQueue.push({ resolve, reject })
      }
      this.instance.getItemsFromPage(page, category)
    })
  }

  /**
   * Create an annotation.
   * Depending on the type of annotation the annotation args have to contain different arguments.
   * See:
   * {@link TextStampAnnotationArgs}
   * {@link InkAnnotationArgs}
   * {@link FreeTextAnnotationArgs}
   * @param itemArgs          The arguments specific to the type of item to be created.
   * @returns                 The created item.
   */
  public createItem(itemArgs: AnnotationArgs) {
    checkType(itemArgs, 'object', 'createItem')
    return new Promise<PdfItem>((resolve, reject) => {
      this.apiCallbackHandler.CreateItemPromiseQueue.push({ resolve, reject })
      this.instance.createItem(itemArgs)
    })
  }

  /**
   * Get the item for a given id.
   * @param id                The id of the item.
   * @returns                 A promise returning the item if resolved or returning an error message if rejected.
   */
  public getItem(id: number): PdfItem | null {
    const result = this.instance.getItem(id)
    if (result.ok) {
      return result.value
    } else {
      return null
    }
  }

  /**
   * Get the objects for given ids.
   * @param ids               The ids of the items.
   * @returns                 A promise returning a list of items if resolved or returning an error message if rejected.
   */
  public getItems(ids: number[]): PdfItem[] {
    return this.instance.getItems(ids)
  }

  /**
   * Update the editable fields of an item (e.g. an annotation).
   * Please check the manual for more information about items and their fields.
   * @param item              The item to be updated.
   * @returns                 A promise returning the updated item if resolved or returning an error message if rejected.
   */
  public updateItem(item: PdfItem) {
    checkType(item, 'object', 'updateItem')
    return new Promise<PdfItem>((resolve, reject) => {
      this.apiCallbackHandler.UpdateItemPromiseQueue.push({ resolve, reject })
      this.instance.updateItem(item)
    })
  }

  /**
   * Delete an item (e.g. an annotation).
   * Please check the manual for more information about items.
   * @param item              The item to be deleted.
   * @returns                 A promise returning nothing if resolved or returning an error message if rejected.
   */
  public deleteItem(item: PdfItem) {
    checkType(item, 'object', 'deleteItem')
    return new Promise<void>((resolve, reject) => {
      this.apiCallbackHandler.DeleteItemPromiseQueue.push({ resolve, reject })
      this.instance.deleteItem(item)
    })
  }

  /**
   * Verify that the viewer is able to read a given stamp image.
   * @param name              The name of the stamp image.
   * @param image             The stamp image to be verified.
   * @returns                 A promise returning the name of the image if resolved or returning an error message if rejected.
   */
  public verifyStampImage(name: string, image: Uint8Array) {
    checkType(image, 'object', 'addImageStampTemplate')
    return new Promise<StampInfo>((resolve, reject) => {
      this.apiCallbackHandler.GetStampInfoPromiseQueue.push({ resolve, reject })
      this.instance.verifyStampImage(name, image)
    })
  }

  /**
   * Get information about a particular stamp.
   * Used for text stamps to retrieve the aspect ratio of the resulting stamp.
   * @param args              stampType should be TEXT - stampText is the text of the stamp that should be displayed on the stamp annotation.
   * @returns                 A promise returning stamp information such as aspect ratio if resolved.
   */
  public getStampInfo(args: StampInfoArgs) {
    return new Promise<StampInfo>((resolve, reject) => {
      this.apiCallbackHandler.GetStampInfoPromiseQueue.push({ resolve, reject })
      this.instance.getStampInfo(args)
    })
  }

  /**
   * Check whether there are unsaved changes in the document.
   * NOTE: When saving a document with unsaved changes
   * - is successful: the promise resolves and the document is considered to be saved even if the array buffer with the saved document is discarded.
   * - fails: the document is considered to contain unsaved changes.
   * @returns                 True if there are unsaved changes, false otherwise.
   */
  public hasChanges() {
    return this.instance.hasChanges()
  }

  /**
   * @param searchString      The string to be searched for.
   * @param startPage         The page on which the search is started.
   * @param startIndex        The index within the page at which the search is started.
   * @param reverse           Whether the search should search in content backwards (default, false) or forwards (true).
   * @param caseSensitive     Whether the search should match case.
   * @param wrapSearch        Whether the search should wrap around to the beginning when the end of the document is reached.
   * @param useRegex          Whether the search should interpret the provided string as a regular expression.
   * @returns                 A promise returning a {@link SearchResult} if resolved or returning an error message if rejected.
   */
  public search(searchString: string, startPage: number, startIndex: number, reverse: boolean, caseSensitive: boolean,
                wrapSearch: boolean, useRegex: boolean) {
    return new Promise<SearchResult>((resolve, reject) => {
      if (this.apiCallbackHandler.searchReject !== null) {
        this.apiCallbackHandler.searchReject(new Error('Search aborted due to new search request'))
      }
      this.apiCallbackHandler.searchResolve = resolve
      this.apiCallbackHandler.searchReject = reject
      checkType(searchString, 'string', 'search')
      checkType(startPage, 'number', 'search')
      checkType(startIndex, 'number', 'search')
      checkType(reverse, 'boolean', 'search')
      checkType(caseSensitive, 'boolean', 'search')
      checkType(wrapSearch, 'boolean', 'search')
      checkType(useRegex, 'boolean', 'search')
      this.instance.search(searchString, startPage, startIndex, reverse, caseSensitive, wrapSearch, useRegex)
      })
  }

  /**
   * Set the license key for the viewer.
   * @param license           The license key.
   * @returns                 A promise returning null if resolved or throwing an exception in case of an error.
   */
  public setLicenseKey(license: string) {
    checkType(license, 'string', 'setLicenseKey')
    return new Promise<void>((resolve, reject) => {
      this.apiCallbackHandler.licenseResolve = resolve
      this.apiCallbackHandler.licenseReject = reject
      this.instance.setLicense(license)
    })
  }

  /**
   * Convert a point from device coordinates to PDF coordinates.
   * @param point                  The point in device coordinates.
   * @param page                   The page relative to which the PDF coordinates should be calculated.
   * @param guaranteePointIsOnPage This parameter will fix the isOnPage boolean of the return value to true.
   *                               Due to conversions back and forth from CSS to PDF and vice versa,
   *                               a CSS coordinate could return isOnPage=False even if the mouse movement
   *                               has been restricted to the page. Only set this to true if the
   *                               device point is certainly on the page.
   * @returns                      The point in PDF coordinates, including the number of the page where it is located.
   */
  public transformScreenPointToPdfPoint(point: Point, page?: number, guaranteePointIsOnPage?: boolean): ScreenPointToPdfPointResult {
    checkType(point.x, 'number', 'x')
    checkType(point.y, 'number', 'y')
    if (page !== undefined) {
      checkType(page, 'number', 'page')
    } else {
      page = -1
    }
    if (guaranteePointIsOnPage !== undefined) {
      checkType(guaranteePointIsOnPage, 'boolean', 'transformScreenPointToPdf')
    } else {
      guaranteePointIsOnPage = false
    }
    return this.instance.transformScreenPointToPdfPoint(point, page, guaranteePointIsOnPage)
  }

  /**
   * Convert a rectangle from device coordinates to PDF coordinates.
   * @param rect              The rectangle in device coordinates.
   * @returns                 The rectangle in PDF coordinates, including the number of the page where it is located.
   */
  public transformScreenRectToPdfRect(rect: Rect, page: number): PdfRect {
    checkType(rect.x, 'number', 'x')
    checkType(rect.y, 'number', 'y')
    checkType(rect.w, 'number', 'w')
    checkType(rect.h, 'number', 'h')
    return this.instance.transformScreenRectToPdfRect(rect, page)
  }

  /**
   * Convert a rectangle from PDF coordinates to device coordinates.
   * @param pdfRect           The rectangle in PDF coordinates.
   * @returns Rect            The rectangle in device coordinates.
   */
  public transformPdfPageRectToScreenRect(pdfRect: PdfRect): Rect {
    checkType(pdfRect.pdfX, 'number', 'pdfX')
    checkType(pdfRect.pdfY, 'number', 'pdfY')
    checkType(pdfRect.pdfW, 'number', 'pdfW')
    checkType(pdfRect.pdfH, 'number', 'pdfH')
    checkType(pdfRect.page, 'number', 'page')
    return this.instance.transformPdfPageRectToScreenRect(pdfRect)
  }

  /**
   * Convert a length from PDF units to device pixels.
   * @param pdfLength         The length in PDF units.
   * @returns number          The length in device pixels.
   */
  public transformPdfLengthToDeviceLength(pdfLength: number): number {
    checkType(pdfLength, 'number', 'tranformPdfLengthToDeviceLength')
    return this.instance.transformPdfLengthToDeviceLength(pdfLength)
  }

  /**
   * Get the screen rectangle of a page to know its position inside the viewport.
   * @param pageNumber        The number of the page.
   * @returns                 The rectangle with the page coordinates in device pixels.
   *                          Null if no document is opened or the page is invalid.
   */
  public getPageScreenRect(pageNumber: number): Rect {
    return this.instance.getPageScreenRect(pageNumber)
  }

  public addEventListener<K extends keyof PdfViewerApiEventMap>(type: K, listener: (e: PdfViewerApiEventMap[K]) => void) {
    if (this.eventListeners.has(type)) {
      (this.eventListeners.get(type) as PdfViewerApiEventListener[]).push(listener)
    } else {
      this.eventListeners.set(type, [listener])
    }
  }

  public removeEventListener<K extends keyof PdfViewerApiEventMap>(type: K, listener: (e: PdfViewerApiEventMap[K]) => void) {
    if (this.eventListeners.has(type)) {
      let listeners = this.eventListeners.get(type) as PdfViewerApiEventListener[]
      listeners = listeners.filter(listenerInArray => listenerInArray !== listener)
      if (listeners.length !== 0) {
        this.eventListeners.set(type, listeners)
      } else {
        this.eventListeners.delete(type)
      }
    }
  }

  private dispatchEvent<K extends keyof PdfViewerApiEventMap>(type: K, args: PdfViewerApiEventMap[K]) {
    if (this.eventListeners.has(type)) {
      const listeners = this.eventListeners.get(type) as PdfViewerApiEventListener[]
      listeners.forEach(listener => listener(args))
    }
  }

}
