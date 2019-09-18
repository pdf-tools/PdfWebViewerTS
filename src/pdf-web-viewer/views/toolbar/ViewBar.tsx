import { h, Component } from 'hyperapp'
import { PdfFitMode, PdfPageLayoutMode } from '../../../pdf-viewer-api'
import { PdfWebViewerState, PdfWebViewerActions } from '../../PdfWebViewer'
import { CommandbarButton } from '../../../common/CommandbarButton'
import { Dropdown } from '../../../common/Dropdown'
import { translationManager } from '../../../common/TranslationManager'
import { icons } from '../../../common/icons'

/** @internal */
export const ViewBar: Component<{}, PdfWebViewerState, PdfWebViewerActions> = ({ }) => (state, actions) => {
  const layoutModeItems = state.options.pageLayoutModes.map(m => ({
    text: translationManager.getText(`pageLayoutMode.${PdfPageLayoutMode[m]}`),
    value: m,
  }))
  const currentLayoutModeItem = state.options.pageLayoutModes.find(m => m === state.pdfDocument.pageLayoutMode)
  return (
    <div class="pwv-commandbar pwv-view-toolbar">
      {state.pdfDocument.fitMode === PdfFitMode.ACTUAL_SIZE &&
        <CommandbarButton
          icon={icons.fitActualSize}
          onClick={() => { actions.api.setFitMode(PdfFitMode.FIT_PAGE) }}
        />
      }
      {state.pdfDocument.fitMode === PdfFitMode.FIT_PAGE &&
        <CommandbarButton
          icon={icons.fitPage}
          onClick={() => { actions.api.setFitMode(PdfFitMode.FIT_WIDTH) }}
        />
      }
      {state.pdfDocument.fitMode === PdfFitMode.FIT_WIDTH &&
        <CommandbarButton
          icon={icons.fitWidth}
          onClick={() => { actions.api.setFitMode(PdfFitMode.ACTUAL_SIZE) }}
        />
      }
      <Dropdown
        items={layoutModeItems}
        value={state.pdfDocument.pageLayoutMode}
        text={currentLayoutModeItem ? translationManager.getText(`pageLayoutMode.${PdfPageLayoutMode[currentLayoutModeItem]}`) : ''}
        onChange={(value: PdfPageLayoutMode) => { actions.api.setPageLayoutMode(value) }}
        width={160}
      />

      <CommandbarButton
        icon={icons.rotate}
        onClick={() => { actions.api.rotate() }}
      />

    </div>
  )
}
