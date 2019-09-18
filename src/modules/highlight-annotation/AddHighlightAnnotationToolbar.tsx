import { app, h, Component, ActionsType } from 'hyperapp'
import { CommandbarButton } from '../../common/CommandbarButton'
import { icons } from '../../common/icons'
import { Commandbar } from '../../common/Commandbar'
import { CommandbarSeparator } from '../../common/CommandbarSeparator'
import { ColorPicker } from '../../common/ColorPicker'
import { PdfItemType } from '../../pdf-viewer-api'

export interface AddHighlightAnnotationToolbarProps {
  colors: string[]
  selectedColor: string
  selectedItemType: PdfItemType
  onItemTypeChanged(itemType: PdfItemType): void
  onColorChanged(color: string): void
  onClose(): void
}

interface AddHighlightAnnotationToolbarState {
  colors: string[]
  selectedItemType: PdfItemType
  selectedColor: string
}

export interface AddHighlightAnnotationToolbarActions {
  setColor(color: string): AddHighlightAnnotationToolbarState
  setItemType(itemType: PdfItemType): AddHighlightAnnotationToolbarState
}

export const createAddHighlightAnnotationToolbar = (props: AddHighlightAnnotationToolbarProps, element: HTMLElement) => {

  const state: AddHighlightAnnotationToolbarState = {
    colors: props.colors,
    selectedItemType: props.selectedItemType,
    selectedColor: props.selectedColor,
  }

  const actions: ActionsType<AddHighlightAnnotationToolbarState, AddHighlightAnnotationToolbarActions> = {
    setColor: (color: string) => $state => {
      props.onColorChanged(color)
      return {
        ...$state,
        selectedColor: color,
      }
    },
    setItemType: (itemType: PdfItemType) => $state => {
      props.onItemTypeChanged(itemType)
      return {
        ...$state,
        selectedItemType: itemType,
      }
    },
  }

  const App = () => (
    <AddHighlightAnnotationToolbar />
  )

  /* tslint:disable-next-line:max-line-length */
  const AddHighlightAnnotationToolbar: Component<{}, AddHighlightAnnotationToolbarState, AddHighlightAnnotationToolbarActions> = ({ }) => ($state, $actions) => (
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
        <CommandbarSeparator />
        <CommandbarButton
          icon={icons.highlighter}
          active={$state.selectedItemType === PdfItemType.HIGHLIGHT}
          onClick={() => { $actions.setItemType(PdfItemType.HIGHLIGHT) }}
        >
        </CommandbarButton>
        <CommandbarButton
          icon={icons.underline}
          active={$state.selectedItemType === PdfItemType.UNDERLINE}
          onClick={() => { $actions.setItemType(PdfItemType.UNDERLINE) }}
        />
        <CommandbarButton
          icon={icons.squiggly}
          active={$state.selectedItemType === PdfItemType.SQUIGGLY}
          onClick={() => { $actions.setItemType(PdfItemType.SQUIGGLY) }}
        />
        <CommandbarButton
          icon={icons.strikethrough}
          active={$state.selectedItemType === PdfItemType.STRIKE_OUT}
          onClick={() => { $actions.setItemType(PdfItemType.STRIKE_OUT) }}
        />
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
