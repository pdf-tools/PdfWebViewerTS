import { h, Component } from 'hyperapp'
import { Icon, IconDefinition } from './Icon'
import { Tooltip, TooltipPosition } from './Tooltip'
import { classNames } from './classNames'

/** @internal */
export interface CommandbarButtonProps {
  icon?: IconDefinition
  tooltip?: string
  tooltipPos?: TooltipPosition
  disabled?: boolean
  active?: boolean
  className?: string
  onClick?(e: MouseEvent): void
}

/** @internal */
export const CommandbarButton: Component<CommandbarButtonProps> = ({ icon, disabled, active, onClick, tooltip, tooltipPos, className}, children) => {
  if (disabled) {
    return (
      <div
        class={classNames('pwv-commandbar-item', 'pwv-commandbar-btn', 'pwv-disabled', className)}
      >
        {icon &&
          <Icon icon={icon} />
        }
        {children.length > 0 &&
          <span class="pwv-btn-text">{children}</span>
        }
        {tooltip && tooltipPos &&
          <Tooltip position={tooltipPos}>{tooltip}</Tooltip>
        }
      </div>
    )
  } else {
    return (
      <button
        class={classNames('pwv-commandbar-item', 'pwv-commandbar-btn', className, {'pwv-active': active})}
        onclick={(e: MouseEvent) => {
          onClick && onClick(e)
        }}
      >
        {icon &&
          <Icon icon={icon} />
        }
        {children.length > 0 &&
          <span class="pwv-btn-text">{children}</span>
        }
        {tooltip && tooltipPos &&
          <Tooltip position={tooltipPos}>{tooltip}</Tooltip>
        }
      </button>
    )
  }
}
