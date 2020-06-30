import { Annotation, PdfItemType, Point, Rect, PdfItem, PdfItemCategory } from '../../pdf-viewer-api'
import { ViewLayerBase } from './ViewLayerBase'
import { ViewerCanvasState } from '../state/store'
import { getAnnotationsOnPoint } from '../state/annotations'
import { getAnnotationBehaviors } from '../AnnotationBehaviors'
import { ViewerMode, copyTextToClipboard, CursorStyle } from '../state/viewer'
import { createAnnotationContextBar, ContextBarActions } from './views/AnnotationContextBar'
import { AnnotationBorder } from './views/AnnotationBorder'
import { addHistoryEntry } from '../../custom/history'

/** @internal */
export class AnnotationSelectionLayer extends ViewLayerBase {

  public context: CanvasRenderingContext2D | null = null
  private selectedAnnotation: Annotation | null = null
  private selectionElement: HTMLElement | null = null
  private barAtTop: boolean = true
  private contextBar: ContextBarActions | null = null
  private annotationBorder: AnnotationBorder | null = null

  constructor() {
    super()

    this.deleteAnnotation = this.deleteAnnotation.bind(this)
    this.rotateAnnotation = this.rotateAnnotation.bind(this)
    this.copyAnnotationText = this.copyAnnotationText.bind(this)
    this.createPopup = this.createPopup.bind(this)
    this.openPopup = this.openPopup.bind(this)
    this.deletePopup = this.deletePopup.bind(this)
    this.moveAnnotation = this.moveAnnotation.bind(this)
    this.toggleLock = this.toggleLock.bind(this)
    this.resizeAnnotation = this.resizeAnnotation.bind(this)
    this.onItemSelected = this.onItemSelected.bind(this)
  }

  public create() {
    if (this.viewerCanvas) {
      this.viewerCanvas.addEventListener('itemSelected', this.onItemSelected)
    }
    this.selectAnnotation = this.selectAnnotation.bind(this)
    this.deselectAnnotation = this.deselectAnnotation.bind(this)
    this.deleteAnnotation = this.deleteAnnotation.bind(this)
    this.createPopup = this.createPopup.bind(this)
    this.deletePopup = this.deletePopup.bind(this)
    this.openPopup = this.openPopup.bind(this)

    this.context = this.createCanvas()
    this.context.canvas.style.display = 'none'
    this.selectionElement = this.createHtmlLayer()
    this.selectionElement.style.display = 'none'
    this.selectionElement.style.position = 'absolute'
    this.selectionElement.classList.add('pwv-annotation-selection')
    this.selectionElement.classList.add('pwv-contextbar-top')
    this.selectionElement.addEventListener('click', e => { e.preventDefault(), e.cancelBubble = true }, false)

    this.contextBar = createAnnotationContextBar({
      onDeleteAnnotation: this.deleteAnnotation,
      onRotateAnnotation: this.rotateAnnotation,
      onCopy: this.copyAnnotationText,
      onCreatePopup: this.createPopup,
      onOpenPopup: this.openPopup,
      onDeletePopup: this.deletePopup,
      onToggleLock: this.toggleLock,
      canEdit: this.canEdit,
    }, this.selectionElement)

    this.annotationBorder = new AnnotationBorder(this.selectionElement, this.moveAnnotation, this.resizeAnnotation, this.openPopup, this.options)
  }

  public render(timestamp: number, state: ViewerCanvasState) {

    const mode = state.viewer.mode

    if (this.selectedAnnotation && mode !== ViewerMode.ANNOTATION_SELECTED) {
      this.deselectAnnotation()
    }

    if ((
      state.pointer.action === 'click' ||
      state.pointer.action === 'dblclick'
    ) && (
        mode === ViewerMode.DEFAULT ||
        mode === ViewerMode.ANNOTATION_SELECTED ||
        mode === ViewerMode.POPUP_SELECTED
      )) {

      const pointerPos = {
        x: state.pointer.x.devicePixels,
        y: state.pointer.y.devicePixels,
      }

      const pointerPdfPos = this.pdfViewerApi.transformScreenPointToPdfPoint(pointerPos)
      const annotationsOnPoint = getAnnotationsOnPoint(state.annotations, pointerPdfPos.pdfPoint, true)

      let breakRenderLoop = false

      if (annotationsOnPoint && annotationsOnPoint.length) {
        for (let i = 0; i < annotationsOnPoint.length; i++) {
          const annotationOnPoint = annotationsOnPoint[i]
          const behaviors = getAnnotationBehaviors(annotationOnPoint.itemType)
          if (state.pointer.action === 'click') {
            if (annotationOnPoint.id !== state.viewer.selectedAnnotationId) {
              if (state.viewer.selectedAnnotationId) {
                this.deselectAnnotation()
              }
              if (!annotationOnPoint.isHidden()) {
                this.selectAnnotation(annotationOnPoint)
                breakRenderLoop = true
              }
            }
          } else if (state.pointer.action === 'dblclick') { 
            if (behaviors.canHavePopup && !annotationOnPoint.isHidden()) {
              this.openPopup(annotationOnPoint.id)
              breakRenderLoop = true
            } else if (annotationOnPoint.itemType === PdfItemType.FREE_TEXT) {
              if (this.viewerCanvas) {
                this.viewerCanvas.startModule('FreetextAnnotationModule', annotationOnPoint.id)
              }
            }
          }
        }
      } else if (state.viewer.selectedAnnotationId) {
        this.deselectAnnotation()
        breakRenderLoop = true
      }
      if (breakRenderLoop) {
        this.store.canvas.setCanvasInvalidated(true)
        return false
      }
    }

    if (mode === ViewerMode.ANNOTATION_SELECTED && state.viewer.selectedAnnotationId) {

      const annotation = state.annotations.all[state.viewer.selectedAnnotationId]

      if (this.selectedAnnotation === null) {
        this.selectAnnotation(annotation)
      }

      if (this.annotationBorder && state.canvas.canvasInvalidated) {
        const pageRect = state.document.pageRects[annotation.pdfRect.page]
        if (pageRect) {
          this.annotationBorder.updatePageRect(pageRect)
        }
      }

      if (state.viewer.selectedAnnotationChanged || state.canvas.canvasInvalidated) {
        this.updateSelectionElementPosition(annotation)
      }
    }

  }

  private updateSelectionElementPosition(annotation: Annotation) {
    if (this.selectionElement) {

      const rect = this.pdfViewerApi.transformPdfPageRectToScreenRect(annotation.pdfRect)
      const annotationY = rect.y / devicePixelRatio
      const annotationX = rect.x / devicePixelRatio
      const annotationW = rect.w / devicePixelRatio
      const annotationH = rect.h / devicePixelRatio

      const newBarAtTop = annotationY > 80

      this.selectionElement.style.top = annotationY + 'px'
      this.selectionElement.style.left = annotationX + 'px'
      this.selectionElement.style.width = annotationW + 'px'
      this.selectionElement.style.height = annotationH + 'px'

      if (this.barAtTop !== newBarAtTop) {
        this.barAtTop = newBarAtTop
        if (this.barAtTop) {
          this.selectionElement.classList.remove('pwv-contextbar-bottom')
          this.selectionElement.classList.add('pwv-contextbar-top')
        } else {
          this.selectionElement.classList.remove('pwv-contextbar-top')
          this.selectionElement.classList.add('pwv-contextbar-bottom')
        }
      }

      // update contextbar left position
      const contextbarElement = this.selectionElement.lastChild as HTMLElement
      if (contextbarElement) {
        const state = this.store.getState()
        const canvasWidth = state.canvas.width.cssPixels

        const barWidth = contextbarElement.offsetWidth
        const barCenter = barWidth / 2

        const padding = 4
        let left = 0

        if (barWidth > annotationW) {
          left = (barWidth - annotationW) / -2
        } else {
          left = (annotationW - barWidth) / 2
        }

        if (annotationX + left + padding < 0) {
          left = (annotationX * -1) + padding
          if (annotationX + annotationW < barCenter) {
            left = annotationW - barCenter
          }
        }

        if (annotationX + left + barWidth + padding > canvasWidth) {
          left = canvasWidth - annotationX - barWidth - padding
          if (left * -1 > barCenter) {
            left = barCenter * -1
          }
        }

        contextbarElement.style.left = left + 'px'

      }
    }

  }

  private selectAnnotation(annotation: Annotation, preventEvent?: boolean) {
    if (this.selectionElement && this.context && this.annotationBorder && this.contextBar) {
      this.selectedAnnotation = annotation
      const pageRect = this.store.getState().document.pageRects[annotation.pdfRect.page]
      this.annotationBorder.deselectAnnotation()
      this.annotationBorder.setAnnotation(annotation, pageRect)

      const state = this.store.getState()
      const commands = state.viewer.contextBarItems[annotation.itemType] ? state.viewer.contextBarItems[annotation.itemType] : []
      this.contextBar.setAnnotation({ annotation, commands })

      this.context.canvas.style.display = 'none'
      this.selectionElement.style.display = 'block'

      this.barAtTop = true
      this.selectionElement.classList.remove('pwv-contextbar-bottom')
      this.selectionElement.classList.add('pwv-contextbar-top')
      this.updateSelectionElementPosition(annotation)
      this.store.viewer.selectAnnotation(annotation)
      this.store.viewer.setCursorStyle(CursorStyle.DEFAULT)
      if (this.viewerCanvas && !preventEvent) {
        this.dispatchEvent('itemSelected', annotation)
      }
    }
  }

  private deselectAnnotation() {
    if (this.context && this.selectionElement && this.annotationBorder) {
      const annot = this.selectedAnnotation
      this.selectedAnnotation = null
      this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height)
      this.annotationBorder.deselectAnnotation()
      this.context.canvas.style.display = 'none'
      this.selectionElement.style.display = 'none'
      this.store.viewer.deselectAnnotation()
      if (this.viewerCanvas && annot !== null) {
        this.dispatchEvent('itemDeselected', annot)
      }
    }
  }

  private rotateAnnotation(id: number) {
    if (this.pdfViewerApi) {
      const item = this.pdfViewerApi.getItem(id) as any
      item.rotation = (item.rotation - 90) % 360
      this.pdfViewerApi.updateItem(item).then( item => {
        if (this.annotationBorder) {
          const annotation = item as Annotation
          const pageRect = this.store.getState().document.pageRects[annotation.pdfRect.page]
          this.annotationBorder.setAnnotation(annotation, pageRect)
        }
      })
    }
  }

  private moveAnnotation(id: number, point: Point) {
    if (this.pdfViewerApi) {
      const item = this.pdfViewerApi.getItem(id) as Annotation
      const newItemPos = this.pdfViewerApi.transformScreenPointToPdfPoint({
        x: point.x * window.devicePixelRatio,
        y: point.y * window.devicePixelRatio,
      }, -1, true)
      if (newItemPos.pdfPoint.page === item.pdfRect.page) {
        switch (this.pdfViewerApi.getRotation()) {
          case 0:
            item.pdfRect.pdfX = newItemPos.pdfPoint.pdfX
            item.pdfRect.pdfY = newItemPos.pdfPoint.pdfY
            break
          case 90:
            item.pdfRect.pdfX = newItemPos.pdfPoint.pdfX
            item.pdfRect.pdfY = newItemPos.pdfPoint.pdfY - item.pdfRect.pdfH
            break
          case 180:
            item.pdfRect.pdfX = newItemPos.pdfPoint.pdfX - item.pdfRect.pdfW
            item.pdfRect.pdfY = newItemPos.pdfPoint.pdfY - item.pdfRect.pdfH
            break
          case 270:
            item.pdfRect.pdfX = newItemPos.pdfPoint.pdfX - item.pdfRect.pdfW
            item.pdfRect.pdfY = newItemPos.pdfPoint.pdfY
            break
        }
      }

      this.store.annotations.updateAnnotation(item)
      this.store.canvas.setCanvasInvalidated(true)

      this.pdfViewerApi.updateItem(item)
    }
  }

  private resizeAnnotation(id: number, rect: Rect) {
    if (this.pdfViewerApi) {
      const item = this.pdfViewerApi.getItem(id) as Annotation
      const newItemRect = this.pdfViewerApi.transformScreenRectToPdfRect({
        x: rect.x * window.devicePixelRatio,
        y: rect.y * window.devicePixelRatio,
        w: rect.w * window.devicePixelRatio,
        h: rect.h * window.devicePixelRatio,
      }, item.pdfRect.page)
      if (newItemRect.page === item.pdfRect.page) {
        item.pdfRect = newItemRect
      }

      this.store.annotations.updateAnnotation(item)
      this.store.canvas.setCanvasInvalidated(true)

      this.pdfViewerApi.updateItem(item)
    }
  }

  private copyAnnotationText(id: number) {
    if (this.pdfViewerApi) {
      const item = this.pdfViewerApi.getItem(id) as Annotation
      if (item.itemType === PdfItemType.HIGHLIGHT ||
        item.itemType === PdfItemType.UNDERLINE ||
        item.itemType === PdfItemType.SQUIGGLY ||
        item.itemType === PdfItemType.STRIKE_OUT) {
        const quadPointAnnotation = item as any
        const text = this.pdfViewerApi.getTextFromSelection(quadPointAnnotation.quadPointRects)
        copyTextToClipboard(text)
      }
    }
  }

  private toggleLock(id: number) {
    if (this.pdfViewerApi) {
      const annot = this.pdfViewerApi.getItem(id) as Annotation
      if (this.options.ms_custom) {
        addHistoryEntry(annot, annot.isLocked() ? 'unlock' : 'lock', this.options.author)
      }
      annot.setLock(!annot.isLocked())
      if (this.annotationBorder) {
        this.annotationBorder.deselectAnnotation()
        const pageRect = this.store.getState().document.pageRects[annot.pdfRect.page]
        this.annotationBorder.setAnnotation(annot, pageRect)
      }
      this.store.annotations.updateAnnotation(annot)
      this.pdfViewerApi.updateItem(annot)
    }
  }

  private deleteAnnotation(id: number) {
    if (this.pdfViewerApi) {
      const item = this.pdfViewerApi.getItem(id) as Annotation
      if (this.options.ms_custom) {
        item.setHidden(true)
        addHistoryEntry(item, 'delete', this.options.author)
        this.store.annotations.updateAnnotation(item)
        this.pdfViewerApi.updateItem(item)
        this.deselectAnnotation()
      } else {
        this.pdfViewerApi.deleteItem(item)
        .then(() => {
            this.deselectAnnotation()
          })
          .catch(error => {
            console.error(error)
          })
      }
    }
  }

  private deletePopup(id: number) {
    if (this.pdfViewerApi) {
      const item = this.pdfViewerApi.getItem(id) as Annotation
      item.content = null
      item.popup.isOpen = false

      this.store.annotations.updateAnnotation(item)
      this.store.canvas.setCanvasInvalidated(true)

      this.pdfViewerApi.updateItem(item)
    }
  }

  private createPopup(id: number) {
    if (this.pdfViewerApi) {
      const item = this.pdfViewerApi.getItem(id) as Annotation
      item.content = ''
      item.popup.isOpen = true
      item.popup.pdfRect.pdfX = item.pdfRect.pdfX
      item.popup.pdfRect.pdfY = item.pdfRect.pdfY - (item.popup.pdfRect.pdfH + 10)

      this.store.annotations.updateAnnotation(item)
      this.store.canvas.setCanvasInvalidated(true)

      this.pdfViewerApi.updateItem(item)
        .then(() => {
          this.store.viewer.selectPopup({ id: item.id, focus: true})
        })
      this.deselectAnnotation()
    }
  }

  private openPopup(id: number) {
    if (this.pdfViewerApi) {
      const item = this.pdfViewerApi.getItem(id) as Annotation
      if (!item.popup) {
        return
      }
      item.popup.isOpen = true

      this.store.annotations.updateAnnotation(item)
      this.store.canvas.setCanvasInvalidated(true)

      this.pdfViewerApi.updateItem(item)
        .then(() => {
          this.store.viewer.selectPopup({id: item.id, focus: true}  )
        })
      this.deselectAnnotation()
    }
  }

  private onItemSelected(item: PdfItem) {
    if (item.itemCategory === PdfItemCategory.ANNOTATION) {
      this.selectAnnotation(item as Annotation, true)
    }
  }

}
