import { h, Component } from 'hyperapp'
import { PdfWebViewerState, PdfWebViewerActions } from '../../PdfWebViewer'
import { icons } from '../../../common/icons'
import { CommandbarButton } from '../../../common/CommandbarButton'
import { CommandbarFileButton } from '../../../common/CommandbarFileButton'
import { CommandbarSeparator } from '../../../common/CommandbarSeparator'
import { SearchBar } from './SearchBar'
import { PdfFitMode } from '../../../pdf-viewer-api'

/** @internal */
export const MobileToolbar: Component<{}, PdfWebViewerState, PdfWebViewerActions> = ({ }) => ($state, $actions) => (
  <div class="pwv-mobile-top">
    {$state.mobile.showToolbar &&
      <div class="pwv-mobile-toolbar">
        <div class="pwv-commandbar">
          {($state.options.allowOpenFile && !$state.options.onOpenFileButtonClicked) &&
            <CommandbarFileButton
              icon={icons.openFile}
              onFileSelected={file => $actions.api.openFile({ file })}
            />
          }
          {($state.options.allowOpenFile && $state.options.onOpenFileButtonClicked) &&
            <CommandbarButton
              icon={icons.openFile}
              onClick={$state.options.onOpenFileButtonClicked}
            />
          }
          {$state.options.allowSaveFile &&
            <CommandbarButton
            icon={icons.saveFile}
            onClick={$actions.api.downloadFile}
            />
          }
          <CommandbarSeparator />
          {$state.pdfDocument.fitMode === PdfFitMode.ACTUAL_SIZE &&
            <CommandbarButton
              icon={icons.fitActualSize}
              onClick={() => { $actions.api.setFitMode(PdfFitMode.FIT_PAGE) }}
            />
          }
          {$state.pdfDocument.fitMode === PdfFitMode.FIT_PAGE &&
            <CommandbarButton
              icon={icons.fitPage}
              onClick={() => { $actions.api.setFitMode(PdfFitMode.FIT_WIDTH) }}
            />
          }
          {$state.pdfDocument.fitMode === PdfFitMode.FIT_WIDTH &&
            <CommandbarButton
              icon={icons.fitWidth}
              onClick={() => { $actions.api.setFitMode(PdfFitMode.ACTUAL_SIZE) }}
            />
          }
          <CommandbarSeparator />
          <CommandbarButton
            icon={icons.edit}
            onClick={$actions.mobile.showAnnotationbar}
          />
        </div>
        <div class="pwv-commandbar">
          <CommandbarButton
            icon={icons.search}
            onClick={() => {
              if (!$state.search.showSearch) {
                $actions.api.resetViewerMode()
              }
              $actions.search.toggleSearch()
            }}
            active={$state.search.showSearch}
          />
        </div>
      </div>
    }
    {$state.mobile.showToolbar && $state.search.showSearch &&
      <SearchBar />
    }
    {!$state.mobile.showToolbar &&
      <div class="pwv-mobile-hide-annotationbar">
        <CommandbarSeparator />
        <CommandbarButton
          icon={icons.close}
          onClick={() => {
            $actions.api.resetViewerMode()
            $actions.mobile.hideAnnotationbar()
          }}
        />
      </div>
    }
  </div>
)
