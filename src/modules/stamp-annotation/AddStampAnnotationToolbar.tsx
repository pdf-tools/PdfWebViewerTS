import { app, h, Component, ActionsType } from 'hyperapp'
import { CommandbarButton } from '../../common/CommandbarButton'
import { icons } from '../../common/icons'
import { Commandbar } from '../../common/Commandbar'
import { CommandbarSeparator } from '../../common/CommandbarSeparator'
import { Dropdown, DropdownItem } from '../../common/Dropdown'
import { translationManager } from '../../common/TranslationManager'

export interface AddStampAnnotationToolbarProps {
  selectedStamp: number
  stamps: any[]
  onStampChanged(stamp: number): void
  onClose(): void
}

interface AddStampAnnotationToolbarState {
  selectedStamp: number
  stamps: any[]
  stampDropdownItems: DropdownItem[]
}

export interface AddStampAnnotationToolbarActions {
  setStamp(stamp: number): AddStampAnnotationToolbarState
}

export const createAddStampAnnotationToolbar = (props: AddStampAnnotationToolbarProps, element: HTMLElement) => {
  const state: AddStampAnnotationToolbarState = {
    stamps: props.stamps,
    stampDropdownItems: [],
    selectedStamp: props.selectedStamp,
  }

  const actions: ActionsType<AddStampAnnotationToolbarState, AddStampAnnotationToolbarActions> = {
    setStamp: (stamp: number) => ($state) => {
      props.onStampChanged(stamp)
      return {
        ...$state,
        selectedStamp: stamp,
      }
    },
  }

  const DropdownStampItem = (item: any) => {
    const stamp = state.stamps[item.value]

    if (stamp.thumbnail) {
      return (
        <div>
          <img src={stamp.thumbnail} />
        </div>
      )
    }
    return <div>{stamp.image ? stamp.name : stamp.text ? stamp.text : translationManager.getText(stamp.translation_key)}</div>
  }

  const DropdownButton = (value: number) => {
    if (value === -1) {
      return <div>{translationManager.getText('chooseStamp')}</div>
    }

    const stamp = state.stamps[value as number]

    if (stamp.thumbnail) {
      return <img src={stamp.thumbnail} />
    }
    return <div>{stamp.image ? stamp.name : stamp.text ? stamp.text : translationManager.getText(stamp.translation_key)}</div>
  }

  const App = () => <AddStampAnnotationToolbar />

  /* tslint:disable-next-line:max-line-length */
  const AddStampAnnotationToolbar: Component<{}, AddStampAnnotationToolbarState, AddStampAnnotationToolbarActions> = ({}) => ($state, $actions) => (
    <div class="pwv-toolbar">
      <Commandbar>
        <Dropdown
          className="pwv-stampannotation-dropdown"
          value={$state.selectedStamp}
          items={$state.stamps.map((stamp, index) => ({
            value: index,
            renderItem: DropdownStampItem,
          }))}
          onChange={$actions.setStamp}
          renderButton={DropdownButton}
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
