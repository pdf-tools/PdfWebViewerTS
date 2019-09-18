import { app, h, Component, ActionsType } from 'hyperapp'
import { CommandbarButton } from '../../common/CommandbarButton'
import { icons } from '../../common/icons'

export interface AnnotationbarProps {
  onBtnAddClicked(): void
}

interface AnnotationbarState {
}

export interface AnnotationbarActions {
}

export const createAnnotationbar = (props: AnnotationbarProps, element: HTMLElement) => {

  const state: AnnotationbarState = {

  }

  const actions: AnnotationbarActions = {

  }

  const App = () => (
    <Annotationbar />
  )

  const Annotationbar: Component<{}, AnnotationbarState, AnnotationbarActions> = ({ }) => ($state, $actions) => (
    <div>
      <CommandbarButton
        icon={icons.freeText}
        onClick={props.onBtnAddClicked}
      >
      </CommandbarButton>
    </div>
  )

  return app(state, actions, App, element)
}
