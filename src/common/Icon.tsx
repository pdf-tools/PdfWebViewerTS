import { h, Component } from 'hyperapp'
import { classNames } from './classNames'
import { IconDefinition } from './icons'
export * from './icons'

/** @internal */
export interface IconProps {
  icon: IconDefinition
  className?: string
  fill?: string
  bg?: string
}

/** @internal */
export const Icon: Component<IconProps> = ({ icon, className, fill, bg }) => (
  <span class={classNames('pwv-icon', className)}>
    <svg viewBox={`0 0 ${icon.width} ${icon.height}`}>
      {icon.bg && bg && <path d={icon.bg} fill={bg} />}
      <path
        d={icon.path}
        fill={fill}
        shape-rendering="optimizeQuality"
        stroke-width="1px"
      />
    </svg>
  </span>
)
