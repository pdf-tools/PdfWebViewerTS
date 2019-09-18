import { h, Component } from 'hyperapp'

/** @internal */
export interface ContextmenuProps {
  position: {
    x: number,
    y: number,
  }
}

/** @internal */
export const Contextmenu: Component<ContextmenuProps> = ({position}, children) => {
  return (
    <div
      class="pwv-contextmenu"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
      }}
      oncreate={(element: HTMLElement) => {
        element.addEventListener('onclick', (e: Event) => { e.preventDefault(); e.cancelBubble = true }, false)
        element.addEventListener('mousedown', (e: Event) => { e.cancelBubble = true; e.stopPropagation()}, false)
        element.addEventListener('mousemove', (e: Event) => { e.cancelBubble = true}, false)
        element.addEventListener('mouseup', (e: Event) => { e.cancelBubble = true}, false)
      }}
    >
      <div class="pwv-contextmenu-content">
        {children}
      </div>
    </div>
  )
}
