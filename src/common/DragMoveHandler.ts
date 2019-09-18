
/** @internal */
export interface DragMoveEvent {
  clientX: number,
  clientY: number,
  movementX: number,
  movementY: number,
  element: HTMLElement,
}

/** @internal */
export interface DragMoveEndEvent extends DragMoveEvent {
  moved: boolean
}

type DragMoveEventHandler = (e: DragMoveEvent) => void
type DragMoveEndEventHandler = (e: DragMoveEndEvent) => void

export class DragMoveHandler {

  private element: HTMLElement
  private onDragStart: DragMoveEventHandler
  private onDragMove: DragMoveEventHandler
  private onDragEnd: DragMoveEndEventHandler
  private onClick?: DragMoveEventHandler
  private onDblClick?: DragMoveEventHandler
  private disableCanvasEvents: boolean
  private lastPosX: number = 0
  private lastPosY: number = 0
  private startPosX: number = 0
  private startPosY: number = 0
  private isSuspended = false

  private dragging: boolean = false
  private clickTimer: number | null = null
  private dragStartTimer: number | null = null
  private readonly clickDuration = 250
  private readonly dragStartDuration = 300
  private dblClickTimer: number | null = null
  private readonly dblClickDuration: number = 250

  /* tslint:disable-next-line:max-line-length */
  constructor(element: HTMLElement, onDragStart: DragMoveEventHandler, onDragMove: DragMoveEventHandler,
              onDragEnd: DragMoveEndEventHandler, onClick?: DragMoveEventHandler, onDblClick?: DragMoveEventHandler) {
    this.suspend = this.suspend.bind(this)
    this.resume = this.resume.bind(this)
    this.onMouseDown = this.onMouseDown.bind(this)
    this.onTouchStart = this.onTouchStart.bind(this)
    this.start = this.start.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onTouchMove = this.onTouchMove.bind(this)
    this.move = this.move.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
    this.onTouchEnd = this.onTouchEnd.bind(this)
    this.end = this.end.bind(this)
    this.element = element
    this.onDragStart = onDragStart
    this.onDragMove = onDragMove
    this.onDragEnd = onDragEnd
    this.onClick = onClick
    this.onDblClick = onDblClick
    this.disableCanvasEvents = true

    this.element.addEventListener('mousedown', this.onMouseDown, {passive: true})
    this.element.addEventListener('touchstart', this.onTouchStart, {passive: false})
  }

  public suspend() {
    window.removeEventListener('mousemove', this.onMouseMove)
    window.removeEventListener('mouseup', this.onMouseUp)
    window.removeEventListener('touchmove', this.onTouchMove)
    window.removeEventListener('touchend', this.onTouchEnd)
    this.element.removeEventListener('mousedown', this.onMouseDown)
    this.element.removeEventListener('touchstart', this.onTouchStart)
    this.isSuspended = true
  }

  public resume() {
    if (this.isSuspended) {
      this.element.addEventListener('mousedown', this.onMouseDown, {passive: true})
      this.element.addEventListener('touchstart', this.onTouchStart, {passive: false})
    }
  }

  private clearClickTimer() {
    if (this.clickTimer !== null) {
      window.clearTimeout(this.clickTimer)
      this.clickTimer = null
    }
  }

  private clearDblClickTimer() {
    if (this.dblClickTimer !== null) {
      window.clearTimeout(this.dblClickTimer)
      this.dblClickTimer = null
    }
  }

  private clearDragStartTimer() {
    if (this.dragStartTimer !== null) {
      window.clearTimeout(this.dragStartTimer)
      this.dragStartTimer = null
    }
  }

  private onMouseDown(e: MouseEvent) {
    if (e.buttons === 1) {
      this.start(e.clientX, e.clientY)
      window.addEventListener('mousemove', this.onMouseMove, {passive: true})
      window.addEventListener('mouseup', this.onMouseUp, {passive: true})
    }
  }

  private onTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      this.start(e.touches[0].clientX, e.touches[0].clientY)
      window.addEventListener('touchmove', this.onTouchMove, {passive: false})
      window.addEventListener('touchend', this.onTouchEnd, {passive: false})
    }
  }

  private start(clientX: number, clientY: number) {
    if (this.disableCanvasEvents) {
      window.dispatchEvent(new Event('pdfwebviewer.DragMoveHandlerStart'))
    }
    this.startPosX = this.lastPosX = clientX
    this.startPosY = this.lastPosY = clientY
    this.dragging = false

    if (!this.dblClickTimer) {
      this.clickTimer = window.setTimeout(() => {
        this.clickTimer = null
      }, this.clickDuration)
      this.dragStartTimer = window.setTimeout(() => {
        this.dragging = true
        this.onDragStart({ clientX: this.startPosX, clientY: this.startPosY, movementX: 0, movementY: 0, element: this.element })
      }, this.dragStartDuration)
    }
  }

  private onMouseMove(e: MouseEvent) {
    this.move(e.clientX, e.clientY)
  }

  private onTouchMove(e: TouchEvent) {
    this.move(e.touches[0].clientX, e.touches[0].clientY)
  }

  private move(clientX: number, clientY: number) {
    let movementX = clientX - this.lastPosX
    let movementY = clientY - this.lastPosY
    this.lastPosX = clientX
    this.lastPosY = clientY

    if (this.clickTimer || this.dragStartTimer) {
      if (Math.abs(movementX) > 5 || Math.abs(movementY) > 5) {
        this.clearClickTimer()
        this.clearDragStartTimer()
        this.dragging = true
        this.onDragStart({ clientX: this.startPosX, clientY: this.startPosY, movementX: 0, movementY: 0, element: this.element })
        movementX = clientX - this.startPosX
        movementY = clientY - this.startPosY
      }
    }

    if (this.dragging) {
      this.onDragMove({ clientX, clientY, movementX, movementY, element: this.element })
    }
  }

  private onMouseUp(e: MouseEvent) {
    window.removeEventListener('mousemove', this.onMouseMove)
    window.removeEventListener('mouseup', this.onMouseUp)
    this.end()
  }

  private onTouchEnd(e: TouchEvent) {
    window.removeEventListener('touchmove', this.onTouchMove)
    window.removeEventListener('touchend', this.onTouchEnd)
    this.end()
  }

  private end() {
    const moved = this.startPosX !== this.lastPosX || this.startPosY !== this.lastPosY
    const clientX = this.lastPosX
    const clientY = this.lastPosY

    if (this.disableCanvasEvents) {
      window.dispatchEvent(new Event('pdfwebviewer.DragMoveHandlerEnd'))
    }

    if (this.dblClickTimer !== null) {
      this.clearDblClickTimer()
      if (this.onDblClick) {
        this.onDblClick({ clientX, clientY, movementX: 0, movementY: 0, element: this.element })
      }
    } else if (this.clickTimer !== null) {
      if (this.onClick) {
        this.onClick({ clientX, clientY, movementX: 0, movementY: 0, element: this.element })
      }
      this.dblClickTimer = window.setTimeout(() => {
        this.dblClickTimer = null
      }, this.dblClickDuration)
    }
    if (this.dragging) {
      this.onDragEnd({ clientX, clientY, movementX: 0, movementY: 0, moved, element: this.element })
    }
    this.clearClickTimer()
    this.clearDragStartTimer()
  }

}
