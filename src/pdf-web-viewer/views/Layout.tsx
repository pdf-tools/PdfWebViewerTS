import { h, Component } from 'hyperapp'
import { PdfWebViewerState, PdfWebViewerActions } from '../PdfWebViewer'
import { classNames } from '../../common/classNames'
import { Toolbar } from './toolbar/Toolbar'
import { NavigationPanel } from './navigation/NavigationPanel'
import { DropZone } from './DropZone'
import { Modal } from './modal/Modal'

/** @internal */
export const Layout: Component<{}, PdfWebViewerState, PdfWebViewerActions> = ({ }) => (state, actions) => (
  <div
    class={classNames(
      'pt-pwv', 'pwv-devicetype-desktop',
      state.layout.breakPoint,
    )}
    >
    <DropZone
      enabled={state.options.allowFileDrop && state.fileDropEnabled}
      onFileSelected={file => actions.api.openFile({file})}
    >
      <Toolbar />
      <div class={classNames('pwv-content', { 'pwv-show-navigation-panel': state.navigationPanel.showNavigation })}>
        <div class="pwv-document-view">
          <div
            oncreate={(element: HTMLElement) => {
              const a = actions as any
              a.createCanvasView(element)
            }}
          >
          </div>
        </div>
        <NavigationPanel />
      </div>
      <Modal />
    </DropZone>
  </div>
)
