import { h, Component } from 'hyperapp'
import { PdfWebViewerState, PdfWebViewerActions } from '../../PdfWebViewer'
import { Icon, icons } from '../../../common/Icon'
import { translationManager } from '../../../common/TranslationManager'

/** @internal */
export const OpenFile: Component<{}, PdfWebViewerState, PdfWebViewerActions> = ({ }) => (state, actions) => {

  const handleFileSelected = (e: any) => {
    if (e.currentTarget.files && e.currentTarget.files.length && e.currentTarget.files.length > 0) {
      const file = e.currentTarget.files[0] as File
      if (file.type === 'application/pdf') {
        actions.api.openFile({ file })
      }
    }
  }

  return (
    <div class="pwv-modal pwv-openfile" >
      <div class="pwv-modal-dialog">
        <div class="pwv-modal-header">
          <Icon icon={icons.pdfFile} />
          <h2>{translationManager.getText('openFile.title')}</h2>
        </div>
        <div class="pwv-modal-body">
          <div class="pwv-modal-message">
            {state.layout.deviceType === 'desktop' ?
              <h2>{translationManager.getText('openFile.dropFileHere')}</h2> :
              <h2>{translationManager.getText('openFile.openDocument')}</h2>
            }
          </div>
          <div class="pwv-btn-row">
            <label class="pwv-btn">
              {translationManager.getText('openFile.btnSelectFile')}
              <input type="file" onchange={handleFileSelected} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
