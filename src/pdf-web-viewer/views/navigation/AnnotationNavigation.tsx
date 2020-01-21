import { h, Component } from 'hyperapp'
import { PdfWebViewerState, PdfWebViewerActions } from '../../PdfWebViewer'
import { ScrollContainer } from '../../../common/ScrollContainer'
import { AnnotationList } from './AnnotationList'
import { translationManager } from '../../../common/TranslationManager'

/** @internal */
export const AnnotationNavigation: Component<
  {},
  PdfWebViewerState,
  PdfWebViewerActions
> = ({}) => (state, actions) => {
  if (!state.navigationPanel) {
    return <div>loading</div>
  }

  const { annotations } = state.navigationPanel
  const pageNumbers = Object.keys(annotations).filter(
    pageNumber => Object.keys(annotations[pageNumber as any]).length > 0,
  )

  return (
    <ScrollContainer>
      <div class="pwv-annotation-navigation">
        {pageNumbers.map(pageNumber => (
          <div>
            <h4>
              {translationManager.getText('sideNavigation.annotation.page')}{' '}
              {pageNumber}
            </h4>
            <AnnotationList pageNumber={pageNumber as any} />
          </div>
        ))}
      </div>
    </ScrollContainer>
  )
}
