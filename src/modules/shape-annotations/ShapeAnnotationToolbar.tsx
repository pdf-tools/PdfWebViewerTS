import { app, h, Component, ActionsType } from 'hyperapp'
import { AnnotationBorderStyle } from '../../pdf-viewer-api'
import { CommandbarButton } from '../../common/CommandbarButton'
import { icons } from '../../common/icons'
import { Commandbar } from '../../common/Commandbar'
import { CommandbarSeparator } from '../../common/CommandbarSeparator'
import { DropdownItem, Dropdown } from '../../common/Dropdown'
import { StrokeWidthPicker } from '../../common/StrokeWidthPicker'
import { StrokeStylePicker } from '../../common/StrokeStylePicker'
import { RangeSlider } from '../../common/RangeSlider'
import { ColorPicker } from '../../common/ColorPicker'
import { TooltipPosition } from '../../common/Tooltip'

export interface ShapeAnnotationToolbarProps {
  strokeColors: string[]
  strokeWidths: number[]
  fillColors: string[]
  selectedStrokeColor: string
  selectedStrokeWidth: number
  selectedStrokeStyle: AnnotationBorderStyle
  selectedFillColor: string
  onStrokeColorChanged(color: string): void
  onStrokeWidthChanged(width: number): void
  onStrokeStyleChanged(style: AnnotationBorderStyle): void
  onFillColorChanged(color: string): void
  onCancel(): void
}

interface ShapeAnnotationToolbarState {
  strokeColors: string[]
  strokeWidths: number[]
  fillColors: string[]
  selectedStrokeColor: string
  selectedStrokeWidth: number
  selectedStrokeStyle: AnnotationBorderStyle
  selectedFillColor: string
}

export interface ShapeAnnotationToolbarActions {
  setStrokeColor(color: string): void
  setStrokeWidth(width: number): void
  setStrokeStyle(style: AnnotationBorderStyle): void
  setFillColor(width: string): void
  setCancel(): void
}

export const createShapeAnnotationToolbar = (props: ShapeAnnotationToolbarProps, element: HTMLElement) => {
  const state: ShapeAnnotationToolbarState = {
    strokeColors: props.strokeColors,
    strokeWidths: props.strokeWidths,
    fillColors: props.fillColors,
    selectedStrokeColor: props.selectedStrokeColor,
    selectedStrokeWidth: props.selectedStrokeWidth,
    selectedStrokeStyle: props.selectedStrokeStyle,
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
    setStrokeStyle: (style: AnnotationBorderStyle) => ($state) => {
      props.onStrokeStyleChanged(style)
      return { ...$state, selectedStrokeStyle: style }
    },
    setFillColor: (color: string) => ($state) => {
      props.onFillColorChanged(color)
      return { ...$state, selectedFillColor: color }
    },
    setCancel: () => ($state) => {
      return { ...$state }
    },
  }

  const App = () => <ShapeAnnotationToolbar />

  const ShapeAnnotationToolbar: Component<{}, ShapeAnnotationToolbarState, ShapeAnnotationToolbarActions> = ({}) => ($state, $actions) => (
    <div class="pwv-toolbar">
      <Commandbar>
        <ColorPicker colors={$state.strokeColors} color={$state.selectedStrokeColor} icon={icons.pencil} onChange={$actions.setStrokeColor}></ColorPicker>
        <StrokeWidthPicker noneStrokeText={''} strokeWidths={$state.strokeWidths} value={$state.selectedStrokeWidth} onChange={$actions.setStrokeWidth} />
        <StrokeStylePicker value={$state.selectedStrokeStyle} onChange={$actions.setStrokeStyle} />
      </Commandbar>

      <Commandbar>
        <CommandbarSeparator />
        <ColorPicker colors={$state.fillColors} color={$state.selectedFillColor} icon={icons.fillColor} onChange={$actions.setFillColor}></ColorPicker>
      </Commandbar>
      <Commandbar>
        <CommandbarSeparator />
        <CommandbarButton icon={icons.close} onClick={props.onCancel}></CommandbarButton>
      </Commandbar>
    </div>
  )

  return app(state, actions, App, element)
}
