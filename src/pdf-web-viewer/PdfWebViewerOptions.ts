import {
  PdfViewerCanvasOptions,
  PdfViewerCanvasDefaultOptions,
} from '../pdf-viewer-canvas/PdfViewerCanvasOptions'
import { PdfPageLayoutMode } from '../pdf-viewer-api'

export interface PdfWebViewerOptions extends PdfViewerCanvasOptions {
  allowFileDrop: boolean
  allowSaveFile: boolean
  allowOpenFile: boolean
  enableThumbnailNavigation: boolean
  enableOutlineNavigation: boolean
  enableAnnotationNavigation: boolean
  enableSearch: boolean
  pageLayoutModes: PdfPageLayoutMode[]
  onOpenFileButtonClicked?(): void
  onSaveFileButtonClicked?(): void
}

export const pdfWebViewerDefaultOptions: PdfWebViewerOptions = {
  allowFileDrop: true,
  allowSaveFile: true,
  allowOpenFile: true,
  enableThumbnailNavigation: true,
  enableOutlineNavigation: true,
  enableAnnotationNavigation: true,
  enableSearch: true,
  pageLayoutModes: [
    PdfPageLayoutMode.ONE_COLUMN,
    PdfPageLayoutMode.SINGLE_PAGE,
    PdfPageLayoutMode.TWO_COLUMN_LEFT,
    PdfPageLayoutMode.TWO_COLUMN_RIGHT,
    PdfPageLayoutMode.TWO_PAGE_LEFT,
    PdfPageLayoutMode.TWO_PAGE_RIGHT,
  ],
  ...PdfViewerCanvasDefaultOptions,
}
