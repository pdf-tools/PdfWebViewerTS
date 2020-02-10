import { h, Component } from 'hyperapp'
import { classNames } from '../../../common/classNames'
import { CommandbarButton } from '../../../common/CommandbarButton'
import { translationManager } from '../../../common/TranslationManager'
import { PdfWebViewerState, PdfWebViewerActions } from '../../PdfWebViewer'
import { ThumbnailNavigation } from './ThumbnailNavigation'
import { OutlineNavigation } from './OutlineNavigation'
import { AnnotationNavigation } from './AnnotationNavigation'
import { icons } from '../../../common/Icon'

/** @internal */
export const NavigationPanel: Component<
  {},
  PdfWebViewerState,
  PdfWebViewerActions
> = ({}) => (state, actions) => (
  <div class="pwv-navigation-panel">
    <div>
      <ul class="pwv-tab-nav">
        {state.options.enableThumbnailNavigation && (
          <li
            class={classNames({
              'pwv-active':
                state.navigationPanel.selectedNavigation === 'pages',
            })}
          >
            <button
              onclick={() => actions.navigationPanel.selectNavigation('pages')}
            >
              {translationManager.getText('sideNavigation.page')}
            </button>
          </li>
        )}
        {state.options.enableOutlineNavigation && (
          <li
            class={classNames({
              'pwv-active':
                state.navigationPanel.selectedNavigation === 'outline',
              'pwv-disabled': state.navigationPanel.outlines.length < 1,
            })}
          >
            <button
              disabled={state.navigationPanel.outlines.length < 1}
              onclick={() =>
                actions.navigationPanel.selectNavigation('outline')
              }
            >
              {translationManager.getText('sideNavigation.outline')}
            </button>
          </li>
        )}
        {state.options.enableAnnotationNavigation && (
          <li
            class={classNames({
              'pwv-active':
                state.navigationPanel.selectedNavigation === 'annotations',
            })}
          >
            <button
              onclick={() =>
                actions.navigationPanel.selectNavigation('annotations')
              }
            >
              {translationManager.getText('sideNavigation.annotation')}
            </button>
          </li>
        )}
      </ul>

      <CommandbarButton
        className="pwv-navigation-panel-btn-close"
        icon={icons.close}
        onClick={actions.navigationPanel.toggleNavigationPanel}
      />

      {state.options.enableThumbnailNavigation && (
        <div
          class={classNames('pwv-tab-content', {
            'pwv-tab-content-selected':
              state.navigationPanel.selectedNavigation === 'pages',
          })}
        >
          <ThumbnailNavigation
            pages={state.navigationPanel.pages}
            isVisible={
              state.navigationPanel.showNavigation &&
              state.navigationPanel.selectedNavigation === 'pages'
            }
            selectedPage={state.pdfDocument.firstVisiblePage}
            firstVisiblePage={state.pdfDocument.firstVisiblePage}
            lastVisiblePage={state.pdfDocument.lastVisiblePage}
            onPageSelected={actions.api.setPageNumber}
            onLoadThumbnails={(fromPage, toPage) => {
              actions.api.addPageRangeToThumbnailsQueue({
                from: fromPage,
                to: toPage,
              })
            }}
          />
        </div>
      )}

      {state.options.enableOutlineNavigation && (
        <div
          class={classNames('pwv-tab-content', {
            'pwv-tab-content-selected':
              state.navigationPanel.selectedNavigation === 'outline',
          })}
        >
          <OutlineNavigation />
        </div>
      )}

      {state.options.enableAnnotationNavigation && (
        <div
          class={classNames('pwv-tab-content', {
            'pwv-tab-content-selected':
              state.navigationPanel.selectedNavigation === 'annotations',
          })}
        >
          <AnnotationNavigation />
        </div>
      )}
    </div>
  </div>
)
