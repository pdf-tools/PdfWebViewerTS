import { h, Component } from 'hyperapp'
import { PdfWebViewerState, PdfWebViewerActions } from '../../PdfWebViewer'
import { OpenFile } from './OpenFile'
import { OpenFileError } from './OpenFileError'
import { UnsavedChanges } from './UnsavedChanges'
import { PasswordForm } from './PasswordForm'
import { LoadApplication } from './LoadApplication'
import { ApplicationError } from './ApplicationError'
import { LoadFile } from './LoadFile'
import { SaveFile } from './SaveFile'


/** @internal */
export const Modal: Component<{}, PdfWebViewerState, PdfWebViewerActions> = ({ }) => (state, actions) => {

  if (state.hasError) {
    return <ApplicationError />
  } else if (state.showOpenFileErrorDialog) {
    return <OpenFileError />
  } else if (state.showPasswordForm) {
    return <PasswordForm />
  } else if (state.showUnsavedChangesDialog) {
    return <UnsavedChanges />
  } else if (!state.appInitialized) {
    return <LoadApplication />
  } else if (state.showLoadingIndicator) {
    return <LoadFile />
  } else if (state.showSaveIndicator) {
    return <SaveFile />
  } else if (!state.hasDocument) {
    return <OpenFile />
  } else {
    return <div></div>
  }
}
