import { h, Component } from 'hyperapp'

/** @internal */
export interface ScrollContainerProps {
  id?: string
}

/** @internal */
export const ScrollContainer: Component<ScrollContainerProps> = ({ id }, children) => (
  <div
    class="pwv-scroll-container"
    oncreate={createCustomScrollbars}
   >
    <div class="pwv-scroll-container-sc" >
      <div>
        {children}
      </div>
    </div>
  </div>
)

/** @internal */
const createCustomScrollbars = (scrollContainer: HTMLElement) => {
  let verticalBarExpanded = false
  scrollContainer.addEventListener('mousemove', (e: MouseEvent) => {
    if (e.offsetX + 30 > scrollContainer.offsetWidth) {
      if (!verticalBarExpanded) {
        scrollContainer.classList.add('pwv-scroll-v-expanded')
        scrollContainer.classList.remove('pwv-scroll-v-collapsed')
        verticalBarExpanded = true
      }
    } else {
      if (verticalBarExpanded) {
        scrollContainer.classList.add('pwv-scroll-v-collapsed')
        scrollContainer.classList.remove('pwv-scroll-v-expanded')
        verticalBarExpanded = false
      }
    }
  }, false)
}
