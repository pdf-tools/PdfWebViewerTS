import { h, Component } from 'hyperapp'
import { PdfWebViewerState, PdfWebViewerActions } from '../../PdfWebViewer'
import { Annotation } from '../../../pdf-viewer-api/types'
import { PdfItemType } from '../../../pdf-viewer-api/enums'
import { Icon, icons } from '../../../common/Icon'
import { classNames } from '../../../common/classNames'

const AnnotationIcon: Component<
  { itemType: number; fill: string | null },
  PdfWebViewerState,
  PdfWebViewerActions
> = ({ itemType, fill }) => (state, actions) => {
  switch (itemType) {
    case PdfItemType.HIGHLIGHT:
    case PdfItemType.SQUIGGLY:
    case PdfItemType.UNDERLINE:
    case PdfItemType.STRIKE_OUT:
      return <Icon icon={icons.highlighter} fill={fill ? fill : undefined} />

    case PdfItemType.STAMP:
      return <Icon icon={icons.stamp} fill={fill ? fill : undefined} />

    case PdfItemType.FREE_TEXT:
      return <Icon icon={icons.freeText} fill={fill ? fill : undefined} />

    default:
      return <Icon icon={icons.freeText} fill={fill ? fill : undefined} />
  }
}

/** @internal */
export const AnnotationItem: Component<
  { annotation: Annotation; selected: boolean },
  PdfWebViewerState,
  PdfWebViewerActions
> = ({ annotation, selected }) => (state, actions) => (
  <li
    class={classNames('pwv-annotation-navigation-item', {
      'pwv-selected': selected,
    })}
  >
    <div>
      <AnnotationIcon itemType={annotation.itemType} fill={annotation.color} />
      <span class="pwv-author">{annotation.originalAuthor}</span>
      <time>{annotation.lastModified}</time>
    </div>
    <div>
      <h5>{annotation.subject}</h5>
      <p>{annotation.content}</p>
    </div>
    <Icon icon={icons.lock} className="pwv-locked-icon" />
  </li>
)
