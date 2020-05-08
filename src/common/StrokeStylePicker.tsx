import { h, Component } from 'hyperapp'
import { classNames } from './classNames'
import { AnnotationBorderStyle } from '../pdf-viewer-api'
import { Dropdown, DropdownItem } from './Dropdown'

/** @internal */
export interface StrokeStylePickerProps {
  disabled?: boolean
  value: AnnotationBorderStyle
  onChange?(strokeWidth: number): void
}

const StrokeItem: Component<{ value: AnnotationBorderStyle }> = ({ value }) => {
  const strokeStyle = value === AnnotationBorderStyle.DASHED ? 'dashed' : 'solid'
  return (
    <div class={`pwv-stroke-style-picker-item pwv-stroke-style-${strokeStyle}`}>
      <span></span>
    </div>
  )
}

const StrokeButton: Component<{ value: AnnotationBorderStyle }> = ({ value }) => {
  const strokeStyle = value === AnnotationBorderStyle.DASHED ? 'dashed' : 'solid'
  return (
    <div class={`pwv-stroke-style-picker-button pwv-stroke-style-${strokeStyle}`}>
      <span></span>
    </div>
  )
}

export const StrokeStylePicker: Component<StrokeStylePickerProps> = ({ disabled, value, onChange }) => {
  const items = [AnnotationBorderStyle.SOLID, AnnotationBorderStyle.DASHED].map((item) => ({
    value: item,
    renderItem: (i: DropdownItem) => <StrokeItem value={item} />,
  }))
  return (
    <Dropdown
      className="pwv-stroke-style-picker"
      align="right"
      disabled={disabled}
      items={items}
      value={value}
      renderButton={(value) => <StrokeButton value={value as AnnotationBorderStyle} />}
      onChange={onChange}
    />
  )
}
