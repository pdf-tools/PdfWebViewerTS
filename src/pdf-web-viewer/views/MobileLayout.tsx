import { h, Component } from 'hyperapp'
import { PdfWebViewerState, PdfWebViewerActions } from '../PdfWebViewer'
import { classNames } from '../../common/classNames'
import { LoadingIndicator } from './loader/LoadingIndicator'
import { Modal } from './modal/Modal'
import { MobileToolbar } from './toolbar/MobileToolbar'

/** @internal */
export const MobileLayout: Component<{}, PdfWebViewerState, PdfWebViewerActions> = ({ }) => ($state, $actions) => (
  <div
    class={classNames(
      'pt-pwv', 'pwv-devicetype-mobile',
      $state.layout.breakPoint,
    )}
  >
    <MobileToolbar />
    <div class={classNames('pwv-content')} >
      <div class="pwv-document-view">
        <div
          oncreate={(element: HTMLElement) => {
            const a = $actions as any
            a.createCanvasView(element)
          }}
        >
        </div>
      </div>
      <div class="pwv-mobile-pagecount">
        {$state.pdfDocument.firstVisiblePage} / {$state.pdfDocument.pageCount}
      </div>
    </div>
    <Modal />
  </div>
)
