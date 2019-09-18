import { app, h, Component, ActionsType } from 'hyperapp'
import { CommandbarButton } from '../../common/CommandbarButton'
import { icons } from '../../common/icons'

export interface AnnotationbarProps {
  onBtnAddClicked(): void
}

interface AnnotationbarState {
  active: boolean,
  disabled: boolean,
}

export interface AnnotationbarActions {
  setActive(active: boolean): AnnotationbarState
  setDisabled(disabled: boolean): AnnotationbarState
}

export const createAnnotationbar = (props: AnnotationbarProps, element: HTMLElement) => {

  const state: AnnotationbarState = {
    active: false,
    disabled: false,
  }

  const actions: ActionsType<AnnotationbarState, AnnotationbarActions> = {
    setActive: (active: boolean) => $state => ({
      ...$state,
      active,
    }),
    setDisabled: (disabled: boolean) => $state => ({
      ...$state,
      disabled,
    }),
  }

  const App = () => (
    <Annotationbar />
  )

  const Annotationbar: Component<{}, AnnotationbarState, AnnotationbarActions> = ({ }) => ($state, $actions) => (
    <div>
      <CommandbarButton
        icon={icons.stamp}
        onClick={props.onBtnAddClicked}
        disabled={$state.disabled}
        active={$state.active}
      >
      </CommandbarButton>
    </div>
  )

  return app(state, actions, App, element)
}
