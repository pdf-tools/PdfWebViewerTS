import { h, Component } from 'hyperapp'

/** @internal */
export const Commandbar: Component<{}> = ({}, children) => {
  return (
    <div class="pwv-commandbar">
      {children}
    </div>
  )
}
