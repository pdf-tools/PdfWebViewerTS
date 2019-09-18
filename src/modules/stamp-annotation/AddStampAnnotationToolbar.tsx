import { app, h, Component, ActionsType } from 'hyperapp'
import { CommandbarButton } from '../../common/CommandbarButton'
import { icons } from '../../common/icons'
import { Commandbar } from '../../common/Commandbar'
import { CommandbarSeparator } from '../../common/CommandbarSeparator'
import { Dropdown } from '../../common/Dropdown'
import { translationManager } from '../../common/TranslationManager'

export interface AddStampAnnotationToolbarProps {
  stampText: string | null
  colors: string[]
  selectedColor: string
  onStampTextSelected(stampText: string): void
  onColorChanged(color: string): void
  onClose(): void
}

interface AddStampAnnotationToolbarState {
  stampText: string | null
  colors: string[]
  selectedColor: string
}

export interface AddStampAnnotationToolbarActions {
  setColor(color: string): AddStampAnnotationToolbarState
  setStampText(stampText: string): AddStampAnnotationToolbarState
}

export const createAddStampAnnotationToolbar = (props: AddStampAnnotationToolbarProps, element: HTMLElement) => {

  const state: AddStampAnnotationToolbarState = {
    stampText: props.stampText,
    selectedColor: props.selectedColor,
    colors: props.colors,
  }

  const actions: ActionsType<AddStampAnnotationToolbarState, AddStampAnnotationToolbarActions> = {
    setColor: (color: string) => $state => {
      props.onColorChanged(color)
      return {
        ...$state,
        selectedColor: color,
      }
    },
    setStampText: (stampText: string) => $state => {
      props.onStampTextSelected(stampText)
      return {
        ...$state,
        stampText,
      }
    },
  }

  const App = () => (
    <AddStampAnnotationToolbar />
  )

  /* tslint:disable-next-line:max-line-length */
  const AddStampAnnotationToolbar: Component<{}, AddStampAnnotationToolbarState, AddStampAnnotationToolbarActions> = ({ }) => ($state, $actions) => (
    <div class="pwv-toolbar">
      <Commandbar>
        <Dropdown
          hideCaret={false}
          value={$state.stampText !== null ? $state.stampText : translationManager.getText('choose_stamp')}
          items={[
            { text: translationManager.getText('stamptext.approved'), value: 'stamptext.approved' },
            { text: translationManager.getText('stamptext.notApproved'), value: 'stamptext.notApproved' },
            { text: translationManager.getText('stamptext.draft'), value: 'stamptext.draft' },
            { text: translationManager.getText('stamptext.final'), value: 'stamptext.final' },
            { text: translationManager.getText('stamptext.completed'), value: 'stamptext.completed' },
            { text: translationManager.getText('stamptext.confidential'), value: 'stamptext.confidential' },
            { text: translationManager.getText('stamptext.forPublic'), value: 'stamptext.forPublic' },
            { text: translationManager.getText('stamptext.notForPublic'), value: 'stamptext.notForPublic' },
            { text: translationManager.getText('stamptext.void'), value: 'stamptext.void' },
            { text: translationManager.getText('stamptext.forComment'), value: 'stamptext.forComment' },
            { text: translationManager.getText('stamptext.preliminaryResults'), value: 'stamptext.preliminaryResults' },
            { text: translationManager.getText('stamptext.informationOnly'), value: 'stamptext.informationOnly' },
          ]}
          onChange={$actions.setStampText}
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
