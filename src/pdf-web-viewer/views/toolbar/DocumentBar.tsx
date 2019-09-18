import { h, Component } from 'hyperapp'
import { PdfWebViewerState, PdfWebViewerActions } from '../../PdfWebViewer'
import { CommandbarButton } from '../../../common/CommandbarButton'
import { CommandbarFileButton } from '../../../common/CommandbarFileButton'
import { icons } from '../../../common/icons'

/** @internal */
export const DocumentBar: Component<{}, PdfWebViewerState, PdfWebViewerActions> = ({}) => (state, actions) => (
  <div class="pwv-commandbar pwv-document-toolbar">
    {(state.options.allowOpenFile && !state.options.onOpenFileButtonClicked) &&
      <CommandbarFileButton
        icon={icons.openFile}
        onFileSelected={file => actions.api.openFile({file})}
      />
    }
    {(state.options.allowOpenFile && state.options.onOpenFileButtonClicked) &&
      <CommandbarButton
        icon={icons.openFile}
        onClick={state.options.onOpenFileButtonClicked}
      />
    }
    {state.options.allowSaveFile &&
      <CommandbarButton
        icon={icons.saveFile}
        onClick={() => {
          if (state.options.onSaveFileButtonClicked) {
            state.options.onSaveFileButtonClicked()
          } else {
            actions.api.downloadFile()
          }
        }}
      />
    }
  </div>
)
