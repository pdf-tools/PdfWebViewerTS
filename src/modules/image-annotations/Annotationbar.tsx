import { app, h, Component, ActionsType } from 'hyperapp'
import { CommandbarButton } from '../../common/CommandbarButton'
import { CommandbarFileButton } from '../../common/CommandbarFileButton'
import { icons } from '../../common/icons'

export interface AnnotationbarProps {
  onFileSelected(file: File): void
}

interface AnnotationbarState {}

interface AnnotationbarActions {}

export const createAnnotationbar = (props: AnnotationbarProps, element: HTMLElement) => {
  const state: AnnotationbarState = {}

  const actions: AnnotationbarActions = {}

  const App = () => <Annotationbar />

  const Annotationbar: Component<{}, AnnotationbarState, AnnotationbarActions> = ({}) => ($state, $actions) => (
    <div>
      <CommandbarFileButton icon={icons.image} onFileSelected={props.onFileSelected} accept="image/*"></CommandbarFileButton>
    </div>
  )

  return app(state, actions, App, element)
}
