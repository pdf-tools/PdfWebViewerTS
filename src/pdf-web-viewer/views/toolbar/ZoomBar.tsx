import { h, Component } from 'hyperapp'
import { PdfWebViewerState, PdfWebViewerActions } from '../../PdfWebViewer'
import { CommandbarButton } from '../../../common/CommandbarButton'
import { Dropdown } from '../../../common/Dropdown'
import { icons } from '../../../common/icons'

/** @internal */
export const ZoomBar: Component<{}, PdfWebViewerState, PdfWebViewerActions> = ({}) => (state, actions) => (
  <div class="pwv-commandbar pwv-zoom-toolbar">
    <CommandbarButton
      icon={icons.zoomIn}
      disabled={state.pdfDocument.zoom >= state.pdfDocument.maxZoom}
      onClick={() => actions.api.zoomIn()}
      />
    <CommandbarButton
      icon={icons.zoomOut}
      disabled={state.pdfDocument.zoom <= state.pdfDocument.minZoom}
      onClick={() => actions.api.zoomOut()}
    />
    <Dropdown
      className="pwv-dropdown-zoom"
      items={state.pdfDocument.zoomLevels.map(zoom => ({
        value: zoom,
        text: Math.floor(zoom) + '%',
      }))}
      value={state.pdfDocument.zoom}
      text={Math.floor(state.pdfDocument.zoom) + '%'}
      align="right"
      onChange={zoom => actions.api.setZoom(zoom as number)}
    />
  </div>
)
