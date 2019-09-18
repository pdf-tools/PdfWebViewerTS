import { app, h, Component, ActionsType } from 'hyperapp'
import { CommandbarButton } from '../../common/CommandbarButton'
import { icons } from '../../common/icons'
import { Commandbar } from '../../common/Commandbar'
import { CommandbarSeparator } from '../../common/CommandbarSeparator'
import { ColorPicker } from '../../common/ColorPicker'

export interface AddFreetextAnnotationToolbarProps {
  colors: string[]
  selectedColor: string
  onColorChanged(color: string): void
  onClose(): void
}

interface AddFreetextAnnotationToolbarState {
  colors: string[]
  selectedColor: string
}

export interface AddFreetextAnnotationToolbarActions {
  setColor(color: string): AddFreetextAnnotationToolbarState
}

export const createAddFreetextAnnotationToolbar = (props: AddFreetextAnnotationToolbarProps, element: HTMLElement) => {

  const state: AddFreetextAnnotationToolbarState = {
    colors: props.colors,
    selectedColor: props.selectedColor,
  }

  const actions: ActionsType<AddFreetextAnnotationToolbarState, AddFreetextAnnotationToolbarActions> = {
    setColor: (color: string) => $state => {
      props.onColorChanged(color)
      return {
        ...$state,
        selectedColor: color,
      }
    },
  }

  const App = () => (
    <AddFreetextAnnotationToolbar />
  )

  /* tslint:disable-next-line:max-line-length */
  const AddFreetextAnnotationToolbar: Component<{}, AddFreetextAnnotationToolbarState, AddFreetextAnnotationToolbarActions> = ({ }) => ($state, $actions) => (
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
