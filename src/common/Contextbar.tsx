import { h, Component } from 'hyperapp'

/** @internal */
export interface ContextbarProps {
}

/** @internal */
export const Contextbar: Component<ContextbarProps> = ({}, children) => {
  return (
    <div
      class="pwv-contextbar"
      oncreate={(element: HTMLElement) => {
        element.addEventListener('click', (e: Event) => { e.preventDefault(); e.cancelBubble = true }, {passive: false})
        element.addEventListener('mousedown', (e: Event) => { e.cancelBubble = true; e.stopPropagation()}, false)
        element.addEventListener('mousemove', (e: Event) => { e.cancelBubble = true}, false)
        element.addEventListener('mouseup', (e: Event) => { e.cancelBubble = true}, false)
        element.addEventListener('touchstart', (e: Event) => { e.cancelBubble = true; e.stopPropagation()}, {passive: false})
        element.addEventListener('touchmove', (e: Event) => { e.cancelBubble = true}, {passive: true})
        element.addEventListener('touchend', (e: Event) => { e.cancelBubble = true}, {passive: true})
      }}
    >
      <di class="pwv-contextbar-content">
        {children}
      </di>
    </div>
  )
}
