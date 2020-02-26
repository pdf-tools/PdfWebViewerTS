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
      <div
        class="pwv-annotation-navigation"
        oncreate={(element: HTMLElement) => {
          createAnnotationNavigation(element)
        }}
      >
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

/* tslint:disable-next-line:max-line-length */
const createAnnotationNavigation = (element: HTMLElement) => {
  const findScrollContainer = (el: HTMLElement): HTMLElement | null => {
    if (el.classList.contains('pwv-scroll-container-sc')) {
      return el
    } else {
      const pEl = el.parentElement
      if (pEl) {
        return findScrollContainer(pEl)
      } else {
        return null
      }
    }
  }
  const scrollContainer = findScrollContainer(element) as HTMLElement

  const mutationObserver = new MutationObserver(function(mutations) {
    mutations.forEach(mutation => {
      if (mutation.type === 'attributes') {
        if (mutation.target.nodeType === 1) {
          const elm = mutation.target as HTMLElement
          if (elm.classList.contains('pwv-selected')) {
            elm.scrollIntoView({
              block: 'center',
              behavior: 'smooth',
            })
          }
        }
      } else if (
        mutation.type === 'childList' &&
        mutation.addedNodes.length > 0
      ) {
        // todo: scroll to new created annotation
        // console.log('scroll to new item')
        // const newElm = mutation.addedNodes[0] as HTMLElement
        // newElm.scrollIntoView({
        //   block: 'center',
        //   behavior: 'smooth',
        // })
      }
    })
  })

  mutationObserver.observe(scrollContainer, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
    attributeOldValue: true,
    characterDataOldValue: true,
  })
}
