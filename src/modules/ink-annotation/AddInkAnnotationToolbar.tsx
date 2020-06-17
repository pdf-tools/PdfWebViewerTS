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

export interface AddInkAnnotationToolbarProps {
  penColors: string[]
  penWidths: number[]
  selectedPenColor: string
  selectedPenSize: number
  penOpacity: number
  onPenColorChanged(color: string): void
  onPenSizeChanged(width: number): void
  onPenOpacityChanged(width: number): void
  onUndo(): void
  onCancel(): void
  onSave(): void
  onAdd(): void
}

interface AddInkAnnotationToolbarState {
  penColors: string[]
  penWidths: number[]
  selectedPenColor: string
  selectedPenSize: number
  penOpacity: number
  lineCount: number
}

export interface AddInkAnnotationToolbarActions {
  setPenColor(color: string): AddInkAnnotationToolbarState
  setPenSize(size: number): AddInkAnnotationToolbarState
  setPenOpacity(opacity: number): AddInkAnnotationToolbarState
  setLineCount(lineCount: number): AddInkAnnotationToolbarState
}

export const createAddInkAnnotationToolbar = (props: AddInkAnnotationToolbarProps, element: HTMLElement) => {
  const state: AddInkAnnotationToolbarState = {
    penColors: props.penColors,
    penWidths: props.penWidths,
    selectedPenColor: props.selectedPenColor,
    selectedPenSize: props.selectedPenSize,
    penOpacity: props.penOpacity,
    lineCount: 0,
  }

  const actions: ActionsType<AddInkAnnotationToolbarState, AddInkAnnotationToolbarActions> = {
    setPenColor: (color: string) => ($state) => {
      props.onPenColorChanged(color)
      return {
        ...$state,
        selectedPenColor: color,
      }
    },
    setPenSize: (width: number) => ($state) => {
      props.onPenSizeChanged(width)
      return {
        ...$state,
        selectedPenSize: width,
      }
    },
    setPenOpacity: (opacity: number) => ($state) => {
      props.onPenOpacityChanged(opacity)
      return {
        ...$state,
        penOpacity: opacity,
      }
    },
    setLineCount: (lineCount: number) => ($state) => ({
      ...$state,
      lineCount,
    }),
  }

  const App = () => <AddInkAnnotationToolbar />

  const AddInkAnnotationToolbar: Component<{}, AddInkAnnotationToolbarState, AddInkAnnotationToolbarActions> = ({}) => ($state, $actions) => (
    <div class="pwv-toolbar">
      <Commandbar>
        <ColorPicker
          colors={$state.penColors}
          color={$state.selectedPenColor}
          icon={icons.fillColor}
          mode="buttons"
          onChange={$actions.setPenColor}
        ></ColorPicker>
        <RangeSlider
          min={10}
          max={100}
          step={1}
          value={$state.penOpacity}
          text={`${$state.penOpacity} %`}
          icon={icons.drop}
          onChange={$actions.setPenOpacity}
          className="pwv-opacityslider"
        ></RangeSlider>

        <StrokeWidthPicker noneStrokeText={''} strokeWidths={$state.penWidths} value={$state.selectedPenSize} onChange={$actions.setPenSize} />
      </Commandbar>
      <Commandbar>
        <CommandbarSeparator />
        <CommandbarButton
          icon={icons.eraser}
          onClick={props.onUndo}
          disabled={$state.lineCount < 1}
          tooltip="Remove last line"
          tooltipPos={TooltipPosition.bottom}
        />
        <CommandbarButton icon={icons.addLayer} onClick={props.onAdd} disabled={$state.lineCount < 1} />
      </Commandbar>
      <Commandbar>
        <CommandbarSeparator />
        <CommandbarButton icon={icons.ok} onClick={props.onSave}></CommandbarButton>
      </Commandbar>
    </div>
  )

  return app(state, actions, App, element)
}
