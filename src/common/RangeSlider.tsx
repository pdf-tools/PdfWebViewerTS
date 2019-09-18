import { h, Component } from 'hyperapp'
import { DropdownComponent } from './Dropdown'
import { Icon, icons, IconDefinition } from './Icon'
import { classNames } from './classNames'

export interface RangeSliderProps {
  min: number
  max: number
  step: number
  value: number
  text?: string
  icon?: IconDefinition
  label?: string
  disabled?: boolean
  className?: string
  onChange(value: number): void
}

/** @internal */
export const RangeSlider: Component<RangeSliderProps> = ({ min, max, value, icon, className, text, label, disabled, onChange }) => {
  if (disabled) {
    return (
      <div
        class={classNames('pwv-rangeslider', 'pwv-commandbar-item', 'pwv-dropdown', 'pwv-disabled', className)}
      >
        {label || icon &&
          <span class="pwv-dropdown-label">
            {label}
            {icon &&
              <Icon icon={icon} />
            }
          </span>
        }
        <span class="pwv-dropdown-text">
          {text}
        </span>
        <span class="pwv-dropdown-caret">
          <Icon icon={icons.dropdownCaret} />
        </span>
      </div>
    )
  } else {
    return (
      <div
        class={classNames('pwv-rangeslider', 'pwv-commandbar-item', 'pwv-dropdown', className)}
      >
        <button
          oncreate={DropdownComponent.create}
          onremove={DropdownComponent.remove}
        >
          {label || icon &&
            <span class="pwv-dropdown-label">
              {label}
              {icon &&
                <Icon icon={icon} />
              }
            </span>
          }
          <span class="pwv-dropdown-text">
            {text}
          </span>
          <span class="pwv-dropdown-caret">
            <Icon icon={icons.dropdownCaret} />
          </span>
        </button>
        <div class="pwv-dropdown-panel">
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            oninput={(e: Event) => {
              const input = e.currentTarget as HTMLInputElement
              const intVal = parseInt(input.value, undefined)
              onChange(intVal)
            }}
            onchange={(e: Event) => {
              e.preventDefault()
              const input = e.currentTarget as HTMLInputElement
              window.dispatchEvent(new Event('click'))
            }}
          />
        </div>
      </div>
    )
  }
}
