import { ActionsType } from 'hyperapp'
import { PdfWebViewerOptions, pdfWebViewerDefaultOptions } from '../PdfWebViewerOptions'
import * as Layout from './layout'
import * as PasswordForm from './passwordForm'
import * as NavigationPanel from './navigationPanel'
import * as PdfDocument from './pdfDocument'
import * as Search from './search'
import * as Mobile from './mobile'

/** @internal */
export interface RootState {
  appInitialized: boolean
  hasDocument?: boolean
  fileDropEnabled: boolean
  showPasswordForm: boolean
  passwordDialogTempFile: File | string | null,
  showOpenFileErrorDialog: boolean,
  showUnsavedChangesDialog: boolean,
  unsavedChangesDialogDontSave: boolean,
  unsavedChangesDialogTempFile: File | string | null,
  showLoadingIndicator: boolean
  hasError: boolean
  errorMessage: string
  language: string
  layout: Layout.LayoutState
  passwordForm: PasswordForm.PasswordFormState
  navigationPanel: NavigationPanel.NavigationPanelState
  pdfDocument: PdfDocument.PdfDocumentState
  search: Search.SearchState
  mobile: Mobile.MobileState
  options: PdfWebViewerOptions
}

const defaultState: RootState = {
  appInitialized: false,
  fileDropEnabled: false,
  hasDocument: false,
  showPasswordForm: false,
  passwordDialogTempFile: null,
  showOpenFileErrorDialog: false,
  showUnsavedChangesDialog: false,
  unsavedChangesDialogTempFile: null,
  unsavedChangesDialogDontSave: false,
  showLoadingIndicator: false,
  hasError: false,
  errorMessage: '',
  language: 'en',
  layout: Layout.state,
  passwordForm: PasswordForm.state,
  navigationPanel: NavigationPanel.state,
  pdfDocument: PdfDocument.state,
  search: Search.state,
  mobile: Mobile.state,
  options: pdfWebViewerDefaultOptions,
}

/** @internal */
export const createState = (options: PdfWebViewerOptions) => ({
  ...defaultState,
  options,
})

/** @internal */
export interface ActionDefinitions {
  layout: Layout.LayoutActions
  passwordForm: PasswordForm.PasswordFormActions,
  navigationPanel: NavigationPanel.NavigationPanelActions
  pdfDocument: PdfDocument.PdfDocumentActions
  search: Search.SearchActions
  mobile: Mobile.MobileActions
  initializeAppBegin(): RootState
  initializeAppFulfilled(): RootState
  initializeAppRejected(error: string): RootState
  loadDocumentBegin(): RootState
  loadDocumentFulfilled(): RootState
  loadDocumentCancel(): RootState
  loadDocumentPasswordForm(file: File | string): RootState
  closeDocument(): RootState
  showConfirmUnsavedChangesDialog(file: File | string | null): RootState
  unsavedChangesDialogCancel(): RootState
  unsavedChangesDialogFileSaved(): RootState
  unsavedChangesDialogDontSave(): RootState
  loadDocumentRejected(error: string): RootState
  loadDocumentConfirmRejected(): RootState
  saveDocumentBegin(): RootState
  saveDocumentFulfilled(): RootState
  saveDocumentRejected(error: string): RootState
  setError(error: string): RootState
  getState(): RootState
  open(file: File): RootState
}

/** @internal */
export const actions: ActionsType<RootState, ActionDefinitions> = {
  layout: Layout.actions,
  passwordForm: PasswordForm.actions,
  navigationPanel: NavigationPanel.actions,
  pdfDocument: PdfDocument.actions,
  search: Search.actions,
  mobile: Mobile.actions,
  initializeAppBegin: () => $state => ({
    ...$state,
  }),
  initializeAppFulfilled: () => $state => ({
    ...$state,
    appInitialized: true,
    fileDropEnabled: true,
  }),
  initializeAppRejected: (error: string) => $state => ({
    ...$state,
    hasError: true,
    errorMessage: error,
    appInitialized: true,
  }),
  loadDocumentBegin: () => $state => {
    return {
      ...$state,
      fileDropEnabled: false,
      showLoadingIndicator: true,
      unsavedChangesDialogDontSave: false,
    }
  },
  loadDocumentFulfilled: () => $state => ({
    ...$state,
    hasDocument: true,
    fileDropEnabled: true,
    showPasswordForm: false,
    passwordDialogTempFile: null,
    showLoadingIndicator: false,
  }),
  loadDocumentCancel: () => $state => ({
    ...$state,
    fileDropEnabled: true,
    showPasswordForm: false,
    passwordDialogTempFile: null,
    showLoadingIndicator: false,
  }),
  loadDocumentRejected: (error: string) => $state => ({
    ...$state,
    fileDropEnabled: false,
    passwordDialogTempFile: null,
    showPasswordForm: false,
    showLoadingIndicator: false,
    showOpenFileErrorDialog: true,
  }),
  loadDocumentConfirmRejected: () => $state => ({
    ...$state,
    fileDropEnabled: true,
    showOpenFileErrorDialog: false,
  }),
  loadDocumentPasswordForm: (file: File | string) => $state => {
    $state.passwordForm.invalidPasswordError = $state.passwordDialogTempFile !== null
    return {
      ...$state,
      passwordDialogTempFile: file,
      showPasswordForm: true,
      showLoadingIndicator: false,
    }
  },
  closeDocument: () => $state => ({
    ...$state,
    hasDocument: false,
  }),
  showConfirmUnsavedChangesDialog: (file: File | string) => $state => {
    return {
      ...$state,
      unsavedChangesDialogTempFile: file,
      showUnsavedChangesDialog: true,
    }
  },
  unsavedChangesDialogCancel: () => $state => ({
    ...$state,
    unsavedChangesDialogTempFile: null,
    showUnsavedChangesDialog: false,
    hasDocument: true,
  }),
  unsavedChangesDialogFileSaved: () => $state => ({
    ...$state,
    unsavedChangesDialogTempFile: null,
    showUnsavedChangesDialog: false,
  }),
  unsavedChangesDialogDontSave: () => $state => ({
    ...$state,
    unsavedChangesDialogDontSave: false,
    unsavedChangesDialogTempFile: null,
    showUnsavedChangesDialog: false,
    hasDocument: false,
  }),
  saveDocumentBegin: (error: string) => $state => ({
    ...$state,
    showLoadingIndicator: true,
  }),
  saveDocumentFulfilled: (error: string) => $state => ({
    ...$state,
    showLoadingIndicator: false,
  }),
  saveDocumentRejected: (error: string) => $state => ({
    ...$state,
    hasError: true,
    errorMessage: error,
    appInitialized: true,
    showLoadingIndicator: false,
  }),
  setError: (error: string) => $state => ({
    ...$state,
    hasError: true,
    errorMessage: error,
  }),
  getState: () => $state => {
    return {
      ...$state,
    }
  },
  open: (file: File) => $state => ({
    ...$state,
  }),
}
