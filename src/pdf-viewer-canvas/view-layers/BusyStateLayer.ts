import { ViewLayerBase } from './ViewLayerBase'
import { ViewerCanvasState } from '../state/store'

/** @internal */
export class BusyStateLayer extends ViewLayerBase {

  private busyStateView: HTMLElement | undefined
  private isBusy = false
  
  constructor() {
    super()
  }

  public create() {
    this.busyStateView = this.createHtmlLayer()
    this.busyStateView.classList.add('pwv-busy-loader')
    this.busyStateView.style.display = 'none'
    const ct = document.createElement('div')
    this.busyStateView.appendChild(ct)
    const rects = ['rect-1', 'rect-2', 'rect-3', 'rect-4', 'rect-5']
    rects.forEach(rect => {
      const rectElement = document.createElement('div')
      rectElement.classList.add(rect)
      ct.appendChild(rectElement)
    })

  }

  public render(timestamp: number, state: ViewerCanvasState) {
    if (this.busyStateView && state.document.busyStateChanged) {
      this.busyStateView.style.display = state.document.busyState ? 'block' : 'none'
    }
  }

}
