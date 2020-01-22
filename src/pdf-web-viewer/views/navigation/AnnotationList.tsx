import { h, Component } from 'hyperapp'
import { PdfWebViewerState, PdfWebViewerActions } from '../../PdfWebViewer'
import { AnnotationListItem } from './AnnotationListItem'

/** @internal */
export const AnnotationList: Component<
  { pageNumber: number },
  PdfWebViewerState,
  PdfWebViewerActions
> = ({ pageNumber }) => (state, actions) => {
  const annotationsObj = state.navigationPanel.annotations[pageNumber]
  const selectedAnnotation = state.navigationPanel.selectedAnnotation
  const annotations = Object.keys(annotationsObj).map(
    k => annotationsObj[k as any],
  )

  const sortedAnnotations = annotations.sort(
    (f, s) => f.pdfRect.pdfY - s.pdfRect.pdfY,
  )

  return (
    <ul>
      {sortedAnnotations.map(annotation => (
        <AnnotationListItem
          annotation={annotation}
          selected={
            selectedAnnotation !== undefined &&
            selectedAnnotation.page === annotation.pdfRect.page &&
            selectedAnnotation.annotationId === annotation.id
          }
        />
      ))}
    </ul>
  )
}
