import { app, h, Component, ActionsType } from 'hyperapp'
import { CommandbarButton } from '../../common/CommandbarButton'
import { icons } from '../../common/icons'
import { Commandbar } from '../../common/Commandbar'
import { CommandbarSeparator } from '../../common/CommandbarSeparator'
import { DropdownItem, Dropdown } from '../../common/Dropdown'
import { StrokeWidthPicker } from '../../common/StrokeWidthPicker'
import { RangeSlider } from '../../common/RangeSlider'
import { ColorPicker } from '../../common/ColorPicker'
import { TooltipPosition } from '../../common/Tooltip'

export interface ShapeAnnotationToolbarProps {
  strokeColors: string[]
  strokeWidths: number[]
  fillColors: string[]
  selectedStrokeColor: string
  selectedStrokeWidth: number
  selectedFillColor: string
  onStrokeColorChanged(color: string): void
  onStrokeWidthChanged(width: number): void
  onFillColorChanged(color: string): void
  onCancel(): void
  onSave(): void
}

interface ShapeAnnotationToolbarState {
  strokeColors: string[]
  strokeWidths: number[]
  fillColors: string[]
  selectedStrokeColor: string
  selectedStrokeWidth: number
  selectedFillColor: string
}

export interface ShapeAnnotationToolbarActions {
  setStrokeColor(color: string): void
  setStrokeWidth(width: number): void
  setFillColor(width: string): void
  setCancel(): void
  setSave(): void
}

export const createShapeAnnotationToolbar = (props: ShapeAnnotationToolbarProps, element: HTMLElement) => {
  const state: ShapeAnnotationToolbarState = {
    strokeColors: props.strokeColors,
    strokeWidths: props.strokeWidths,
    fillColors: props.fillColors,
    selectedStrokeColor: props.selectedStrokeColor,
    selectedStrokeWidth: props.selectedStrokeWidth,
    selectedFillColor: props.selectedFillColor,
  }

  const actions: ActionsType<ShapeAnnotationToolbarState, ShapeAnnotationToolbarActions> = {
    setStrokeColor: (color: string) => ($state) => {
      props.onStrokeColorChanged(color)
      return { ...$state, selectedStrokeColor: color }
    },
    setStrokeWidth: (width: number) => ($state) => {
      props.onStrokeWidthChanged(width)
      return { ...$state, selectedStrokeWidth: width }
    },
    setFillColor: (color: string) => ($state) => {
      props.onFillColorChanged(color)
      return { ...$state, selectedFillColor: color }
    },
    setCancel: () => ($state) => {
      return { ...$state }
    },
    setSave: () => ($state) => {
      return { ...$state }
    },
  }

  const App = () => <ShapeAnnotationToolbar />

  const ShapeAnnotationToolbar: Component<{}, ShapeAnnotationToolbarState, ShapeAnnotationToolbarActions> = ({}) => ($state, $actions) => (
    <div class="pwv-toolbar">
      <Commandbar>
        <ColorPicker colors={$state.strokeColors} color={$state.selectedStrokeColor} icon={icons.fillColor} onChange={$actions.setStrokeColor}></ColorPicker>

        <StrokeWidthPicker noneStrokeText={''} strokeWidths={$state.strokeWidths} value={$state.selectedStrokeWidth} onChange={$actions.setStrokeWidth} />
      </Commandbar>

      <Commandbar>
        <CommandbarSeparator />
        <ColorPicker colors={$state.fillColors} color={$state.selectedFillColor} icon={icons.fillColor} onChange={$actions.setFillColor}></ColorPicker>
      </Commandbar>
      <Commandbar>
        <CommandbarSeparator />
        <CommandbarButton icon={icons.ok} onClick={props.onSave}></CommandbarButton>
        <CommandbarButton icon={icons.close} onClick={props.onCancel}></CommandbarButton>
      </Commandbar>
    </div>
  )

  return app(state, actions, App, element)
}
