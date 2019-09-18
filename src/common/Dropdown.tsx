import { h, Component } from 'hyperapp'
import { Icon, icons, IconDefinition } from './Icon'
import { classNames } from './classNames'
import { Tooltip, TooltipPosition } from './Tooltip'

/** @internal */
export interface DropdownItem {
  text?: string
  value: string | number
  renderItem?(item: DropdownItem): any
}

/** @internal */
export interface DropdownProps {
  text?: string
  tooltip?: string
  tooltipPos?: TooltipPosition
  icon?: IconDefinition
  value: string | number
  items: DropdownItem[]
  disabled?: boolean
  width?: number
  align?: 'left' | 'right'
  className?: string
  hideCaret?: boolean
  renderButton?(value: string | number, text?: string): any
  onChange?(value: string | number): void
}

export const Dropdown: Component<DropdownProps> = ({
  disabled,
  text,
  icon,
  value,
  tooltip,
  tooltipPos,
  width,
  className,
  items,
  align,
  hideCaret,
  renderButton,
  onChange,
}) => {

  const selectedItem = items.find(item => item.value === value)
  if (!text && selectedItem) {
    text = selectedItem.text
  }
  const style = width ? {
    width: width + 'px',
  } : {}

  if (disabled) {
    return (
      <div
        class={classNames(
          'pwv-dropdown',
          'pwv-disabled',
          {'pwv-dropdown-align-left': !align || align === 'left'},
          {'pwv-dropdown-align-right': align === 'right'},
          className,
        )}
        style={style}
      >
        <button disabled={true}>
          <span class="pwv-dropdown-text">
            {icon &&
              <Icon icon={icon} />
            }
            {text}
          </span>
          {!hideCaret &&
            <span class="pwv-dropdown-caret">
              <Icon icon={icons.dropdownCaret} />
            </span>
          }
          {tooltip && tooltipPos &&
            <Tooltip position={tooltipPos}>{tooltip}</Tooltip>
          }
        </button>
      </div>
    )
  }
  return (
    <div
      class={classNames(
        'pwv-dropdown',
        {'pwv-dropdown-align-left': !align || align === 'left'},
        {'pwv-dropdown-align-right': align === 'right'},
        className,
      )}
      style={style}
    >
      <button
        oncreate={DropdownComponent.create}
        onremove={DropdownComponent.remove}
      >
        {renderButton ?
          renderButton(value, text) :
          <span class="pwv-dropdown-text">
            {icon &&
              <Icon icon={icon} />
            }
            {text}
          </span>
        }
        {!hideCaret &&
          <span class="pwv-dropdown-caret">
            <Icon icon={icons.dropdownCaret} />
          </span>
        }
        {tooltip && tooltipPos &&
          <Tooltip position={tooltipPos}>{tooltip}</Tooltip>
        }
      </button>
      <div class="pwv-dropdown-panel">
        <ul>
          {items.map(item => (
            <li
              onclick={() => onChange && onChange(item.value)}
            >
              {item.renderItem ?
                item.renderItem(item) :
                <span class="pwv-dropdown-item-text">{item.text}</span>
              }
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export class DropdownComponent {
  public static create(btnElement: HTMLElement) {
    (btnElement.parentElement as any).dropdown = new DropdownComponent(btnElement)
  }

  public static remove(btnElement: HTMLElement) {
    (btnElement.parentElement as any).dropdown.unmount()
  }

  private element: HTMLElement
  private button: HTMLElement

  constructor(btnElement: HTMLElement) {
    this.button = btnElement
    this.element = btnElement.parentElement as HTMLElement

    this.handleOnClick = this.handleOnClick.bind(this)

    this.button.addEventListener('click', this.handleOnClick, false)
  }

  public unmount() {
    this.button.removeEventListener('click', this.handleOnClick)
  }

  private handleOnClick(e: MouseEvent) {
    if (!this.element.classList.contains('pwv-dropdown-open')) {
      this.element.classList.add('pwv-dropdown-open')
      const t = Date.now();
      (e as any).openDropdown = t
      const closeDropdownPanel = (ev: any) => {
        if (ev.openDropdown !== t) {
          window.removeEventListener('click', closeDropdownPanel)
          this.element.classList.remove('pwv-dropdown-open')
        }
      }
      window.addEventListener('click', closeDropdownPanel, false)
    }
  }

}
