import { ViewLayerBase } from './ViewLayerBase'
import { ViewerCanvasState } from '../state/store'
import { DragMoveHandler, DragMoveEvent } from '../../common/DragMoveHandler'
import { ViewerMode } from '../state/viewer'

/** @internal */
export class ScrollLayer extends ViewLayerBase {

  private htmlLayerElement: HTMLElement | undefined

  private horizontalScrollEnabled = false
  private horizontalScrollBar: HTMLElement
  private horizontalScrollHandle: HTMLElement
  private horizontalScrollBarVisible = false
  private horizontalScrollRatio = 0
  private horizontalScrollBarSize = 0
  private horizontalScrollHandleSize = 0
  private horizontalScrollHandlePos = 0
  private horizontalScrollTimer = 0
  private horizontalScrollExpanded = false

  private verticalScrollEnabled = false
  private verticalScrollBar: HTMLElement
  private verticalScrollHandle: HTMLElement
  private verticalScrollBarVisible = false
  private verticalScrollRatio = 0
  private verticalScrollBarSize = 0
  private verticalScrollHandleSize = 0
  private verticalScrollHandlePos = 0
  private verticalScrollTimer = 0
  private verticalScrollExpanded = false

  private canScrollDown = false
  private canScrollUp = false
  private canScrollRight = false
  private canScrollLeft = false

  private isTouchScrolling: boolean = false
  private recentTouchPos: Array<{ x: number, y: number, time: number }> = []
  private touchScrollAxis: 'x' | 'y' | null = null

  private autoscrollLastTimestamp: number = 0
  private autoscrollDist: number = 0
  private autoscrollDistTime: number = 0
  private autoscrollDx: number = 0

  constructor() {
    super()

    this.startVerticalScroll = this.startVerticalScroll.bind(this)
    this.verticalScroll = this.verticalScroll.bind(this)
    this.endVerticalScroll = this.endVerticalScroll.bind(this)

    this.startHorizontalScroll = this.startHorizontalScroll.bind(this)
    this.horizontalScroll = this.horizontalScroll.bind(this)
    this.endHorizontalScroll = this.endHorizontalScroll.bind(this)

    this.horizontalScrollBar = document.createElement('div')
    this.horizontalScrollBar.style.display = 'none'
    this.horizontalScrollBar.classList.add('pwv-horizontal-scrollbar')

    this.horizontalScrollHandle = document.createElement('div')
    this.horizontalScrollHandle.classList.add('pwv-scrollbar-handle')
    this.horizontalScrollBar.appendChild(this.horizontalScrollHandle)

    this.verticalScrollBar = document.createElement('div')
    this.verticalScrollBar.style.display = 'none'
    this.verticalScrollBar.classList.add('pwv-vertical-scrollbar')

    this.verticalScrollHandle = document.createElement('div')
    this.verticalScrollHandle.classList.add('pwv-scrollbar-handle')
    this.verticalScrollBar.appendChild(this.verticalScrollHandle)

    new DragMoveHandler(this.verticalScrollHandle, this.startVerticalScroll, this.verticalScroll, this.endVerticalScroll)
    new DragMoveHandler(this.horizontalScrollHandle, this.startHorizontalScroll, this.horizontalScroll, this.endHorizontalScroll)
  }

  public create() {
    this.htmlLayerElement = this.createHtmlLayer()
    this.htmlLayerElement.appendChild(this.horizontalScrollBar)
    this.htmlLayerElement.appendChild(this.verticalScrollBar)
  }

  public render(timestamp: number, state: ViewerCanvasState) {
    const canvasHeight = state.canvas.height.cssPixels
    const documentHeight = state.document.height.cssPixels

    // update vertical scroll bar size & visibility
    if (state.document.heightChanged || state.canvas.heightChanged) {
      this.verticalScrollEnabled = documentHeight > canvasHeight

      if (this.verticalScrollEnabled !== this.verticalScrollBarVisible) {
        this.verticalScrollBar.style.display = this.verticalScrollEnabled ? 'block' : 'none'
        this.verticalScrollBarVisible = this.verticalScrollEnabled
      }

      if (this.verticalScrollEnabled) {
        this.verticalScrollBarSize = this.verticalScrollBar.clientHeight
        this.verticalScrollHandleSize = this.verticalScrollBarSize * canvasHeight / documentHeight
        if (this.verticalScrollHandleSize < 50) {
          this.verticalScrollHandleSize = 50
        }
        this.verticalScrollHandle.style.height = this.verticalScrollHandleSize + 'px'

        this.verticalScrollRatio = (this.verticalScrollBarSize - this.verticalScrollHandleSize) / (documentHeight - canvasHeight)
      }
      this.updateCanScrollVertical(state)
    }

    // update vertical scroll handle position
    if (state.scroll.topPositionChanged) {
      this.verticalScrollHandlePos = state.scroll.top.cssPixels * this.verticalScrollRatio

      this.verticalScrollHandle.style.top = this.verticalScrollHandlePos + 'px'

      if (this.verticalScrollTimer) {
        clearTimeout(this.verticalScrollTimer)
      } else {
        this.verticalScrollBar.classList.add('pwv-scrollbar-scrolling')
      }

      this.verticalScrollTimer = window.setTimeout(() => {
        this.verticalScrollTimer = 0
        this.verticalScrollBar.classList.remove('pwv-scrollbar-scrolling')
      }, 500)
      this.updateCanScrollVertical(state)
    }

    const canvasWidth = state.canvas.width.cssPixels
    const documentWidth = state.document.width.cssPixels

    // update horizontal scroll bar size & visibility
    if (state.document.widthChanged || state.canvas.widthChanged) {
      this.horizontalScrollEnabled = documentWidth > canvasWidth

      if (this.horizontalScrollEnabled !== this.horizontalScrollBarVisible) {
        this.horizontalScrollBar.style.display = this.horizontalScrollEnabled ? 'block' : 'none'
        this.horizontalScrollBarVisible = this.horizontalScrollEnabled
      }

      if (this.horizontalScrollEnabled) {
        this.horizontalScrollBarSize = this.horizontalScrollBar.clientWidth
        this.horizontalScrollHandleSize = this.horizontalScrollBarSize * canvasWidth / documentWidth
        if (this.horizontalScrollHandleSize < 50) {
          this.horizontalScrollHandleSize = 50
        }
        this.horizontalScrollHandle.style.width = this.horizontalScrollHandleSize + 'px'

        this.horizontalScrollRatio = (this.horizontalScrollBarSize - this.horizontalScrollHandleSize) / (documentWidth - canvasWidth)
      }

      this.updateCanScrollHorizontal(state)
    }

    // update horizontal scroll handle position
    if (state.scroll.leftPositionChanged) {
      this.horizontalScrollHandlePos = state.scroll.left.cssPixels * this.horizontalScrollRatio

      this.horizontalScrollHandle.style.left = this.horizontalScrollHandlePos + 'px'

      if (this.horizontalScrollTimer) {
        clearTimeout(this.horizontalScrollTimer)
      } else {
        this.horizontalScrollBar.classList.add('pwv-scrollbar-scrolling')
      }

      this.horizontalScrollTimer = window.setTimeout(() => {
        this.horizontalScrollTimer = 0
        this.horizontalScrollBar.classList.remove('pwv-scrollbar-scrolling')
      }, 500)

      this.updateCanScrollHorizontal(state)
    }

    if (state.pointer.positionChanged) {
      const pointerX = state.pointer.x.cssPixels
      const pointerY = state.pointer.y.cssPixels
      const xPos = canvasWidth - 40
      const yPos = canvasHeight - 40

      if (!this.verticalScrollExpanded && pointerX > xPos && pointerY < yPos) {
        this.verticalScrollBar.classList.add('pwv-scrollbar-hover')
        this.verticalScrollExpanded = true
      } else if (this.verticalScrollExpanded && (pointerX < xPos || pointerY > yPos)) {
        this.verticalScrollBar.classList.remove('pwv-scrollbar-hover')
        this.verticalScrollExpanded = false
      }

      if (!this.horizontalScrollExpanded && pointerY > yPos && pointerX < xPos) {
        this.horizontalScrollBar.classList.add('pwv-scrollbar-hover')
        this.horizontalScrollExpanded = true
      } else if (this.horizontalScrollExpanded && (pointerY < yPos || pointerX > xPos)) {
        this.horizontalScrollBar.classList.remove('pwv-scrollbar-hover')
        this.horizontalScrollExpanded = false
      }
    }

    // touchscroll
    const pointer = state.pointer
    const touchScrollEnabled = pointer.type === 'touch' && (
      state.viewer.mode === ViewerMode.DEFAULT ||
      state.viewer.mode === ViewerMode.ANNOTATION_SELECTED
    )

    if (touchScrollEnabled && this.viewerCanvas) {
      if (state.pointer.isDown) {
        if (!this.isTouchScrolling) {
          this.isTouchScrolling = true
          this.autoscrollDx = 0
          this.touchScrollAxis = null
          this.recentTouchPos = []
          this.recentTouchPos.unshift({
            x: pointer.x.cssPixels,
            y: pointer.y.cssPixels,
            time: timestamp,
          })
        } else if (pointer.positionChanged) {
          this.recentTouchPos.unshift({
            x: pointer.x.cssPixels,
            y: pointer.y.cssPixels,
            time: timestamp,
          })
          if (this.recentTouchPos.length > 3) {
            this.recentTouchPos.pop()
          }

          const diffX = this.recentTouchPos[1].x - this.recentTouchPos[0].x
          const diffY = this.recentTouchPos[1].y - this.recentTouchPos[0].y
          const diffXabs = Math.abs(diffX)
          const diffYabs = Math.abs(diffY)

          const scrollAxis = this.touchScrollAxis !== null ? this.touchScrollAxis :
            diffYabs > diffXabs ? 'y' :
              diffXabs > diffYabs ? 'x' : null

          if (this.verticalScrollEnabled && scrollAxis === 'y') {
            if ((diffY > 0 && this.canScrollDown) || (diffY < 0 && this.canScrollUp)) {
              this.viewerCanvas.scrollDown(diffY)
            }
          } else if (this.horizontalScrollEnabled && this.touchScrollAxis === 'x') {
            if ((diffX > 0 && this.canScrollRight) || (diffX < 0 && this.canScrollLeft)) {
              this.viewerCanvas.scrollRight(diffX)
            }
          }

          // lock scroll axis
          if (this.touchScrollAxis === null && this.recentTouchPos.length >= 3) {
            this.touchScrollAxis = diffYabs > diffXabs ? 'y' : diffXabs > diffYabs ? 'x' : null
          }
        }

      } else if (this.isTouchScrolling) {
        this.isTouchScrolling = false

        if (this.touchScrollAxis === 'x') {
          this.autoscrollDist = this.recentTouchPos[2].x - this.recentTouchPos[0].x
          this.autoscrollDistTime = this.recentTouchPos[0].time - this.recentTouchPos[2].time
          this.autoscrollDx = Math.abs(this.autoscrollDist / this.autoscrollDistTime)
          this.autoscrollLastTimestamp = timestamp

        } else if (this.touchScrollAxis === 'y') {
          this.autoscrollDist = this.recentTouchPos[2].y - this.recentTouchPos[0].y
          this.autoscrollDistTime = this.recentTouchPos[0].time - this.recentTouchPos[2].time
          this.autoscrollDx = Math.abs(this.autoscrollDist / this.autoscrollDistTime)
          this.autoscrollLastTimestamp = timestamp
        }
      }
    }

    // auto scroll
    if (this.viewerCanvas && this.autoscrollDx !== 0) {
      const time = timestamp - this.autoscrollLastTimestamp
      if (time > 1000 / 70) {
        if (this.touchScrollAxis === 'y' && (
          (this.autoscrollDist > 0 && !this.canScrollDown) || (this.autoscrollDist < 0 && !this.canScrollUp))
        ) {
          this.autoscrollDx = 0
        } else if (this.touchScrollAxis === 'x' && (
          (this.autoscrollDist > 0 && !this.canScrollRight) || (this.autoscrollDist < 0 && !this.canScrollLeft)
        )) {
          this.autoscrollDx = 0
        } else {
          const direction = Math.sign(this.autoscrollDist)
          const distance = Math.abs(this.autoscrollDist)

          const timeFactor = time / this.autoscrollDistTime

          const diff = distance * this.autoscrollDx * timeFactor

          const scrollDiff = diff * direction

          if (Math.abs(scrollDiff) < 1) {
            this.autoscrollDx = 0
          } else {
            if (this.touchScrollAxis === 'y') {
              this.viewerCanvas.scrollDown(scrollDiff)
            } else {
              this.viewerCanvas.scrollRight(scrollDiff)
            }
          }

          const throttleDiff = this.autoscrollDx * .075 * timeFactor
          this.autoscrollDx = this.autoscrollDx - throttleDiff
          this.autoscrollLastTimestamp = timestamp
        }
      }
    }
  }

  private updateCanScrollVertical(state: ViewerCanvasState) {
    this.canScrollUp = state.scroll.top.cssPixels > 0
    this.canScrollDown = state.scroll.top.cssPixels + state.canvas.height.cssPixels < state.document.height.cssPixels - 1
  }

  private updateCanScrollHorizontal(state: ViewerCanvasState) {
    this.canScrollLeft = state.scroll.left.cssPixels > 0
    this.canScrollRight = state.scroll.left.cssPixels + state.canvas.width.cssPixels < state.document.width.cssPixels - 1
  }

  private startVerticalScroll(e: DragMoveEvent) {
    this.verticalScrollBar.classList.add('pwv-scrollbar-dragging')
  }

  private verticalScroll(e: DragMoveEvent) {
    if (this.viewerCanvas) {
      const scrollDiv = e.movementY / this.verticalScrollRatio
      this.viewerCanvas.scrollDown(scrollDiv)
    }
  }

  private endVerticalScroll(e: DragMoveEvent) {
    this.verticalScrollBar.classList.remove('pwv-scrollbar-dragging')
  }

  private startHorizontalScroll(e: DragMoveEvent) {
    this.horizontalScrollBar.classList.add('pwv-scrollbar-dragging')
  }

  private horizontalScroll(e: DragMoveEvent) {
    if (this.viewerCanvas) {
      const scrollDiv = e.movementX / this.horizontalScrollRatio
      this.viewerCanvas.scrollRight(scrollDiv)
    }
  }

  private endHorizontalScroll(e: DragMoveEvent) {
    this.horizontalScrollBar.classList.remove('pwv-scrollbar-dragging')
  }

}
