import { h, Component } from 'hyperapp'
import { classNames } from './classNames'

/** @internal */
export interface CheckboxProps {
  label: string
  checked: boolean
  onClick?(): void
}

/** @internal */
export const Checkbox: Component<CheckboxProps> = ({label, checked, onClick}) => {
  return (
    <label
      onclick={onClick}
      class={classNames('', {'': checked})}
    >
      <span></span>
      <span>{label}</span>
    </label>
  )
}
