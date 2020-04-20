import { app, h, Component, ActionsType } from 'hyperapp'
import { CommandbarButton } from '../../common/CommandbarButton'
import { icons } from '../../common/icons'
import { Commandbar } from '../../common/Commandbar'
import { CommandbarSeparator } from '../../common/CommandbarSeparator'
import { ColorPicker } from '../../common/ColorPicker'
import { StrokeWidthPicker } from '../../common/StrokeWidthPicker'
import { translationManager } from '../../common/TranslationManager'

export interface AddFreetextAnnotationToolbarProps {
  colors: string[]
  selectedColor: string
  borderWidths: number[]
  selectedBorderWidth: number
  onColorChanged(color: string): void
  onBorderWidthChanged(borderWidth: number): void
  onClose(): void
}

interface AddFreetextAnnotationToolbarState {
  colors: string[]
  selectedColor: string
  borderWidths: number[]
  selectedBorderWidth: number
}

export interface AddFreetextAnnotationToolbarActions {
  setColor(color: string): AddFreetextAnnotationToolbarState
  setBorderWith(borderWidth: number): AddFreetextAnnotationToolbarState
}

export const createAddFreetextAnnotationToolbar = (props: AddFreetextAnnotationToolbarProps, element: HTMLElement) => {
  const state: AddFreetextAnnotationToolbarState = {
    colors: props.colors,
    selectedColor: props.selectedColor,
    borderWidths: props.borderWidths,
    selectedBorderWidth: props.selectedBorderWidth,
  }

  const actions: ActionsType<AddFreetextAnnotationToolbarState, AddFreetextAnnotationToolbarActions> = {
    setColor: (color: string) => ($state) => {
      props.onColorChanged(color)
      return {
        ...$state,
        selectedColor: color,
      }
    },
    setBorderWith: (borderWidth: number) => ($state) => {
      props.onBorderWidthChanged(borderWidth)
      return {
        ...$state,
        selectedBorderWidth: borderWidth,
      }
    },
  }

  const App = () => <AddFreetextAnnotationToolbar />

  /* tslint:disable-next-line:max-line-length */
  const AddFreetextAnnotationToolbar: Component<{}, AddFreetextAnnotationToolbarState, AddFreetextAnnotationToolbarActions> = ({}) => ($state, $actions) => (
    <div class="pwv-toolbar">
      <Commandbar>
        <ColorPicker colors={$state.colors} color={$state.selectedColor} icon={icons.fillColor} mode="buttons" onChange={$actions.setColor}></ColorPicker>

        <StrokeWidthPicker
          noneStrokeText={translationManager.getText('borderNone')}
          strokeWidths={$state.borderWidths}
          value={$state.selectedBorderWidth}
          onChange={$actions.setBorderWith}
        />
      </Commandbar>
      <Commandbar>
        <CommandbarSeparator />
        <CommandbarButton icon={icons.close} onClick={props.onClose}></CommandbarButton>
      </Commandbar>
    </div>
  )

  return app(state, actions, App, element)
}
