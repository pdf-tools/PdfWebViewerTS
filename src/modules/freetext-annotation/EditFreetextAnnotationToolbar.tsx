import { app, h, Component, ActionsType } from 'hyperapp'
import { CommandbarButton } from '../../common/CommandbarButton'
import { Dropdown } from '../../common/Dropdown'
import { ColorPicker } from '../../common/ColorPicker'
import { icons } from '../../common/icons'
import { ExecCommandArgs } from './RichTextEditor'
import { Commandbar } from '../../common/Commandbar'
import { CommandbarSeparator } from '../../common/CommandbarSeparator'

/** @internal */
export interface EditFreetextAnnotationToolbarProps {
  backgroundColors: string[]
  fontColors: string[]
  fontFamilies: string[]
  fontSizes: number[]
  selectedFont: string
  selectedBackgroundColor: string
  selectedFontColor: string
  selectedFontSize: string
  onCmd(cmd: ExecCommandArgs): void
  onClose(): void
}

/** @internal */
export interface EditFreetextAnnotationToolbarState {
  backgroundColors: string[]
  fontColors: string[]
  fontFamilies: string[]
  fontSizes: number[]
  selectedFont: string
  selectedBackgroundColor: string
  selectedFontColor: string
  selectedFontSize: string
  hasRangeSelection: boolean
}

/** @internal */
export interface EditFreetextAnnotationToolbarActions {
  executeCommand(cmd: ExecCommandArgs): EditFreetextAnnotationToolbarState
  setFontFamily(fontName: string): EditFreetextAnnotationToolbarState
  setFontSize(fontSize: number): EditFreetextAnnotationToolbarState
  setFontColor(color: string): EditFreetextAnnotationToolbarState
  setBackgroundColor(color: string): EditFreetextAnnotationToolbarState
  hasRangeSelectionChanged(hasRangeSelection: boolean): EditFreetextAnnotationToolbarState
  close(): EditFreetextAnnotationToolbarState
}

/** @internal */
export const createEditFreetextAnnotationToolbar = (props: EditFreetextAnnotationToolbarProps, element: HTMLElement) => {

  const state: EditFreetextAnnotationToolbarState = {
    backgroundColors: props.backgroundColors,
    fontColors: props.fontColors,
    fontFamilies: props.fontFamilies,
    fontSizes: props.fontSizes,
    selectedFont: props.selectedFont,
    selectedBackgroundColor: props.selectedBackgroundColor,
    selectedFontColor: props.selectedFontColor,
    selectedFontSize: props.selectedFontSize,
    hasRangeSelection: false,
  }

  const actions: ActionsType<EditFreetextAnnotationToolbarState, EditFreetextAnnotationToolbarActions> = {
    executeCommand: (cmd: ExecCommandArgs) => $state => {
      props.onCmd(cmd)
      return $state
    },
    setFontFamily: (fontName: string) => $state => {
      props.onCmd({ cmd: 'setFont', args: fontName as string })
      return {
        ...$state,
        selectedFont: fontName,
      }
    },
    setFontSize: (fontSize: string) => $state => {
      props.onCmd({ cmd: 'setFontSize', args: fontSize as string })
      return {
        ...$state,
        selectedFontSize: `${fontSize}pt`,
      }
    },
    setFontColor: (color: string) => $state => {
      props.onCmd({ cmd: 'setFontColor', args: color as string })
      return {
        ...$state,
        selectedFontColor: color,
      }
    },
    setBackgroundColor: (color: string) => $state => {
      props.onCmd({ cmd: 'setFillColor', args: color as string })
      return {
        ...$state,
        selectedBackgroundColor: color,
      }
    },
    hasRangeSelectionChanged: (hasRangeSelection: boolean) => $state => ({
      ...$state,
      hasRangeSelection,
    }),
    close: () => $state => {
      props.onClose()
      return $state
    },
  }

  const App = () => (
    <EditFreetextAnnotationToolbar />
  )

  /* tslint:disable-next-line:max-line-length */
  const EditFreetextAnnotationToolbar: Component<{}, EditFreetextAnnotationToolbarState, EditFreetextAnnotationToolbarActions> = ({ }) => ($state, $actions) => (
    <div class="pwv-toolbar">
      <Commandbar>
        <Dropdown
          text={$state.selectedFont}
          value={$state.selectedFont}
          width={130}
          items={state.fontFamilies.map(font => ({ text: font, value: font }))}
          onChange={$actions.setFontFamily}
        />
        <Dropdown
          text={$state.selectedFontSize}
          value={$state.selectedFontSize}
          width={70}
          align="right"
          items={state.fontSizes.map((size, index) => ({ text: `${size}pt`, value: size }))}
          onChange={$actions.setFontSize}
        />
        <CommandbarSeparator />
        <ColorPicker
          colors={$state.fontColors}
          icon={icons.fontColor}
          color={$state.selectedFontColor}
          onChange={$actions.setFontColor}
        />
        <ColorPicker
          colors={$state.backgroundColors}
          icon={icons.fillColor}
          color={$state.selectedBackgroundColor}
          onChange={$actions.setBackgroundColor}
        />
        <CommandbarSeparator />
      </Commandbar>
      <Commandbar>
        <CommandbarButton
          icon={icons.alignLeft}
          onClick={() => { $actions.executeCommand({ cmd: 'justifyLeft' }) }}
        />
        <CommandbarButton
          icon={icons.alignCenter}
          onClick={() => { $actions.executeCommand({ cmd: 'justifyCenter' }) }}
        />
        <CommandbarButton
          icon={icons.alignRight}
          onClick={() => { $actions.executeCommand({ cmd: 'justifyRight' }) }}
        />
        <CommandbarSeparator />
        <CommandbarButton
          icon={icons.bold}
          onClick={() => { $actions.executeCommand({ cmd: 'bold' }) }}
        />
        <CommandbarButton
          icon={icons.italic}
          onClick={() => { $actions.executeCommand({ cmd: 'italic' }) }}
        />
        <CommandbarButton
          icon={icons.underline}
          onClick={() => { $actions.executeCommand({ cmd: 'underline' }) }}
        />
      </Commandbar>
      <Commandbar>
        <CommandbarButton
          icon={icons.ok}
          onClick={$actions.close}
        />
      </Commandbar>
    </div>
  )

  return app(state, actions, App, element)
}
