import { h, Component } from 'hyperapp'
import { PdfWebViewerState, PdfWebViewerActions } from '../../PdfWebViewer'
import { Icon, icons } from '../../../common/Icon'
import { translationManager } from '../../../common/TranslationManager'

/** @internal */
export const LoadApplication: Component<{}, PdfWebViewerState, PdfWebViewerActions> = ({ }) => (state, actions) => (
  <div class="pwv-modal" >
    <div class="pwv-modal-dialog">
      <div class="pwv-modal-header">
        <Icon icon={icons.pdfFile} />
      </div>
      <div class="pwv-modal-body">
        <div class="pwv-modal-message">
          <h2>{translationManager.getText('applicationLoader.title')}</h2>
        </div>
        <div class="pwv-apploading-indicator">
          <div>
            <div class="rect-1"></div>
            <div class="rect-2"></div>
            <div class="rect-3"></div>
            <div class="rect-4"></div>
            <div class="rect-5"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
)
