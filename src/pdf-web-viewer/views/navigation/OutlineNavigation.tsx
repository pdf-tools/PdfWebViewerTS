import { h, Component } from 'hyperapp'
import { PdfWebViewerState, PdfWebViewerActions } from '../../PdfWebViewer'
import { ScrollContainer } from '../../../common/ScrollContainer'
import { OutlineList } from './OutlineList'

/** @internal */
export const OutlineNavigation: Component<{}, PdfWebViewerState, PdfWebViewerActions> = ({}) => (state, actions) => (
  <ScrollContainer>
    <div class="pwv-outline-navigation">
      <OutlineList
        items={state.navigationPanel.outlines}
        path={[]}
        onToggleItem={actions.navigationPanel.toggleOutlineItem}
        onOutlineItemSelected={actions.api.goTo}
      />
    </div>
  </ScrollContainer>
)
