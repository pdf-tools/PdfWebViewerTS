import { h, Component } from 'hyperapp'
import { PdfWebViewerState, PdfWebViewerActions } from '../../PdfWebViewer'
import { DocumentBar } from './DocumentBar'
import { NavigationBar } from './NavigationBar'
import { ZoomBar } from './ZoomBar'
import { SearchBar } from './SearchBar'
import { ViewBar } from './ViewBar'
import { CommandbarButton } from '../../../common/CommandbarButton'
import { CommandbarSeparator } from '../../../common/CommandbarSeparator'
import { icons } from '../../../common/icons'

/** @internal */
export const Toolbar: Component<{}, PdfWebViewerState, PdfWebViewerActions> = ({ }) => (state, actions) => (
  <div class="pwv-top">
    <div class="pwv-toolbar pwv-toolbar-main">
      <DocumentBar />
      <NavigationBar />
      <CommandbarSeparator />
      <ZoomBar />
      <CommandbarSeparator />
      <ViewBar />
      <div class="pwv-commandbar" style={{marginLeft: 'auto'}}>
        {state.options.enableSearch &&
          <CommandbarButton
            icon={icons.search}
            onClick={() => {
              if (!state.search.showSearch) {
                actions.api.resetViewerMode()
              }
              actions.search.toggleSearch()
            }}
            active={state.search.showSearch}
          />
        }
        {(state.options.enableOutlineNavigation || state.options.enableThumbnailNavigation) &&
          <CommandbarSeparator />
        }
        {(state.options.enableOutlineNavigation || state.options.enableThumbnailNavigation) &&
          <CommandbarButton
            icon={icons.docNavigation}
            onClick={() => {
              actions.api.loadNavigationItems()
              actions.navigationPanel.toggleNavigationPanel()
            }}
            active={state.navigationPanel.showNavigation}
          />
        }
      </div>
    </div>
    {state.search.showSearch && state.options.enableSearch &&
      <SearchBar />
    }
  </div>
)
