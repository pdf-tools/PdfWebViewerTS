import { h, Component } from 'hyperapp'
import { PdfWebViewerState, PdfWebViewerActions } from '../../PdfWebViewer'
import { Icon, icons } from '../../../common/Icon'
import { translationManager } from '../../../common/TranslationManager'

/** @internal */
export const UnsavedChanges: Component<{}, PdfWebViewerState, PdfWebViewerActions> = ({ }) => ($state, $actions) => (
  <div class="pwv-modal" >
    <div class="pwv-modal-dialog">
      <div class="pwv-modal-header">
        <Icon icon={icons.warning} />
        <h2>{translationManager.getText('unsavedChanges.title')}</h2>
      </div>
      <div class="pwv-modal-body">
        <div class="pwv-modal-message">
          <p>{translationManager.getText('unsavedChanges.description')}</p>
        </div>
        <div class="pwv-btn-row">
          <button
            class="pwv-btn"
            onclick={() => {
              $actions.api.downloadFile()
                .then(() => {
                  $actions.unsavedChangesDialogFileSaved()
                  if ($state.unsavedChangesDialogTempFile) {
                    $actions.api.openFile({
                      file: $state.unsavedChangesDialogTempFile,
                    })
                  }
                })
            }}
          >
            {translationManager.getText('unsavedChanges.btnSave')}
          </button>
          <button
            class="pwv-btn"
            onclick={() => {
              $actions.unsavedChangesDialogDontSave()
              if ($state.unsavedChangesDialogTempFile) {
                $actions.api.openFile({
                file: $state.unsavedChangesDialogTempFile})
              }
            }}
          >
            {translationManager.getText('unsavedChanges.btnDontSave')}
          </button>
          <button
            class="pwv-btn"
            onclick={$actions.unsavedChangesDialogCancel}
          >
            {translationManager.getText('unsavedChanges.btnCancel')}
          </button>
        </div>
      </div>
    </div>
  </div>
)
