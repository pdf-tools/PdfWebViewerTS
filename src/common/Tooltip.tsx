import { h, Component } from 'hyperapp'
import { classNames } from './classNames'

export enum TooltipPosition {
  top = 'top',
  left = 'left',
  bottom = 'bottom',
  right = 'right',
}

/** @internal */
export interface TooltipProps {
  position: TooltipPosition
}

/** @internal */
export const Tooltip: Component<TooltipProps> = ({position}, children) => {
  return (
    <div class={classNames('pwv-tooltip', `pwv-tooltip-${TooltipPosition[position]}`)}>
      <div class="pwv-tooltip-content" >
        <span oncreate={(element: HTMLElement) => { createTooltip(element, position) }}>
          {children}
        </span>
      </div>
    </div>
  )
}

const createTooltip = (txtElement: HTMLElement, position: TooltipPosition) => {
  const contentElement = txtElement.parentElement as HTMLElement
  const tooltipElement = contentElement.parentElement as HTMLElement

  const txtRect = txtElement.getBoundingClientRect()
  let contentRect = contentElement.getBoundingClientRect()
  const tooltipRect = tooltipElement.getBoundingClientRect()

  if (txtRect.width + 4 < contentRect.width) {
    contentElement.style.width = Math.max(50, txtRect.width + 4) + 'px'
  } else if (txtRect.height * 1.33 > contentRect.width) {
    contentElement.style.width = contentRect.width * txtRect.height * 1.33 / txtRect.width + 'px'
  }
  contentRect = contentElement.getBoundingClientRect()

  if (position === TooltipPosition.bottom || position === TooltipPosition.top) {
    let leftPos = (contentRect.width - tooltipRect.width) / 2 * -1
    if (tooltipRect.left + leftPos < 0) {
      leftPos = 2
    } else if (tooltipRect.left + leftPos + contentRect.width > document.body.offsetWidth) {
      leftPos = (contentRect.width - tooltipRect.width + 2) * -1
    }
    contentElement.style.left = leftPos + 'px'
  }

  if (position === TooltipPosition.left || position === TooltipPosition.right) {
    const topPos = (contentRect.height - tooltipRect.height) / 2 * -1
    contentElement.style.top = topPos + 'px'
  }
}
