import { h, Component } from 'hyperapp'
import { classNames } from './classNames'
import { DropdownComponent } from './Dropdown'
import { Icon, IconDefinition } from './Icon'
import { Tooltip, TooltipPosition } from './Tooltip'

/** @internal */
export interface ColorPickerProps {
  icon: IconDefinition
  tooltip?: string
  tooltipPos?: TooltipPosition
  disabled?: boolean
  colors: string[]
  color: string
  mode?: 'dropdown' | 'buttons'
  onChange?(color: string): void
}

/** @internal */
export const ColorPicker: Component<ColorPickerProps> = (props) => {
  if (props.mode === 'buttons' && window.innerWidth > 580) {
    return <ColorPickerButtons {...props} />
  } else {
    return <ColorPickerDropdown {...props} />
  }
}

const ColorPickerDropdown: Component<ColorPickerProps> = ({ icon, tooltip, tooltipPos, disabled, colors, color, onChange }) => {
  if (disabled) {
    return (
      <div class="pwv-colorpicker pwv-commandbar-item pwv-disabled">
        <button class="" oncreate={DropdownComponent.create} onremove={DropdownComponent.remove}>
          <Icon icon={icon} />
          <div class={classNames('pwv-colorpicker-currentcolor')} style={{ backgroundColor: color }}></div>
          {tooltip && tooltipPos && <Tooltip position={tooltipPos}>{tooltip}</Tooltip>}
        </button>
      </div>
    )
  } else {
    return (
      <div class="pwv-colorpicker pwv-commandbar-item">
        <button class="" oncreate={DropdownComponent.create} onremove={DropdownComponent.remove}>
          <Icon icon={icon} />
          <div class={classNames('pwv-colorpicker-currentcolor')} style={{ backgroundColor: color }}></div>
          {tooltip && tooltipPos && <Tooltip position={tooltipPos}>{tooltip}</Tooltip>}
        </button>
        <div class={classNames('pwv-dropdown-panel', { 'pwv-dropdown-panel-wide': colors.length > 6 })}>
          {colors.map((c) => (
            <button
              disabled={c === color}
              class={classNames('pwv-colorpicker-btn', { 'pwv-selected': c === color })}
              onclick={(e: MouseEvent) => {
                onChange && onChange(c)
              }}
            >
              <div style={{ backgroundColor: c }} />
            </button>
          ))}
        </div>
      </div>
    )
  }
}

const ColorPickerButtons: Component<ColorPickerProps> = ({ icon, colors, color, onChange }) => {
  return (
    <div class="pwv-colorpicker-buttons pwv-commandbar-item">
      {colors.map((c) => (
        <button
          disabled={c === color}
          class={classNames('pwv-colorpicker-btn', { 'pwv-selected': c === color })}
          onclick={(e: MouseEvent) => {
            onChange && onChange(c)
          }}
        >
          <div style={{ backgroundColor: c }} />
        </button>
      ))}
    </div>
  )
}
