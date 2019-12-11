import { h, Component } from 'hyperapp'
import { PdfWebViewerState, PdfWebViewerActions } from '../../PdfWebViewer'
import { Icon, icons } from '../../../common/Icon'
import { classNames } from '../../../common/classNames'
import { translationManager } from '../../../common/TranslationManager'

/** @internal */
export const PasswordForm: Component<{}, PdfWebViewerState, PdfWebViewerActions> = ({ }) => (state, actions) => {
  const formIsValid = !state.passwordForm.passwordRequiredError && !state.passwordForm.invalidPasswordError && state.passwordForm.password !== ''
  return (
    <div class="pwv-modal" >
      <div class="pwv-modal-dialog">
        <div class="pwv-modal-header">
          <Icon icon={icons.unlock} />
          <h2>{translationManager.getText('passwordForm.title')}</h2>
        </div>
        <div class="pwv-modal-body">
          <form onsubmit={(e: Event) => {
            e.preventDefault()
            const data = new FormData(e.currentTarget as HTMLFormElement)
            const password = data.get('password') as string
            if (password) {
              if (state.passwordDialogTempFile) {
                if (typeof state.passwordDialogTempFile === 'object') {
                  actions.api.openFile({
                    file: state.passwordDialogTempFile,
                    password,
                  })
                } else {
                    actions.api.openUri({
                      pdfUri: state.passwordDialogTempFile,
                      password,
                  })
                }
              } else {
                actions.loadDocumentRejected('error')
              }
            }
          }}>

            <div class="pwv-modal-message">
              <p>{translationManager.getText('passwordForm.description')}</p>
            </div>
            <div class="pwv-form-row">
              <div class="pwv-form-field pwv-form-has-error-x">
                <input
                  type="password"
                  class="pwv-input"
                  name="password"
                  onkeyup={(e: KeyboardEvent) => {
                    const inputValue = (e.currentTarget as HTMLInputElement).value
                    actions.passwordForm.updatePassword(inputValue)
                    actions.passwordForm.validateForm()
                  }}
                  oncreate={(element: HTMLInputElement) => { element.focus() }}
                />
                {state.passwordForm.invalidPasswordError &&
                  <div class="pwv-form-error">
                    <Icon icon={icons.warning} />
                    <span>
                      {translationManager.getText('passwordForm.invalidPasswordError')}
                    </span>
                  </div>
                }
                {state.passwordForm.passwordRequiredError &&
                  <div class="pwv-form-error">
                    <Icon icon={icons.warning} />
                    <span>
                      {translationManager.getText('passwordForm.passwordRequiredError')}
                    </span>
                  </div>
                }
              </div>
            </div>
            <div class="pwv-btn-row">
              <button
                class={classNames('pwv-btn', {'pwv-disabled': !formIsValid})}
                type="submit"
                disabled={!formIsValid}
              >
                {translationManager.getText('passwordForm.btnOk')}
              </button>
              <button
                class="pwv-btn"
                type="button"
                onclick={actions.loadDocumentCancel}
              >
                {translationManager.getText('passwordForm.btnCancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
