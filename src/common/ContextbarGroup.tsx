import { h, Component } from 'hyperapp'

/** @internal */
export const ContextbarGroup: Component<{}> = ({}, children) => {
  return (
    <div class="pwv-contextbar-group">
      {children}
    </div>
  )
}
