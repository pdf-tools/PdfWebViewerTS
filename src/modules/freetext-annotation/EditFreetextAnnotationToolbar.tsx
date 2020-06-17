import { app, h, Component, ActionsType } from 'hyperapp'
import { CommandbarButton } from '../../common/CommandbarButton'
import { Dropdown } from '../../common/Dropdown'
import { ColorPicker } from '../../common/ColorPicker'
import { icons } from '../../common/icons'
import { ExecCommandArgs } from './RichTextEditor'
import { Commandbar } from '../../common/Commandbar'
import { CommandbarSeparator } from '../../common/CommandbarSeparator'
import { Annotation } from '../../pdf-viewer-api'
import { translationManager } from '../../common/TranslationManager'
import { StrokeWidthPicker } from '../../common/StrokeWidthPicker'

/** @internal */
export interface EditFreetextAnnotationToolbarProps {
  annotation: Annotation
  backgroundColors: string[]
  borderWidths: number[]
  selectedBorderWidth: number
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
  annotation: Annotation
  newSubject: string | null
  backgroundColors: string[]
  borderWidths: number[]
  selectedBorderWidth: number
  fontColors: string[]
  fontFamilies: string[]
  fontSizes: number[]
  selectedFont: string
  selectedBackgroundColor: string
  selectedFontColor: string
  selectedFontSize: string
  hasRangeSelection: boolean
}

export interface EditFreetextAnnotationToolbarActions {
  getState(): EditFreetextAnnotationToolbarState
  executeCommand(cmd: ExecCommandArgs): EditFreetextAnnotationToolbarState
  setBorderWith(borderWidth: number): EditFreetextAnnotationToolbarState
  setFontFamily(fontName: string): EditFreetextAnnotationToolbarState
  setFontSize(fontSize: number): EditFreetextAnnotationToolbarState
  setFontColor(color: string): EditFreetextAnnotationToolbarState
  setBackgroundColor(color: string): EditFreetextAnnotationToolbarState
  hasRangeSelectionChanged(hasRangeSelection: boolean): EditFreetextAnnotationToolbarState
  setSubject(subject: string | null): EditFreetextAnnotationToolbarState
  close(): EditFreetextAnnotationToolbarState
}

/** @internal */
export const createEditFreetextAnnotationToolbar = (props: EditFreetextAnnotationToolbarProps, element: HTMLElement) => {
  const state: EditFreetextAnnotationToolbarState = {
    annotation: props.annotation,
    newSubject: null,
    backgroundColors: props.backgroundColors,
    borderWidths: props.borderWidths,
    selectedBorderWidth: props.selectedBorderWidth,
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
    getState: () => ($state) => $state,

    setBorderWith: (borderWidth: number) => ($state) => {
      // props.onBorderWidthChanged(borderWidth)
      props.onCmd({ cmd: 'setBorderWidth', args: borderWidth })
      return {
        ...$state,
        selectedBorderWidth: borderWidth,
      }
    },

    executeCommand: (cmd: ExecCommandArgs) => ($state) => {
      props.onCmd(cmd)
      return $state
    },
    setFontFamily: (fontName: string) => ($state) => {
      props.onCmd({ cmd: 'setFont', args: fontName as string })
      return {
        ...$state,
        selectedFont: fontName,
      }
    },
    setFontSize: (fontSize: string) => ($state) => {
      props.onCmd({ cmd: 'setFontSize', args: fontSize as string })
      return {
        ...$state,
        selectedFontSize: `${fontSize}pt`,
      }
    },
    setFontColor: (color: string) => ($state) => {
      props.onCmd({ cmd: 'setFontColor', args: color as string })
      return {
        ...$state,
        selectedFontColor: color,
      }
    },
    setBackgroundColor: (color: string) => ($state) => {
      props.onCmd({ cmd: 'setFillColor', args: color as string })
      return {
        ...$state,
        selectedBackgroundColor: color,
      }
    },
    setSubject: (subject: string | null) => ($state) => {
      return {
        ...$state,
        annotation: $state.annotation,
        newSubject: subject,
      }
    },
    hasRangeSelectionChanged: (hasRangeSelection: boolean) => ($state) => ({
      ...$state,
      hasRangeSelection,
    }),
    close: () => ($state) => {
      props.onClose()
      return $state
    },
  }

  const App = () => <EditFreetextAnnotationToolbar />

  /* tslint:disable-next-line:max-line-length */
  const EditFreetextAnnotationToolbar: Component<{}, EditFreetextAnnotationToolbarState, EditFreetextAnnotationToolbarActions> = ({}) => ($state, $actions) => (
    <div class="pwv-toolbar">
      <Commandbar>
        <Dropdown
          text={$state.selectedFont}
          value={$state.selectedFont}
          width={130}
          items={state.fontFamilies.map((font) => ({ text: font, value: font }))}
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
        <ColorPicker colors={$state.fontColors} icon={icons.fontColor} color={$state.selectedFontColor} onChange={$actions.setFontColor} />
        <ColorPicker colors={$state.backgroundColors} icon={icons.fillColor} color={$state.selectedBackgroundColor} onChange={$actions.setBackgroundColor} />

        <StrokeWidthPicker
          noneStrokeText={translationManager.getText('borderNone')}
          strokeWidths={$state.borderWidths}
          value={$state.selectedBorderWidth}
          onChange={$actions.setBorderWith}
        />

        <CommandbarSeparator />
      </Commandbar>
      <Commandbar>
        <CommandbarButton
          icon={icons.alignLeft}
          onClick={() => {
            $actions.executeCommand({ cmd: 'justifyLeft' })
          }}
        />
        <CommandbarButton
          icon={icons.alignCenter}
          onClick={() => {
            $actions.executeCommand({ cmd: 'justifyCenter' })
          }}
        />
        <CommandbarButton
          icon={icons.alignRight}
          onClick={() => {
            $actions.executeCommand({ cmd: 'justifyRight' })
          }}
        />
        <CommandbarSeparator />
        <CommandbarButton
          icon={icons.bold}
          onClick={() => {
            $actions.executeCommand({ cmd: 'bold' })
          }}
        />
        <CommandbarButton
          icon={icons.italic}
          onClick={() => {
            $actions.executeCommand({ cmd: 'italic' })
          }}
        />
        <CommandbarButton
          icon={icons.underline}
          onClick={() => {
            $actions.executeCommand({ cmd: 'underline' })
          }}
        />
        <CommandbarSeparator />
      </Commandbar>
      <Commandbar>
        <CommandbarButton
          icon={$state.annotation.isLocked() ? icons.lock : icons.unlock}
          onClick={() => {
            $state.annotation.setLock(!$state.annotation.isLocked())
            $actions.close()
          }}
        />
        <CommandbarSeparator />
        <div class={'pwv-freetext-subject'}>
          <input
            id={'pwv-freetext-subject-' + $state.annotation.id}
            placeholder={translationManager.getText('annotation.subject')}
            onchange={(e: UIEvent) => {
              $actions.setSubject((e.currentTarget as HTMLTextAreaElement).value)
            }}
            value={$state.annotation.subject}
          />
        </div>
      </Commandbar>
      <Commandbar>
        <CommandbarButton icon={icons.ok} onClick={$actions.close} />
      </Commandbar>
    </div>
  )

  return app(state, actions, App, element)
}
