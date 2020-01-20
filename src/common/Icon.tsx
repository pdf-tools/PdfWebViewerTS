import { h, Component } from 'hyperapp'
import { classNames } from './classNames'
import { IconDefinition } from './icons'
export * from './icons'

/** @internal */
export interface IconProps {
  icon: IconDefinition
  className?: string
  fill?: string
}

/** @internal */
export const Icon: Component<IconProps> = ({ icon, className, fill }) => (
  <span class={classNames('pwv-icon', className)}>
    <svg viewBox={`0 0 ${icon.width} ${icon.height}`}>
      <path
        d={icon.path}
        fill={fill}
        shape-rendering="optimizeQuality"
        stroke-width="1px"
      />
    </svg>
  </span>
)
