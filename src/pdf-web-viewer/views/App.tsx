import { h, Component } from 'hyperapp'
import { PdfWebViewerState, PdfWebViewerActions } from '../PdfWebViewer'
import { Layout } from './Layout'
import { MobileLayout } from './MobileLayout'

/** @internal */
export const App: Component<{}, PdfWebViewerState, PdfWebViewerActions> = () => (state, actions) => (
  state.layout.deviceType === 'mobile' ? <MobileLayout /> : <Layout />
)
