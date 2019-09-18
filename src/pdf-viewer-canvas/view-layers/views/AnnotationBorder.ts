import { Rect, Point, Annotation } from '../../../pdf-viewer-api'
import { DragMoveHandler, DragMoveEvent, DragMoveEndEvent } from '../../../common/DragMoveHandler'
import { getAnnotationBehaviors } from '../../AnnotationBehaviors'

enum ResizeDir {
  NW = 1,
  NE = 2,
  SW = 3,
  SE = 4,
}

/** @internal */
export class AnnotationBorder {

  private annotationId: number | null = null
  private movable: boolean = false
  private resizable: boolean = false
  private aspectRatio: number | null = null
  private pageRect: Rect | null = null

  private element: HTMLElement
  private border: HTMLElement
  private dragElement: HTMLElement
  private dragHandler: DragMoveHandler

  private resizeElementNw: HTMLElement
  private resizeElementNe: HTMLElement
  private resizeElementSw: HTMLElement
  private resizeElementSe: HTMLElement

  private resizeHandlerNw: DragMoveHandler
  private resizeHandlerNe: DragMoveHandler
  private resizeHandlerSw: DragMoveHandler
  private resizeHandlerSe: DragMoveHandler

  private dragOffsetX: number = 0
  private dragOffsetY: number = 0
  private containerOffsetX: number = 0
  private containerOffsetY: number = 0

  private onMoved: (id: number, newPosition: Point) => void
  private onResized: (id: number, newRect: Rect) => void
  private onDblClick: (id: number) => void
  private resizeDir: ResizeDir | null = null
  private minSize = 24

  constructor(element: HTMLElement, onMoved: (id: number, newPosition: Point) => void,
              onResized: (id: number, newRect: Rect) => void, onDblClick: (id: number) => void) {
    this.startMove = this.startMove.bind(this)
    this.moving = this.moving.bind(this)
    this.endMove = this.endMove.bind(this)
    this.click = this.click.bind(this)
    this.dblClick = this.dblClick.bind(this)

    this.setAnnotation = this.setAnnotation.bind(this)
    this.deselectAnnotation = this.deselectAnnotation.bind(this)
    this.startResize = this.startResize.bind(this)
    this.resizing = this.resizing.bind(this)
    this.resizeNoAspectRatio = this.resizeNoAspectRatio.bind(this)
    this.resizeWithAspectRatio = this.resizeWithAspectRatio.bind(this)
    this.endResize = this.endResize.bind(this)

    this.dragElement = document.createElement('div')
    this.border = document.createElement('div')
    this.resizeElementNw = document.createElement('div')
    this.resizeElementNe = document.createElement('div')
    this.resizeElementSw = document.createElement('div')
    this.resizeElementSe = document.createElement('div')

    this.onMoved = onMoved
    this.onResized = onResized
    this.onDblClick = onDblClick
    this.element = element

    this.element.appendChild(this.dragElement)
    this.dragElement.classList.add('pwv-annotation-border-draghandle')
    this.dragElement.style.display = 'none'
    this.dragHandler = new DragMoveHandler(this.dragElement, this.startMove, this.moving, this.endMove, this.click, this.dblClick)
    this.dragHandler.suspend()

    this.element.appendChild(this.border)
    this.border.classList.add('pwv-annotation-border')

    this.element.appendChild(this.resizeElementNw)
    this.resizeElementNw.classList.add('pwv-annotation-border-resizehandle-nw')
    this.resizeElementNw.style.display = 'none'
    this.resizeHandlerNw = new DragMoveHandler(this.resizeElementNw, this.startResize, this.resizing, this.endResize)
    this.resizeHandlerNw.suspend()

    this.element.appendChild(this.resizeElementNe)
    this.resizeElementNe.classList.add('pwv-annotation-border-resizehandle-ne')
    this.resizeElementNe.style.display = 'none'
    this.resizeHandlerNe = new DragMoveHandler(this.resizeElementNe, this.startResize, this.resizing, this.endResize)
    this.resizeHandlerNe.suspend()

    this.element.appendChild(this.resizeElementSw)
    this.resizeElementSw.classList.add('pwv-annotation-border-resizehandle-sw')
    this.resizeElementSw.style.display = 'none'
    this.resizeHandlerSw = new DragMoveHandler(this.resizeElementSw, this.startResize, this.resizing, this.endResize)
    this.resizeHandlerSw.suspend()

    this.element.appendChild(this.resizeElementSe)
    this.resizeElementSe.classList.add('pwv-annotation-border-resizehandle-se')
    this.resizeElementSe.style.display = 'none'
    this.resizeHandlerSe = new DragMoveHandler(this.resizeElementSe, this.startResize, this.resizing, this.endResize)
    this.resizeHandlerSe.suspend()

  }

  public setAnnotation(annotation: Annotation, pageRect: Rect) {
    const behaviors = getAnnotationBehaviors(annotation.itemType)
    this.annotationId = annotation.id
    this.movable = behaviors.movable && !annotation.isLocked()
    this.resizable = behaviors.resizable && !annotation.isLocked()
    this.aspectRatio = behaviors.aspectRatioChangeable ? null : annotation.pdfRect.pdfW / annotation.pdfRect.pdfH
    this.pageRect = pageRect

    if (this.movable) {
      this.dragElement.style.display = 'block'
    }

    if (this.resizable) {
      this.resizeElementNw.style.display = 'block'
      this.resizeElementNe.style.display = 'block'
      this.resizeElementSw.style.display = 'block'
      this.resizeElementSe.style.display = 'block'
    }

    window.setTimeout(() => {
      if (this.movable) {
        this.dragHandler.resume()
      }
      if (this.resizable) {
        this.resizeHandlerNw.resume()
        this.resizeHandlerNe.resume()
        this.resizeHandlerSw.resume()
        this.resizeHandlerSe.resume()
      }
    }, 100)
  }

  public deselectAnnotation() {
    this.annotationId = null
    this.movable = false
    this.resizable = false
    this.aspectRatio = 0
    this.pageRect = null

    this.dragHandler.suspend()
    this.resizeHandlerNw.suspend()
    this.resizeHandlerNe.suspend()
    this.resizeHandlerSw.suspend()
    this.resizeHandlerSe.suspend()

    this.dragElement.style.display = 'none'
    this.resizeElementNw.style.display = 'none'
    this.resizeElementNe.style.display = 'none'
    this.resizeElementSw.style.display = 'none'
    this.resizeElementSe.style.display = 'none'
  }

  public updatePageRect(pageRect: Rect) {
    this.pageRect = pageRect
  }

  private click() {
  }

  private dblClick() {
    if (this.annotationId) {
      this.onDblClick(this.annotationId)
    }
  }

  private startResize(e: DragMoveEvent) {
    if (e.element.classList.contains('pwv-annotation-border-resizehandle-nw')) {
      this.resizeDir = ResizeDir.NW
    } else if (e.element.classList.contains('pwv-annotation-border-resizehandle-ne')) {
      this.resizeDir = ResizeDir.NE
    } else if (e.element.classList.contains('pwv-annotation-border-resizehandle-sw')) {
      this.resizeDir = ResizeDir.SW
    } else if (e.element.classList.contains('pwv-annotation-border-resizehandle-se')) {
      this.resizeDir = ResizeDir.SE
    }
    this.element.classList.add('pwv-annotation-resizing')
  }

  private resizing(e: DragMoveEvent) {
    if (this.aspectRatio !== null) {
      this.resizeWithAspectRatio(e.clientX, e.clientY)
    } else {
      this.resizeNoAspectRatio(e.clientX, e.clientY)
    }
  }

  private resizeNoAspectRatio(clientX: number, clientY: number) {
    if (this.element && this.element.offsetParent && this.pageRect) {

      const offsetRect = this.element.offsetParent.getBoundingClientRect()
      const elementRect = this.element.getBoundingClientRect()

      const minLeft = this.pageRect.x / window.devicePixelRatio
      const maxLeft = minLeft + this.pageRect.w / window.devicePixelRatio
      const minTop = this.pageRect.y / window.devicePixelRatio
      const maxTop = minTop + this.pageRect.h / window.devicePixelRatio

      let pointerX = clientX - offsetRect.left
      if (pointerX < minLeft) {
        pointerX = minLeft
      } else if (pointerX > maxLeft) {
        pointerX = maxLeft
      }
      let pointerY = clientY - offsetRect.top
      if (pointerY < minTop) {
        pointerY = minTop
      } else if (pointerY > maxTop) {
        pointerY = maxTop
      }

      let topPos = elementRect.top - offsetRect.top
      let leftPos = elementRect.left - offsetRect.left
      let width = elementRect.width
      let height = elementRect.height

      // width ne se
      if (this.resizeDir === ResizeDir.NE || this.resizeDir === ResizeDir.SE) {
        width = pointerX - leftPos
        if (width < this.minSize) {
          width = this.minSize
        }
      }

      // width nw sw
      if (this.resizeDir === ResizeDir.NW || this.resizeDir === ResizeDir.SW) {
        width = (leftPos + width) - pointerX
        if (width < this.minSize) {
          width = this.minSize
          leftPos = elementRect.left - offsetRect.left + elementRect.width - width
        } else {
          leftPos = pointerX
        }
      }

      // height se sw
      if (this.resizeDir === ResizeDir.SE || this.resizeDir === ResizeDir.SW) {
        height = pointerY - topPos
        if (height < this.minSize) {
          height = this.minSize
        }
      }

      // height ne nw
      if (this.resizeDir === ResizeDir.NE || this.resizeDir === ResizeDir.NW) {
        height = (topPos + height) - pointerY
        if (height < this.minSize) {
          height = this.minSize
          topPos = elementRect.top - offsetRect.top + elementRect.height - height
        } else {
          topPos = pointerY
        }
      }

      this.element.style.top = topPos + 'px'
      this.element.style.left = leftPos + 'px'
      this.element.style.width = width + 'px'
      this.element.style.height = height + 'px'
    }
  }

  private resizeWithAspectRatio(clientX: number, clientY: number) {
    if (this.pageRect && this.aspectRatio !== null && this.element && this.element.offsetParent) {

      const offsetRect = this.element.offsetParent.getBoundingClientRect()
      const elementRect = this.element.getBoundingClientRect()

      const minLeft = this.pageRect.x / window.devicePixelRatio
      const maxLeft = minLeft + this.pageRect.w / window.devicePixelRatio
      const minTop = this.pageRect.y / window.devicePixelRatio
      const maxTop = minTop + this.pageRect.h / window.devicePixelRatio

      let pointerX = clientX - offsetRect.left
      if (pointerX < minLeft) {
        pointerX = minLeft
      } else if (pointerX > maxLeft) {
        pointerX = maxLeft
      }
      let pointerY = clientY - offsetRect.top
      if (pointerY < minTop) {
        pointerY = minTop
      } else if (pointerY > maxTop) {
        pointerY = maxTop
      }

      let topPos = elementRect.top - offsetRect.top
      let leftPos = elementRect.left - offsetRect.left
      let width = elementRect.width
      let height = elementRect.height

      const calcSize = (w: number, h: number, r: number) => {
        const size = { w, h }
        if (w / h < r) {
          size.w = Math.max(w, this.minSize)
          size.h = size.w / r
          if (size.h < this.minSize) {
            size.h = this.minSize
            size.w = size.h * r
          }
        } else {
          size.h = Math.max(h, this.minSize)
          size.w = size.h * r
          if (size.w < this.minSize) {
            size.w = this.minSize
            size.h = size.w * r
          }
        }
        return size
      }

      // resize nw (top left)
      if (this.resizeDir === ResizeDir.NW) {
        const w = leftPos + width - pointerX
        const h = topPos + height - pointerY
        const size = calcSize(w, h, this.aspectRatio)
        leftPos = leftPos + width - size.w
        topPos = topPos + height - size.h
        width = size.w
        height = size.h
      }

      // resize ne (top right)
      if (this.resizeDir === ResizeDir.NE) {
        const w = pointerX - leftPos
        const h = topPos + height - pointerY
        const size = calcSize(w, h, this.aspectRatio)
        topPos = topPos + height - size.h
        width = size.w
        height = size.h
      }

      // resize sw (bottom left)
      if (this.resizeDir === ResizeDir.SW) {
        const w = leftPos + width - pointerX
        const h = pointerY - topPos
        const size = calcSize(w, h, this.aspectRatio)
        leftPos = leftPos + width - size.w
        width = size.w
        height = size.h
      }

      // resize se (bottom right)
      if (this.resizeDir === ResizeDir.SE) {
        const w = pointerX - leftPos
        const h = pointerY - topPos
        const size = calcSize(w, h, this.aspectRatio)
        width = size.w
        height = size.h
      }

      this.element.style.top = topPos + 'px'
      this.element.style.left = leftPos + 'px'
      this.element.style.width = width + 'px'
      this.element.style.height = height + 'px'
    }
  }

  private endResize(e: DragMoveEndEvent) {
    if (e.moved && this.annotationId) {
      this.onResized(this.annotationId, {
        x: this.element.offsetLeft,
        y: this.element.offsetTop,
        w: this.element.offsetWidth,
        h: this.element.offsetHeight,
      })
    }
    this.element.classList.remove('pwv-annotation-resizing')
  }

  private startMove(e: DragMoveEvent) {
    const elementRect = this.element.getBoundingClientRect()
    const offsetParent = this.element.offsetParent as HTMLElement
    const offsetParentRect = offsetParent.getBoundingClientRect()

    this.dragOffsetX = e.clientX - elementRect.left
    this.dragOffsetY = e.clientY - elementRect.top
    this.containerOffsetX = offsetParentRect.left
    this.containerOffsetY = offsetParentRect.top

    this.element.classList.add('pwv-annotation-moving')
  }

  private moving(e: DragMoveEvent) {
    if (this.pageRect) {
      const minLeft = this.pageRect.x / devicePixelRatio
      const maxLeft = (minLeft + this.pageRect.w / devicePixelRatio) - this.element.offsetWidth
      const minTop = this.pageRect.y / devicePixelRatio
      const maxTop = (minTop + this.pageRect.h / devicePixelRatio) - this.element.offsetHeight

      let topPos = (e.clientY - this.containerOffsetY - this.dragOffsetY)
      let leftPos = (e.clientX - this.containerOffsetX - this.dragOffsetX)

      if (topPos < minTop) {
        topPos = minTop
      } else if (topPos > maxTop) {
        topPos = maxTop
      }

      if (leftPos < minLeft) {
        leftPos = minLeft
      } else if (leftPos > maxLeft) {
        leftPos = maxLeft
      }

      this.element.style.top = topPos + 'px'
      this.element.style.left = leftPos + 'px'
    }
  }

  private endMove(e: DragMoveEndEvent) {
    if (e.moved && this.annotationId) {
      this.onMoved(this.annotationId, {
        x: this.element.offsetLeft,
        y: this.element.offsetTop,
      })
    }
    this.element.classList.remove('pwv-annotation-moving')
  }
}
