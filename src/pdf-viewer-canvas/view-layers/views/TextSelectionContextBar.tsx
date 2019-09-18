import { app, h, Component, ActionsType } from 'hyperapp'
import { CommandbarButton } from '../../../common/CommandbarButton'
import { ColorPicker } from '../../../common/ColorPicker'
import { Contextbar } from '../../../common/Contextbar'
import { ContextbarRow } from '../../../common/ContextbarRow'
import { ContextbarGroup } from '../../../common/ContextbarGroup'
import { icons } from '../../../common/icons'
import { PdfItemType } from '../../../pdf-viewer-api'

/** @internal */
export interface TextSelectionContextBarProps {
  highlightColors: string[]
  onCreateAnnotation(type: PdfItemType, color: string): void
  onCopyText(): void
}

interface ContextBarState {
  highlightColors: string[]
}

interface ContextBarActions {
}

/** @internal */
export const createTextSelectionContextBar = (props: TextSelectionContextBarProps, element: HTMLElement) => {
  const state: ContextBarState = {
    highlightColors: props.highlightColors,
  }

  const actions: ActionsType<ContextBarState, ContextBarActions> = {
  }

  const App = () => (
    <ContextBar />
  )

  const ContextBar: Component<{}, ContextBarState, ContextBarActions> = ({ }) => ($state, $actions) => {
    return (
      <Contextbar>
        <ContextbarRow>
          <ContextbarGroup>
            <CommandbarButton
              icon={icons.copy}
              onClick={props.onCopyText}
            />
            <ColorPicker
              colors={$state.highlightColors}
              icon={icons.highlighter}
              color="#000000ff"
              onChange={color => {
                props.onCreateAnnotation(PdfItemType.HIGHLIGHT, color)
              }}
            />
            <ColorPicker
              colors={$state.highlightColors}
              icon={icons.underline}
              color="#000000ff"
              onChange={color => {
                props.onCreateAnnotation(PdfItemType.UNDERLINE, color)
              }}
            />
            <ColorPicker
              colors={$state.highlightColors}
              icon={icons.squiggly}
              color="#000000ff"
              onChange={color => {
                props.onCreateAnnotation(PdfItemType.SQUIGGLY, color)
              }}
            />
            <ColorPicker
              colors={$state.highlightColors}
              icon={icons.strikethrough}
              color="#000000ff"
              onChange={color => {
                props.onCreateAnnotation(PdfItemType.STRIKE_OUT, color)
              }}
            />
          </ContextbarGroup>
        </ContextbarRow>
      </Contextbar>
    )
  }
  return app(state, actions, App, element)
}
