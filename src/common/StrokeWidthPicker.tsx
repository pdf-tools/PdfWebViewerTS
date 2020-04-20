import { h, Component } from 'hyperapp'
import { classNames } from './classNames'
import { Dropdown, DropdownItem } from './Dropdown'

/** @internal */
export interface StrokeWidthPickerProps {
  disabled?: boolean
  strokeWidths: number[]
  value: number
  noneStrokeText: string
  onChange?(strokeWidth: number): void
}

const StrokeItem: Component<{ value: number | string; noneStrokeText: string }> = ({ value, noneStrokeText }) => {
  if (value === 0) {
    return (
      <div class="pwv-stroke-width-picker-item">
        <span>{noneStrokeText}</span>
      </div>
    )
  }
  return (
    <div class="pwv-stroke-width-picker-item">
      <span>{value}pt</span>
      <span class="pwv-stroke-width" style={{ height: `${value}px` }} />
    </div>
  )
}

export const StrokeWidthPicker: Component<StrokeWidthPickerProps> = ({ disabled, noneStrokeText, strokeWidths, value, onChange }) => {
  const items = strokeWidths.map((item) => ({
    value: item,
    renderItem: (i: DropdownItem) => <StrokeItem value={i.value} noneStrokeText={noneStrokeText} />,
  }))
  return (
    <Dropdown
      className="pwv-stroke-width-picker"
      align="right"
      disabled={disabled}
      items={items}
      value={value}
      renderButton={(value) => <StrokeItem value={value} noneStrokeText={noneStrokeText} />}
      onChange={onChange}
    />
  )
}
