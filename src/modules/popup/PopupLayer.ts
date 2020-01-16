import { CanvasLayer } from '../CanvasLayer'
import { createPopupView, PopupViewActions } from './Popup'
import { getPopups, getOpenPopups } from '../../pdf-viewer-canvas/state/annotations'
import { ViewerCanvasState } from '../../pdf-viewer-canvas/state/store'
import { Annotation, PdfRect, PdfItemType, Point, Rect } from '../../pdf-viewer-api'
import { renderPopupMarker } from '../../pdf-viewer-canvas/view-layers/canvasShapes'
import { ViewerMode, CursorStyle } from '../../pdf-viewer-canvas/state/viewer'
import { Color } from '../../common/Color'
import { getColorPalette, createPdfTime } from '../../common/Tools'

export class PopupLayer extends CanvasLayer {

  private popupViewElement: HTMLElement | undefined
  private popupView: PopupViewActions | null = null
  private context: CanvasRenderingContext2D | null = null
  private maxPopupWidth: number = 480
  private maxPopupHeight: number = 320
  private zoom = 0
  private screenToPdfScale = 0

  public onCreate(): void {

    this.drawPopupRelation = this.drawPopupRelation.bind(this)
    this.popupMoved = this.popupMoved.bind(this)
    this.selectPopup = this.selectPopup.bind(this)
    this.deselectPopup = this.deselectPopup.bind(this)
    this.openPopup = this.openPopup.bind(this)
    this.closePopup = this.closePopup.bind(this)
    this.deletePopup = this.deletePopup.bind(this)
    this.updatePopupContent = this.updatePopupContent.bind(this)
    this.updatePopupPosition = this.updatePopupPosition.bind(this)
    this.updatePopupSize = this.updatePopupSize.bind(this)
    this.updatePopupColor = this.updatePopupColor.bind(this)

    if (this.containerElement) {
      const maxWidth = this.containerElement.offsetWidth * .75
      const maxHeight = this.containerElement.offsetHeight * .75
      this.maxPopupWidth = maxWidth < this.maxPopupWidth ? maxWidth : this.maxPopupWidth
      this.maxPopupHeight = maxHeight < this.maxPopupHeight ? maxHeight : this.maxPopupHeight
    }
    this.context = this.createCanvas()
    this.createPopupView()
    window.addEventListener('pdfwebviewer.PopupMoved', this.popupMoved, false)
  }

  public onRemove(): void {
  }

  public render(timestamp: number, state: ViewerCanvasState) {

    if (this.pdfApi && this.popupView && this.popupViewElement) {

      if (state.document.zoomChanged && state.document.zoom !== this.zoom) {
        this.zoom = state.document.zoom
        this.screenToPdfScale = this.pdfApi.transformPdfLengthToDeviceLength(100) / 100 / this.zoom
      }

      /* tslint:disable-next-line:max-line-length */
      if (state.annotations.openPopupChanged || state.document.firstVisiblePageChanged || state.document.lastVisiblePageChanged || state.viewer.modeChanged) {
        this.updateOpenPopupList(state)
      }

      if (state.viewer.selectedPopupChanged) {
        const selectedPopup = this.popupView.getState().selectedPopup
        if (state.viewer.selectedPopupId) {
          if (selectedPopup !== state.viewer.selectedPopupId) {
            this.popupView.selectPopup(state.viewer.selectedPopupId)
          }
        }
      }

      const viewerMode = state.viewer.mode
      if (viewerMode === ViewerMode.POPUP_SELECTED) {
        this.store.viewer.setCursorStyle(CursorStyle.DEFAULT)
      }

      const popupsVisible = viewerMode === ViewerMode.DEFAULT || viewerMode === ViewerMode.POPUP_SELECTED
      if (state.viewer.modeChanged) {
        if (popupsVisible) {
          this.popupViewElement.style.display = 'block'
        } else {
          this.popupViewElement.style.display = 'none'
          const ctx = this.context as CanvasRenderingContext2D
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        }
      }

      if (viewerMode === ViewerMode.POPUP_SELECTED && state.pointer.action === 'click') {
        this.deselectPopup()
      }

      const openPopups = this.popupView.getState().openPopups

      const updatePopupPosition = state.canvas.canvasInvalidated || openPopups.find(p => !p.positionCalculated)
      if (openPopups.length > 0 && updatePopupPosition) {

        const popupElements = this.popupViewElement.querySelectorAll('.pwv-popup')

        const canvasWidth = state.canvas.width.cssPixels
        const canvasHeight = state.canvas.height.cssPixels
        const zoom = state.document.zoom

        for (let i = 0; i < popupElements.length; i++) {
          const popupElement = popupElements[i] as HTMLElement
          if (!popupElement.classList.contains('pwv-popup-moving')) {
            const id = popupElement.dataset.id
            const popup = openPopups.find(p => p.id.toString() === id)
            if (popup) {
              const screenRect = this.pdfApi.transformPdfPageRectToScreenRect(popup.pdfRect)
              let x = screenRect.x / devicePixelRatio
              let y = screenRect.y / devicePixelRatio
              const w = parseInt(popupElement.style.width as string, undefined)
              const h = parseInt(popupElement.style.height as string, undefined)
              const padding = 8

              if (x < padding) {
                x = padding
              } else if (x + w + padding * 2 > canvasWidth) {
                x = canvasWidth - (w + padding * 2)
              }
              if (y < padding) {
                y = padding
              } else if (y + h + padding * 2 > canvasHeight) {
                y = canvasHeight - (h + padding * 2)
              }
              popupElement.style.top = `${y}px`
              popupElement.style.left = `${x}px`

              if (!popup.positionCalculated) {
                this.popupView.setPositionCalculated(popup.id)
              }
            }
          }
        }
      }

      if ((state.viewer.mode === ViewerMode.POPUP_SELECTED || state.viewer.mode === ViewerMode.DEFAULT) &&
        (state.viewer.selectedPopupChanged || state.canvas.canvasInvalidated || state.pointer.positionChanged || state.annotations.openPopupChanged)
      ) {
        const ctx = this.context as CanvasRenderingContext2D
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        const scale = state.canvas.pixelRatio * state.document.zoom

        if (viewerMode !== ViewerMode.POPUP_SELECTED) {
          const popups = getPopups(state.annotations, state.document.firstVisiblePage, state.document.lastVisiblePage)
          if (popups === null) {
            return
          }
          for (let i = 0; i < popups.length; i++) {
            const popup = popups[i]
            if (popup.itemType !== PdfItemType.TEXT) {

              let pos: Point

              if (popup.itemType === PdfItemType.HIGHLIGHT ||
                popup.itemType === PdfItemType.UNDERLINE ||
                popup.itemType === PdfItemType.SQUIGGLY ||
                popup.itemType === PdfItemType.STRIKE_OUT
              ) {
                const highlightAnnotation = popup as any
                pos = this.pdfApi.transformPdfPageRectToScreenRect(highlightAnnotation.quadPointRects[0])

              } else {
                pos = this.pdfApi.transformPdfPageRectToScreenRect(popup.pdfRect)
              }

              ctx.lineWidth = 1
              ctx.beginPath()
              const r = 12 * scale
              const posX = pos.x + r / 2
              const posY = pos.y - r

              ctx.arc(posX, posY, r, 0, 2 * Math.PI)
              if (ctx.isPointInPath(state.pointer.x.devicePixels, state.pointer.y.devicePixels)) {
                this.store.viewer.setCursorStyle(CursorStyle.POINTER)
                ctx.globalAlpha = 0.15
                ctx.fillStyle = this.options.textSelectionColor
                ctx.fill()
                ctx.globalAlpha = 1
                if (state.pointer.action === 'click') {
                  this.openPopup(popup.id)
                }
              }
              renderPopupMarker(ctx, scale, popup.color || this.options.defaultHighlightColor, { x: posX, y: posY })
            }
          }
        }

        if (openPopups.length > 0) {
          const popupElements = this.popupViewElement.querySelectorAll('.pwv-popup:hover, .pwv-popup.pwv-popup-selected')

          for (let i = 0; i < popupElements.length; i++) {
            const popupElement = popupElements[i] as HTMLElement
            const id = popupElement.dataset.id ? parseInt(popupElement.dataset.id, undefined) : -1
            this.drawPopupRelation(ctx, id, {
              x: popupElement.offsetLeft,
              y: popupElement.offsetTop,
              w: popupElement.offsetWidth,
              h: popupElement.offsetHeight,
            },
              popupElement.style.backgroundColor,
              id === state.viewer.selectedPopupId,
            )
          }
        }
      }
    }
  }

  private updateOpenPopupList(state: ViewerCanvasState) {
    if (this.popupView) {
      const openPopups = getOpenPopups(state.annotations, state.document.firstVisiblePage, state.document.lastVisiblePage)

      const zoom = state.document.zoom
      const popups = openPopups.map(an => {
        const width = this.pdfApi.transformPdfLengthToDeviceLength(an.popup.pdfRect.pdfW) / zoom
        const height = this.pdfApi.transformPdfLengthToDeviceLength(an.popup.pdfRect.pdfH) / zoom
        // Take last modified date, author and color
        // from parent annotation
        return {
          id: an.id,
          colorPalette: getColorPalette(an.itemType, this.options),
          content: an.content as string,
          lastModified: this.formatDate(an.lastModified),
          originalAuthor: an.originalAuthor,
          color: an.color,
          isLocked: an.isLocked(),
          selected: false,
          positionCalculated: false,
          pdfRect: an.popup.pdfRect,
          cssWidth: width < this.maxPopupWidth ? width : this.maxPopupWidth,
          cssHeight: height < this.maxPopupHeight ? height : this.maxPopupHeight,
        }
      })

      this.popupView.updateOpenPopups(popups)
    }
  }

  private drawPopupRelation(ctx: CanvasRenderingContext2D, annotationId: number, popupRect: Rect, color: string | null, selected: boolean) {
    const annotation = this.pdfApi.getItem(annotationId) as Annotation

    if (annotation) {
      const annotationRect = this.pdfApi.transformPdfPageRectToScreenRect(annotation.pdfRect)

      const popupX1 = popupRect.x * devicePixelRatio
      const popupX2 = popupX1 + popupRect.w * devicePixelRatio
      const popupXc = popupX1 + (popupRect.w / 2 * devicePixelRatio)
      const popupY1 = popupRect.y * devicePixelRatio
      const popupY2 = popupY1 + popupRect.h * devicePixelRatio
      const popupYc = popupY1 + (popupRect.h / 2 * devicePixelRatio)

      const annotationX1 = annotationRect.x
      const annotationX2 = annotationX1 + annotationRect.w
      const annotationY1 = annotationRect.y
      const annotationY2 = annotationY1 + annotationRect.h

      let popupRelX = popupX1
      let popupRelY = popupY1
      let annotationRelX = annotationX1
      let annotationRelY = annotationY1

      if (popupX2 <= annotationX1) {
        popupRelX = popupX2
        annotationRelX = annotationX1
      }

      if (popupX1 >= annotationX2) {
        popupRelX = popupX1
        annotationRelX = annotationX2
      }

      if (popupY2 <= annotationY1) {
        popupRelY = popupY2
        annotationRelY = annotationY1
      }

      if (popupY1 >= annotationY2) {
        popupRelY = popupY1
        annotationRelY = annotationY2
      }

      if (popupX2 >= annotationX1 && popupX1 <= annotationX2) {
        const x = (popupXc < annotationX1) ? annotationX1 :
          (popupXc > annotationX2) ? annotationX2 : popupXc
        popupRelX = x
        annotationRelX = x
      }

      if (popupY2 >= annotationY1 && popupY1 <= annotationY2) {
        const y = (popupYc < annotationY1) ? annotationY1 :
          (popupYc > annotationY2) ? annotationY2 : popupYc
        popupRelY = y
        annotationRelY = y
      }

      ctx.save()

      if (color) {
        const rgbColor = new Color(color)
        rgbColor.darken(20)
        if (!selected) {
          rgbColor.setOpacity(0.8)
        }
        ctx.strokeStyle = rgbColor.toRgba()
        ctx.fillStyle = rgbColor.toRgba()
      }

      ctx.lineWidth = 2 * window.devicePixelRatio
      if (!selected) {
        ctx.setLineDash([ctx.lineWidth])
      }

      ctx.beginPath()
      ctx.moveTo(annotationRelX, annotationRelY)
      ctx.lineTo(popupRelX, popupRelY)
      ctx.stroke()
      ctx.strokeRect(annotationX1, annotationY1, annotationRect.w, annotationRect.h)
      ctx.restore()
    }

    ctx.restore()
  }

  private popupMoved(event: any) {
    if (this.context !== null && event.detail) {
      this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height)
      this.drawPopupRelation(this.context, event.detail.annotationId, event.detail.popupRect, event.detail.color, true)
    }
  }

  private createPopupView() {
    if (this.containerElement) {
      this.popupViewElement = this.createHtmlLayer()

      this.popupView = createPopupView({
        maxPopupWidth: this.maxPopupWidth,
        maxPopupHeight: this.maxPopupHeight,
        onSelect: this.selectPopup,
        onDeselect: this.deselectPopup,
        onClose: this.closePopup,
        onDelete: this.deletePopup,
        onUpdateContent: this.updatePopupContent,
        onUpdatePosition: this.updatePopupPosition,
        onUpdateSize: this.updatePopupSize,
        onUpdateColor: this.updatePopupColor,
      }, this.popupViewElement)
    }
  }

  private selectPopup(id: number) {
    if (this.popupView) {
      this.popupView.selectPopup(id)
      this.store.viewer.selectPopup(id)
    }
  }

  private deselectPopup() {
    if (this.popupView) {
      this.popupView.deselectPopup()
      this.store.viewer.selectPopup(null)
    }
  }

  private openPopup(id: number) {
    if (this.pdfApi) {
      const annotation = this.pdfApi.getItem(id) as Annotation
      if (annotation) {
        annotation.popup.isOpen = true
        this.store.annotations.updateAnnotation(annotation)
        this.pdfApi.updateItem(annotation)
          .then(() => {
            this.selectPopup(annotation.id)
          })
      }
    }
  }

  private closePopup(id: number, content: string) {
    if (this.pdfApi) {
      this.deselectPopup()
      const item = this.pdfApi.getItem(id) as Annotation
      if (item) {
        item.popup.isOpen = false
        item.content = content
        this.store.annotations.updateAnnotation(item)
        this.pdfApi.updateItem(item)
      }
    }
  }

  private deletePopup(id: number) {
    if (this.pdfApi) {
      this.deselectPopup()
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
        if (this.options.ms_custom) {
          const params = []
          if (annotation.content !== content) {
            params.push('/Contents')
            params.push(content)
          }
          if (params.length > 0) {
            annotation.custom.push({Type: '/Edit', D: createPdfTime(), Parms: params, T: this.options.author})
          }
        }
        annotation.content = content
        this.pdfApi.updateItem(annotation)
      }
    }
  }

  private updatePopupPosition(id: number, x: number, y: number) {
    if (this.pdfApi) {
      const annotation = this.pdfApi.getItem(id) as Annotation
      if (annotation) {
        const newPdfPos = this.pdfApi.transformScreenPointToPdfPoint({
          x: x * window.devicePixelRatio,
          y: y * window.devicePixelRatio,
        }, annotation.pdfRect.page).pdfPoint
        if (annotation.popup.pdfRect.pdfX !== newPdfPos.pdfX || annotation.popup.pdfRect.pdfY !== newPdfPos.pdfY) {
          annotation.popup.pdfRect.pdfX = newPdfPos.pdfX
          annotation.popup.pdfRect.pdfY = newPdfPos.pdfY
          this.store.annotations.updateAnnotation(annotation)
          this.pdfApi.updateItem(annotation)
        }
      }
    }
  }

  private updatePopupSize(id: number, w: number, h: number) {
    if (this.pdfApi) {
      const annotation = this.pdfApi.getItem(id) as Annotation
      if (annotation) {
        const newWidth = w / this.screenToPdfScale
        const newHeight = h / this.screenToPdfScale
        if (annotation.popup.pdfRect.pdfW !== newWidth || annotation.popup.pdfRect.pdfH !== newHeight) {
          annotation.popup.pdfRect.pdfW = newWidth
          annotation.popup.pdfRect.pdfH = newHeight
          this.store.annotations.updateAnnotation(annotation)
          this.pdfApi.updateItem(annotation)
        }
      }
    }
  }

  private updatePopupColor(id: number, color: string) {
    if (this.pdfApi) {
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
        annotation.popup.color = color
        this.store.annotations.updateAnnotation(annotation)
        this.pdfApi.updateItem(annotation)
      }
    }
  }

  private formatDate(dateStr: string) {
    return `${dateStr.substr(8, 2)}.${dateStr.substr(6, 2)}.${dateStr.substr(2, 4)} ${dateStr.substr(10, 2)}:${dateStr.substr(12, 2)}`
  }

}
