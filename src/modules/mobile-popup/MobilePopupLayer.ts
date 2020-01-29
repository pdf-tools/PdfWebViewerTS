import { CanvasLayer } from '../CanvasLayer'
import { ViewerCanvasState } from '../../pdf-viewer-canvas/state/store'
import { createMobilePopupView, MobilePopupViewActions } from './MobilePopup'
import { PdfItemType, Annotation } from '../../pdf-viewer-api'
import { getColorPalette } from '../../common/Tools'
import { addHistoryEntry } from '../../custom/history'

export class MobilePopupLayer extends CanvasLayer {

  private popupElement: HTMLElement | undefined
  private popupView: MobilePopupViewActions | null = null
  private selectedPopupId: number | null = null

  public onCreate(): void {

    this.openPopup = this.openPopup.bind(this)
    this.closePopup = this.closePopup.bind(this)
    this.deletePopup = this.deletePopup.bind(this)
    this.updatePopupContent = this.updatePopupContent.bind(this)
    this.updatePopupColor = this.updatePopupColor.bind(this)
    this.formatDate = this.formatDate.bind(this)
    this.toggleAnnotationLock = this.toggleAnnotationLock.bind(this)
    this.updateSelectedPopupContent = this.updateSelectedPopupContent.bind(this)

    this.popupElement = this.createHtmlLayer()
    this.popupElement.style.display = 'none'
    this.popupElement.style.position = 'absolute'

    this.popupElement.style.top = '0'
    this.popupElement.style.left = '0'
    this.popupElement.style.bottom = '0'
    this.popupElement.style.right = '0'

    this.popupElement.classList.add('pwv-mobile-popup')

    this.popupView = createMobilePopupView({
      fallbackColors: this.options.highlightColors,
      onClose: this.closePopup,
      onDelete: this.deletePopup,
      onUpdateContent: this.updatePopupContent,
      onUpdateColor: this.updatePopupColor,
      canEdit: this.canEdit,
      toggleLock: this.toggleAnnotationLock,
    }, this.popupElement)
  }

  public onRemove(): void {

  }

  public render(timestamp: number, state: ViewerCanvasState) {
    if (this.pdfApi && this.popupElement) {
      if (state.viewer.selectedPopupChanged) {
        if (state.viewer.selectedPopupId) {
          this.openPopup(state.viewer.selectedPopupId)
        }
      }
    }
  }

  public openPopup(id: number) {
    if (this.pdfApi && this.popupElement && this.popupView) {
      const annotation = this.pdfApi.getItem(id) as any
      if (annotation) {
        this.selectedPopupId = id
        this.popupElement.style.display = 'block'
        this.popupView.openPopup({
          id: annotation.id,
          content: annotation.content,
          subject: annotation.subject,
          lastModified: this.formatDate(annotation.lastModified),
          originalAuthor: annotation.originalAuthor,
          color: annotation.color,
          colorPalette: getColorPalette(annotation.itemType, this.options),
          isLocked: annotation.isLocked(),
        })
      }
    }
  }

  private closePopup(id: number, content: string, subject: string) {
    if (this.pdfApi && this.popupElement && this.popupView) {
      this.popupElement.style.display = 'none'
      this.popupView.closePopup()
      const item = this.pdfApi.getItem(id) as Annotation
      if (item) {
        addHistoryEntry(item, 'edit', this.options.author, content, subject)
        item.popup.isOpen = false
        item.content = content
        item.subject = subject
        this.store.annotations.updateAnnotation(item)
        this.pdfApi.updateItem(item)
        this.store.viewer.selectPopup(null)
      }
    }
  }

  private deletePopup(id: number) {
    if (this.pdfApi && this.popupElement && this.popupView) {
      this.popupElement.style.display = 'none'
      this.popupView.closePopup()
      const annotation = this.pdfApi.getItem(id) as Annotation
      if (annotation) {
        annotation.content = null
        annotation.popup.isOpen = false
        this.store.annotations.updateAnnotation(annotation)
        this.pdfApi.updateItem(annotation)
      }
    }
  }

  private updatePopupContent(id: number, content: string) {
    if (this.pdfApi) {
      const annotation = this.pdfApi.getItem(id) as Annotation
      if (annotation) {
        annotation.content = content
        this.pdfApi.updateItem(annotation)
      }
    }
  }

  private updatePopupColor(id: number, color: string) {
    if (this.pdfApi && this.popupView) {
      const annotation = this.pdfApi.getItem(id) as Annotation
      if (annotation) {
        if (annotation.itemType === PdfItemType.TEXT ||
          annotation.itemType === PdfItemType.HIGHLIGHT ||
          annotation.itemType === PdfItemType.SQUIGGLY ||
          annotation.itemType === PdfItemType.UNDERLINE ||
          annotation.itemType === PdfItemType.STRIKE_OUT ||
          annotation.itemType === PdfItemType.INK ||
          annotation.itemType === PdfItemType.STAMP
        ) {
          (annotation as any).color = color
        }
        this.popupView.setColor(color)
        annotation.popup.color = color
        this.store.annotations.updateAnnotation(annotation)
        this.pdfApi.updateItem(annotation)
      }
    }
  }

  private toggleAnnotationLock() {
    console.log('toggle1', this.pdfApi)
    if (this.pdfApi) {
      console.log('toggle2')
      const annotation = this.updateSelectedPopupContent(false)
      console.log('annotation', annotation)
      if (annotation) {
        if (this.options.ms_custom) {
          addHistoryEntry(annotation, 'lock', this.options.author)
        }
        if (this.popupView) {
          this.popupView.setLock(!annotation.isLocked())
        }
        annotation.setLock(!annotation.isLocked())
        this.store.annotations.updateAnnotation(annotation)
        this.pdfApi.updateItem(annotation)
      }
    }
  }

  private updateSelectedPopupContent(syncronize: boolean) {
    if (this.pdfApi) {
      if (this.popupView) {
        const state = this.popupView.getState()
        const id = state.id
        if (id) {
          const annotation = this.pdfApi.getItem(id) as Annotation
          if (annotation) {
            const content = state.content
            const subject = state.subject
            if (this.options.ms_custom) {
              addHistoryEntry(annotation, 'edit', this.options.author, content, subject)
            }
            annotation.content = content
            if (subject) {
              annotation.subject = subject
            }
            if (syncronize) {
              this.pdfApi.updateItem(annotation)
            } else {
              return annotation
            }
          }
        }
      }
    }
  }
  private formatDate(dateStr: string) {
    return `${dateStr.substr(8, 2)}.${dateStr.substr(6, 2)}.${dateStr.substr(2, 4)} ${dateStr.substr(10, 2)}:${dateStr.substr(12, 2)}`
  }

}
