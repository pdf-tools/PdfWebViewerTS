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
  passwordDialogTempPdfFile: File | string | null
  passwordDialogTempFdfFile?: File | string | null
  showOpenFileErrorDialog: boolean
  showUnsavedChangesDialog: boolean
  unsavedChangesDialogDontSave: boolean
  unsavedChangesDialogTempPdfFile: File | string | null
  pdfAuthorization?: string
  fdfAuthorization?: string
  unsavedChangesDialogTempFdfFile?: File | string | null
  showLoadingIndicator: boolean
  showSaveIndicator: boolean
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
  passwordDialogTempPdfFile: null,
  passwordDialogTempFdfFile: null,
  showOpenFileErrorDialog: false,
  showUnsavedChangesDialog: false,
  unsavedChangesDialogTempPdfFile: null,
  unsavedChangesDialogTempFdfFile: null,
  unsavedChangesDialogDontSave: false,
  showLoadingIndicator: false,
  showSaveIndicator: false,
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
  loadDocumentPasswordForm( x: {pdfFile: File | string, fdfFile?: File | string | null, pdfAuthorization?: string, fdfAuthorization?: string} ): RootState
  closeDocument(): RootState
  // tslint:disable-next-line: max-line-length
  showConfirmUnsavedChangesDialog( x: {pdfFile: File | string | null, fdfFile?: File | string, pdfAuthorization?: string, fdfAuthorization?: string} ): RootState
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
    passwordDialogTempPdfFile: null,
    showLoadingIndicator: false,
  }),
  loadDocumentCancel: () => $state => ({
    ...$state,
    fileDropEnabled: true,
    showPasswordForm: false,
    passwordDialogTempPdfFile: null,
    showLoadingIndicator: false,
  }),
  loadDocumentRejected: (error: string) => $state => ({
    ...$state,
    fileDropEnabled: false,
    passwordDialogTempPdfFile: null,
    showPasswordForm: false,
    showLoadingIndicator: false,
    showOpenFileErrorDialog: true,
  }),
  loadDocumentConfirmRejected: () => $state => ({
    ...$state,
    fileDropEnabled: true,
    showOpenFileErrorDialog: false,
  }),
  loadDocumentPasswordForm: (x: { pdfFile: File | string, fdfFile?: File | string, pdfAuthorization?: string, fdfAuthorization?: string }) => $state => {
    $state.passwordForm.invalidPasswordError = $state.passwordDialogTempPdfFile !== null
    return {
      ...$state,
      passwordDialogTempPdfFile: x.pdfFile,
      passwordDialogTempFdfFile: x.fdfFile,
      pdfAuthorization: x.pdfAuthorization,
      fdfAuthorization: x.fdfAuthorization,
      showPasswordForm: true,
      showLoadingIndicator: false,
    }
  },
  closeDocument: () => $state => ({
    ...$state,
    hasDocument: false,
  }),
  // tslint:disable-next-line: max-line-length
  showConfirmUnsavedChangesDialog: (x: { pdfFile: File | string, fdfFile?: File | string | null, pdfAuthorization?: string, fdfAuthorization?: string }) => $state => {
    return {
      ...$state,
      unsavedChangesDialogTempPdfFile: x.pdfFile,
      unsavedChangesDialogTempFdfFile: x.fdfFile,
      pdfAuthorization: x.pdfAuthorization,
      fdfAuthorization: x.fdfAuthorization,
      showUnsavedChangesDialog: true,
    }
  },
  unsavedChangesDialogCancel: () => $state => {
    return {
      ...$state,
      showUnsavedChangesDialog: false,
      showLoadingIndicator: false,
      hasDocument: true,
    }
  },
  unsavedChangesDialogFileSaved: () => $state => {
    return {
      ...$state,
      unsavedChangesDialogTempPdfFile: null,
      unsavedChangesDialogTempFdfFile: null,
      showUnsavedChangesDialog: false,
   }
  },
  unsavedChangesDialogDontSave: () => $state => {
    return {
      ...$state,
      unsavedChangesDialogDontSave: false,
      showUnsavedChangesDialog: false,
      hasDocument: false,
    }
  },
  saveDocumentBegin: (error: string) => $state => ({
    ...$state,
    showSaveIndicator: true,
  }),
  saveDocumentFulfilled: (error: string) => $state => ({
    ...$state,
    showSaveIndicator: false,
  }),
  saveDocumentRejected: (error: string) => $state => ({
    ...$state,
    hasError: true,
    errorMessage: error,
    appInitialized: true,
    showSaveIndicator: false,
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
