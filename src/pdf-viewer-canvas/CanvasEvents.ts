
export interface CanvasPointerEvent {
  clientX: number,
  clientY: number,
  movementX: number,
  movementY: number,
  buttons: number,
  type: 'mouse' | 'touch'
}
export interface CanvasPointerPinchEvent extends CanvasPointerEvent {
  distance: number,
  movementDistance: number,
}

/** @internal */
export interface CanvasEventsEventMap {
  pointerdown: CanvasPointerEvent
  pointermove: CanvasPointerEvent
  pointerstartdrag: CanvasPointerEvent
  pointerenddrag: CanvasPointerEvent
  pointerup: CanvasPointerEvent
  pointerclick: CanvasPointerEvent
  pointerdblclick: CanvasPointerEvent
  pointerlongpress: CanvasPointerEvent
  pinch: CanvasPointerPinchEvent
}

/** @internal */
export type CanvasEventsEventListener = <K extends keyof CanvasEventsEventMap>(e: CanvasEventsEventMap[K]) => void

/** @internal */
export type CanvasEventsEventTypes = keyof CanvasEventsEventMap

/** @internal */
export class CanvasEvents {

  private eventListeners = new Map<CanvasEventsEventTypes, CanvasEventsEventListener[]>()
  private element: HTMLElement
  private trackEvents: boolean = true
  private startPosX: number = 0
  private startPosY: number = 0
  private multiTouch: boolean = false
  private pinch: boolean = false
  private dragging: boolean = false
  private lastPinchDiv: number = 0
  private lastTouchPosX: number = 0
  private lastTouchPosY: number = 0
  private lastTouchX1: number = 0
  private lastTouchY1: number = 0
  private lastTouchX2: number = 0
  private lastTouchY2: number = 0

  private clickTimer: number | null = null
  private readonly clickDuration = 250
  private dblClickTimer: number | null = null
  private readonly dblClickDuration: number = 250
  private longPressTimer: number | null = null
  private readonly longPressDuration = 750

  constructor(element: HTMLElement) {
    this.onMouseDown = this.onMouseDown.bind(this)
    this.onTouchStart = this.onTouchStart.bind(this)
    this.onStart = this.onStart.bind(this)

    this.onMouseMove = this.onMouseMove.bind(this)
    this.onTouchMove = this.onTouchMove.bind(this)
    this.onMove = this.onMove.bind(this)

    this.onMouseUp = this.onMouseUp.bind(this)
    this.onTouchEnd = this.onTouchEnd.bind(this)
    this.onEnd = this.onEnd.bind(this)

    this.suspend = this.suspend.bind(this)
    this.resume = this.resume.bind(this)

    this.element = element

    this.element.addEventListener('mousedown', this.onMouseDown, {passive: true})
    this.element.addEventListener('mousemove', this.onMouseMove, {passive: true})
    this.element.addEventListener('touchstart', this.onTouchStart, {passive: false})

    window.addEventListener('pdfwebviewer.DragMoveHandlerStart', () => { this.suspend() }, {passive: true})
    window.addEventListener('pdfwebviewer.DragMoveHandlerEnd', () => { this.resume() }, {passive: true})
  }

  public addEventListener<K extends keyof CanvasEventsEventMap>(type: K, listener: (e: CanvasEventsEventMap[K]) => void) {
    if (this.eventListeners.has(type)) {
      (this.eventListeners.get(type) as CanvasEventsEventListener[]).push(listener)
    } else {
      this.eventListeners.set(type, [listener])
    }
  }

  public removeEventListener<K extends keyof CanvasEventsEventMap>(type: K, listener: (e: CanvasEventsEventMap[K]) => void) {
    if (this.eventListeners.has(type)) {
      let listeners = this.eventListeners.get(type) as CanvasEventsEventListener[]
      listeners = listeners.filter(listenerInArray => listenerInArray !== listener)
      if (listeners.length !== 0) {
        this.eventListeners.set(type, listeners)
      } else {
        this.eventListeners.delete(type)
      }
    }
  }

  public suspend() {
    this.trackEvents = false
    this.element.removeEventListener('mousemove', this.onMouseMove)
    window.removeEventListener('mouseup', this.onMouseUp)
    window.removeEventListener('touchmove', this.onTouchMove)
    window.removeEventListener('touchend', this.onTouchEnd)
  }

  public resume() {
    if (!this.trackEvents) {
      this.trackEvents = true
      this.element.addEventListener('mousemove', this.onMouseMove, {passive: true})
    }
  }

  private dispatchEvent<K extends keyof CanvasEventsEventMap>(type: K, args: CanvasEventsEventMap[K]) {
    if (this.eventListeners.has(type)) {
      const listeners = this.eventListeners.get(type) as CanvasEventsEventListener[]
      listeners.forEach(listener => listener(args))
    }
  }

  private clearClickTimer() {
    if (this.clickTimer !== null) {
      window.clearTimeout(this.clickTimer)
      this.clickTimer = null
    }
  }

  private clearLongPressTimer() {
    if (this.longPressTimer !== null) {
      window.clearTimeout(this.longPressTimer)
      this.longPressTimer = null
    }
  }

  private clearDblClickTimer() {
    if (this.dblClickTimer !== null) {
      window.clearTimeout(this.dblClickTimer)
      this.dblClickTimer = null
    }
  }

  private mouseToCanvasPointerEvent(e: MouseEvent): CanvasPointerEvent {
    return {
      clientX: e.clientX,
      clientY: e.clientY,
      movementX: e.movementX,
      movementY: e.movementY,
      buttons: e.buttons,
      type: 'mouse',
    }
  }

  private touchToCanvasPointerEvent(e: TouchEvent): CanvasPointerEvent {
    const event: CanvasPointerEvent = {
      clientX: e.touches[0].clientX,
      clientY: e.touches[0].clientY,
      movementX: e.touches[0].clientX - this.lastTouchPosX,
      movementY: e.touches[0].clientY - this.lastTouchPosY,
      buttons: e.touches.length === 1 ? 1 : 4,
      type: 'touch',
    }

    this.lastTouchPosX = e.touches[0].clientX
    this.lastTouchPosY = e.touches[0].clientY

    return event
  }

  private touchToCanvasPointerPinchEvent(e: TouchEvent): CanvasPointerPinchEvent {
    const x1 = e.touches[0].clientX
    const y1 = e.touches[0].clientY
    const x2 = e.touches[1].clientX
    const y2 = e.touches[1].clientY
    const vx = Math.abs(x1 - x2)
    const vy = Math.abs(y1 - y2)
    const distance = Math.sqrt(vx * vx + vy * vy)
    const clientX = Math.min(x1, x2) + vx
    const clientY = Math.min(y1, y2) + vy
    const event: CanvasPointerPinchEvent = {
      clientX,
      clientY,
      movementX: clientX - this.lastTouchPosX,
      movementY: clientY - this.lastTouchPosY,
      distance,
      movementDistance: distance - this.lastPinchDiv,
      buttons: 1,
      type: 'touch',
    }
    this.lastTouchPosX = event.clientX
    this.lastTouchPosY = event.clientY
    this.lastPinchDiv = distance
    return event
  }

  private onMouseDown(e: MouseEvent) {
    if (this.trackEvents) {
      const event = this.mouseToCanvasPointerEvent(e)
      this.onStart(event)
      window.addEventListener('mouseup', this.onMouseUp, {passive: true})
    }
  }

  private onTouchStart(e: TouchEvent) {
    e.preventDefault()
    e.stopPropagation()

    this.pinch = false
    if (this.trackEvents) {

      if (e.touches.length === 0) {
        return
      } else if (e.touches.length === 1) {
        this.lastTouchPosX = e.touches[0].clientX
        this.lastTouchPosY = e.touches[0].clientY
        const event = this.touchToCanvasPointerEvent(e)
        this.onStart(event)

        window.addEventListener('touchmove', this.onTouchMove, {passive: false})
        window.addEventListener('touchend', this.onTouchEnd, {passive: false})

      } else if (e.touches.length === 2) {

        this.clearClickTimer()
        this.clearDblClickTimer()
        this.clearLongPressTimer()
        this.multiTouch = true

        this.lastTouchX1 = e.touches[0].clientX
        this.lastTouchY1 = e.touches[0].clientY
        this.lastTouchX2 = e.touches[1].clientX
        this.lastTouchY2 = e.touches[1].clientY

        window.addEventListener('touchmove', this.onTouchMove, {passive: false})
        window.addEventListener('touchend', this.onTouchEnd, {passive: false})
      }
    }
  }

  private onStart(e: CanvasPointerEvent) {
    this.startPosX = e.clientX
    this.startPosY = e.clientY
    this.dragging = false

    if (!this.dblClickTimer) {
      this.clickTimer = window.setTimeout(() => {
        this.clickTimer = null
      }, this.clickDuration)
    }

    this.longPressTimer = window.setTimeout(() => {
      this.longPressTimer = null
      this.dispatchEvent('pointerlongpress', e)
    }, this.longPressDuration)

    this.dispatchEvent('pointerdown', e)
  }

  private onMouseMove(e: MouseEvent) {
    const event = this.mouseToCanvasPointerEvent(e)
    this.onMove(event)
  }

  private onTouchMove(e: TouchEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!e.touches) {
      return
    }

    if (e.touches.length === 1 && !this.multiTouch) {
      const event = this.touchToCanvasPointerEvent(e)
      this.onMove(event)
    } else if (e.touches.length === 2) {
      const event = this.touchToCanvasPointerPinchEvent(e)

      const x1 = e.touches[0].clientX
      const y1 = e.touches[0].clientY
      const x2 = e.touches[1].clientX
      const y2 = e.touches[1].clientY

      const dX1 = x1 - this.lastTouchX1
      const dY1 = y1 - this.lastTouchY1
      const dX2 = x2 - this.lastTouchX2
      const dY2 = y2 - this.lastTouchY2

      const sX1 = Math.sign(dX1)
      const sY1 = Math.sign(dY1)
      const sX2 = Math.sign(dX2)
      const sY2 = Math.sign(dY2)

      if (
        (sX1 === sX2 && sY1 === sY2) ||
        ((sX1 === sX2 || dX1 === 0 || dX2 === 0) && (sY1 === sY2 || dY1 === 0 || dY2 === 0))
        || Math.max(Math.abs(event.movementX), Math.abs(event.movementY)) > Math.abs(event.movementDistance)
      ) {
        event.buttons = 4
        this.onMove(event)
        this.pinch = false
      } else {
        this.dispatchEvent('pinch', event)
        this.pinch = true
      }

      this.lastTouchX1 = e.touches[0].clientX
      this.lastTouchY1 = e.touches[0].clientY
      this.lastTouchX2 = e.touches[1].clientX
      this.lastTouchY2 = e.touches[1].clientY
    }
  }

  private onMove(e: CanvasPointerEvent) {
    this.dispatchEvent('pointermove', e)
    if (this.clickTimer || this.longPressTimer) {
      if (Math.abs(this.startPosX - e.clientX) > 5 || Math.abs(this.startPosY - e.clientY) > 5) {
        this.clearLongPressTimer()
        this.clearClickTimer()
        this.dispatchEvent('pointerstartdrag', e)
        this.dragging = true
      }
    } else if (e.buttons > 0 && !this.dragging) {
      this.dispatchEvent('pointerstartdrag', e)
      this.dragging = true
    }
  }

  private onMouseUp(e: MouseEvent) {
    const event = this.mouseToCanvasPointerEvent(e)
    this.onEnd(event)

    window.removeEventListener('mouseup', this.onMouseUp)
  }

  private onTouchEnd(e: TouchEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (e.touches.length === 0) {
      this.multiTouch = false
      const event: CanvasPointerEvent = {
        clientX: this.lastTouchPosX,
        clientY: this.lastTouchPosY,
        movementX: 0,
        movementY: 0,
        buttons: 0,
        type: 'touch',
      }
      this.onEnd(event)
      window.removeEventListener('touchmove', this.onTouchMove)
      window.removeEventListener('touchend', this.onTouchEnd)
    }
  }

  private onEnd(e: CanvasPointerEvent) {
    this.dispatchEvent('pointerup', e)

    if (this.dblClickTimer !== null) {
      this.clearDblClickTimer()
      this.dispatchEvent('pointerdblclick', e)
    } else if (this.clickTimer !== null) {
      this.dispatchEvent('pointerclick', e)
      this.dblClickTimer = window.setTimeout(() => {
        this.dblClickTimer = null
      }, this.dblClickDuration)
    }
    if (this.dragging) {
      this.dispatchEvent('pointerenddrag', e)
    }
    this.clearClickTimer()
    this.clearLongPressTimer()
  }
}
