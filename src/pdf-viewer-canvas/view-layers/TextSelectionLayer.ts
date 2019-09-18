import { ViewLayerBase } from './ViewLayerBase'
import { ViewerCanvasState } from '../state/store'
import { PdfPoint, PdfRect, PdfItemType, HighlightAnnotationArgs } from '../../pdf-viewer-api'
import { createTextSelectionContextBar } from './views/TextSelectionContextBar'
import { Color } from '../../common/Color'
import { ViewerMode, CursorStyle, copyTextToClipboard } from '../state/viewer'

/** @internal */
export class TextSelectionLayer extends ViewLayerBase {

  private startPoint: PdfPoint | null = null
  private selecting: boolean = false
  private contextbarElement: HTMLElement | null = null

  constructor() {
    super()

    this.createAnnotation = this.createAnnotation.bind(this)
    this.copyTextSelection = this.copyTextSelection.bind(this)
  }

  public create() {
  }

  public render(timestamp: number, state: ViewerCanvasState) {

    if (state.viewer.mode !== ViewerMode.TEXT_SELECTED) {
      if (this.contextbarElement) {
        this.removeHtmlElements()
        this.contextbarElement = null
      }
    }

    // start new selection
    if (state.viewer.mode === ViewerMode.DEFAULT && !this.selecting && (
      (state.pointer.type === 'mouse' && state.pointer.action === 'startdrag') ||
      (state.pointer.action === 'longpress')
    )) {

      const pointerPos = {
        x: state.startPointer.x.devicePixels,
        y: state.startPointer.y.devicePixels,
      }
      const pointerPdfPos = this.pdfViewerApi.transformScreenPointToPdfPoint(pointerPos)
      if (pointerPdfPos.isOnPage) {
        const currentTextFragment = this.pdfViewerApi.getTextFragmentOnPoint(pointerPdfPos.pdfPoint)
        if (currentTextFragment) {
          this.startSelection(pointerPdfPos.pdfPoint)
        }
      }
    }

    if (state.viewer.mode === ViewerMode.TEXT_SELECTED || this.selecting) {

      let updateContextBarPos = state.canvas.canvasInvalidated

      // create contextbar after selection is created
      if (state.viewer.textSelection && state.viewer.textSelection.length > 0 && !this.selecting && !this.contextbarElement) {
        this.selectionCreated()
        updateContextBarPos = true
      }

      if (state.pointer.positionChanged || state.pointer.stateChanged) {

        const pointerPos = {
          x: state.pointer.x.devicePixels,
          y: state.pointer.y.devicePixels,
        }
        const pointerPdfPos = this.pdfViewerApi.transformScreenPointToPdfPoint(pointerPos)

        // restart or end selection
        if (pointerPdfPos.isOnPage && (
          (state.pointer.type === 'mouse' && state.pointer.action === 'startdrag') ||
          (state.pointer.action === 'longpress')
        )) {
          const currentTextFragment = this.pdfViewerApi.getTextFragmentOnPoint(pointerPdfPos.pdfPoint)
          if (currentTextFragment) {
            this.startSelection(pointerPdfPos.pdfPoint)
          }
        }

        if (state.pointer.action === 'click') {
          this.endSelection()
        }

        // get text selection
        if (this.selecting && this.startPoint && this.startPoint !== pointerPdfPos.pdfPoint) {
          const selection = this.pdfViewerApi.getTextSelection(this.startPoint, pointerPdfPos.pdfPoint)
          this.store.viewer.setTextSelection(selection)
          this.store.viewer.setCursorStyle(CursorStyle.TEXT)
        }

        // pointer up -> create selection or leave selection mode
        if (state.pointer.stateChanged && !state.pointer.isDown) {
          const currentSelection = state.viewer.textSelection
          if (currentSelection && currentSelection.length > 0) {
            updateContextBarPos = true
            this.selectionCreated()
          }
        }

      }

      if (state.pointer.action === 'click' && state.viewer.mode === ViewerMode.TEXT_SELECTED) {
        this.endSelection()
      }

      // update contextbar position
      if (updateContextBarPos && this.contextbarElement && state.viewer.textSelection) {

        const padding = 25
        let barTopPos = padding
        let barLeftPos = 0
        let isTopPos = false

        const firstTextFragmentRect = this.pdfViewerApi.transformPdfPageRectToScreenRect(state.viewer.textSelection[0])
        barLeftPos = firstTextFragmentRect.x / devicePixelRatio
        if (barLeftPos < padding) {
          barLeftPos = padding
        } else {
          const barWidth = this.contextbarElement.clientWidth
          if (barLeftPos + barWidth + padding > state.canvas.width.cssPixels) {
            barLeftPos = state.canvas.width.cssPixels - (barWidth + padding)
          }
        }

        const firstTextFragmentRectCssPosTop = firstTextFragmentRect.y / devicePixelRatio
        if (firstTextFragmentRectCssPosTop > 90) {
          barTopPos = firstTextFragmentRectCssPosTop - 65
          isTopPos = true
        } else {
          const lastTextFragmentRect = this.pdfViewerApi.transformPdfPageRectToScreenRect(state.viewer.textSelection[state.viewer.textSelection.length - 1])
          const lastTextFragmentRectCssPosBottom = (lastTextFragmentRect.y + lastTextFragmentRect.h) / devicePixelRatio
          if (lastTextFragmentRectCssPosBottom < 65) {
            barTopPos = lastTextFragmentRectCssPosBottom - 40
          }
        }

        this.contextbarElement.style.top = barTopPos + 'px'
        this.contextbarElement.style.left = barLeftPos + 'px'

        if (isTopPos && !this.contextbarElement.classList.contains('pwv-contextbar-top')) {
          this.contextbarElement.classList.add('pwv-contextbar-top')
        } else if (!isTopPos && this.contextbarElement.classList.contains('pwv-contextbar-top')) {
          this.contextbarElement.classList.remove('pwv-contextbar-top')
        }
      }

      // auto scroll
      if (this.selecting && state.pointer.y.devicePixels > -1) {
        const padding = 30
        const dxScroll = 20
        if (state.pointer.y.devicePixels > state.canvas.height.devicePixels - padding) {
          this.pdfViewerApi.setScrollPosition({
            x: state.scroll.left.devicePixels,
            y: state.scroll.top.devicePixels + dxScroll,
          })
        } else if (state.pointer.y.devicePixels < padding) {
          this.pdfViewerApi.setScrollPosition({
            x: state.scroll.left.devicePixels,
            y: state.scroll.top.devicePixels - dxScroll,
          })
        } else if (state.pointer.x.devicePixels > state.canvas.width.devicePixels - padding) {
          this.pdfViewerApi.setScrollPosition({
            x: state.scroll.left.devicePixels + dxScroll,
            y: state.scroll.top.devicePixels,
          })
        } else if (state.pointer.x.devicePixels < padding) {
          this.pdfViewerApi.setScrollPosition({
            x: state.scroll.left.devicePixels - dxScroll,
            y: state.scroll.top.devicePixels,
          })
        }
      }
    }
  }

  private startSelection(startPoint: PdfPoint) {
    this.removeHtmlElements()
    this.contextbarElement = null
    this.selecting = true
    if (this.startPoint === null) {
      this.startPoint = startPoint
    }
    this.store.viewer.setCursorStyle(CursorStyle.TEXT)
  }

  private cancelSelection() {
    this.contextbarElement = null
    this.selecting = false
    this.startPoint = null
    this.store.viewer.setCursorStyle(CursorStyle.TEXT)
  }

  private endSelection() {
    this.removeHtmlElements()
    this.contextbarElement = null
    this.selecting = false
    this.startPoint = null
    this.store.viewer.setTextSelection([])
    window.setTimeout(() => {
      this.store.viewer.setTextSelection(null)
    }, 100)
  }

  private selectionCreated() {
    this.selecting = false
    if (this.contextbarElement) {
      this.removeHtmlElements()
    }
    this.store.viewer.setCursorStyle(CursorStyle.DEFAULT)
    this.contextbarElement = this.createHtmlLayer()
    this.contextbarElement.classList.add('pwv-textselection-contextbar')
    this.contextbarElement.classList.add('pwv-contextbar-top')
    createTextSelectionContextBar({
      highlightColors: this.options.highlightColors,
      onCreateAnnotation: this.createAnnotation,
      onCopyText: this.copyTextSelection,
    }, this.contextbarElement)
  }

  private createAnnotation(itemType: PdfItemType, color: string) {
    if (this.pdfViewerApi && this.store) {
      const selection = this.store.getState().viewer.textSelection
      if (selection) {
        const selectionByPage: PdfRect[][] = []
        for (let i = 0; i < selection.length; i++) {
          const rect = selection[i]
          if (!selectionByPage[rect.page]) {
            selectionByPage[rect.page] = []
          }
          selectionByPage[rect.page].push(rect)
        }

        if (itemType === PdfItemType.HIGHLIGHT) {
          const colorObj = new Color(color)
          colorObj.setOpacity(this.options.highlightOpacity)
          color = colorObj.toRgba()
        }
        for (let i = 0; i < selectionByPage.length; i++) {
          if (selectionByPage[i]) {
            const quadPointRects = selectionByPage[i]
            const args: HighlightAnnotationArgs = {
              itemType,
              page: i,
              pdfRect: {
                pdfX: 0,
                pdfY: 0,
                pdfW: 0,
                pdfH: 0,
                page: i,
              },
              color,
              originalAuthor: this.options.author,
              quadPointRects,
            }
            this.pdfViewerApi.createItem(args)
            this.endSelection()
          }
        }
      }
    }
  }

  private copyTextSelection() {
    const selection = this.store.getState().viewer.textSelection
    if (selection && selection.length > 0) {
      const text = this.pdfViewerApi.getTextFromSelection(selection)
      copyTextToClipboard(text)
    }
  }
}
