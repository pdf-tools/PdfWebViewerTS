import { app, h, Component, ActionsType } from 'hyperapp'
import { CommandbarButton } from '../../common/CommandbarButton'
import { icons } from '../../common/icons'
import { Commandbar } from '../../common/Commandbar'
import { CommandbarSeparator } from '../../common/CommandbarSeparator'
import { ColorPicker } from '../../common/ColorPicker'

export interface AddTextAnnotationToolbarProps {
  colors: string[]
  selectedColor: string
  onColorChanged(color: string): void
  onClose(): void
}

interface AddTextAnnotationToolbarState {
  colors: string[]
  selectedColor: string
}

export interface AddTextAnnotationToolbarActions {
  setColor(color: string): AddTextAnnotationToolbarState
}

export const createAddTextAnnotationToolbar = (props: AddTextAnnotationToolbarProps, element: HTMLElement) => {

  const state: AddTextAnnotationToolbarState = {
    colors: props.colors,
    selectedColor: props.selectedColor,
  }

  const actions: ActionsType<AddTextAnnotationToolbarState, AddTextAnnotationToolbarActions> = {
    setColor: (color: string) => $state => {
      props.onColorChanged(color)
      return {
        ...$state,
        selectedColor: color,
      }
    },
  }

  const App = () => (
    <AddTextAnnotationToolbar />
  )

  const AddTextAnnotationToolbar: Component<{}, AddTextAnnotationToolbarState, AddTextAnnotationToolbarActions> = ({ }) => ($state, $actions) => (
    <div class="pwv-toolbar">
      <Commandbar>
        <ColorPicker
          colors={$state.colors}
          color={$state.selectedColor}
          icon={icons.fillColor}
          mode="buttons"
          onChange={$actions.setColor}
        >
        </ColorPicker>
      </Commandbar>
      <Commandbar>
        <CommandbarSeparator />
        <CommandbarButton
          icon={icons.close}
          onClick={props.onClose}
        >
        </CommandbarButton>
      </Commandbar>
    </div>
  )

  return app(state, actions, App, element)
}
