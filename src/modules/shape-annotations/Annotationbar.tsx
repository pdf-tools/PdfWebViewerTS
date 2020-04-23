import { app, h, Component, ActionsType } from 'hyperapp'
import { CommandbarButton } from '../../common/CommandbarButton'
import { Dropdown } from '../../common/Dropdown'
import { icons } from '../../common/icons'

export interface AnnotationbarProps {
  onBtnAddClicked(): void
}

interface AnnotationbarState {}

interface AnnotationbarActions {}

export const createAnnotationbar = (props: AnnotationbarProps, element: HTMLElement) => {
  const state: AnnotationbarState = {}

  const actions: AnnotationbarActions = {}

  const App = () => <Annotationbar />

  const Annotationbar: Component<{}, AnnotationbarState, AnnotationbarActions> = ({}) => ($state, $actions) => {
    const items = [
      { value: 'R', renderItem: () => <CommandbarButton icon={icons.rectangle} onClick={props.onBtnAddClicked}></CommandbarButton> },
      { value: 'C', renderItem: () => <CommandbarButton icon={icons.circle} onClick={props.onBtnAddClicked}></CommandbarButton> },
    ]
    return (
      <div>
        <Dropdown items={items} value="R" hideCaret={true} icon={icons.shapes} align="center" className="pwv-annotationbar-tool-picker" />
      </div>
    )
  }

  return app(state, actions, App, element)
}
