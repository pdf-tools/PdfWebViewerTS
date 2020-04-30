import { h, Component } from 'hyperapp'
import { Icon, IconDefinition } from './Icon'
import { Tooltip, TooltipPosition } from './Tooltip'

/** @internal */
export interface CommandbarFileButtonProps {
  icon: IconDefinition
  tooltip?: string
  accept?: string
  tooltipPos?: TooltipPosition
  disabled?: boolean
  active?: boolean
  onFileSelected?(file: File): void
}

/** @internal */
export const CommandbarFileButton: Component<CommandbarFileButtonProps> = ({ icon, accept, tooltip, tooltipPos, disabled, onFileSelected }) => {
  if (disabled) {
    return (
      <div class="pwv-commandbar-item pwv-commandbar-btn pwv-disabled">
        <Icon icon={icon} />
        {tooltip && tooltipPos && <Tooltip position={TooltipPosition.bottom}>{tooltip}</Tooltip>}
      </div>
    )
  } else {
    return (
      <label class="pwv-commandbar-item pwv-commandbar-btn">
        <Icon icon={icon} />
        <input
          style={{ display: 'none' }}
          type="file"
          accept={accept}
          onchange={(e: any) => {
            if (onFileSelected && e.currentTarget.files && e.currentTarget.files.length) {
              const file = e.currentTarget.files[0]
              onFileSelected(file)
            }
          }}
          oncreate={(input: HTMLElement) => {
            const id = 'fi_' + performance.now()
            input.id = id
            const label = input.parentElement as HTMLElement
            label.setAttribute('for', id)
          }}
        />
        {tooltip && tooltipPos && <Tooltip position={TooltipPosition.bottom}>{tooltip}</Tooltip>}
      </label>
    )
  }
}
