import { h, Component } from 'hyperapp'
import { PdfWebViewerState, PdfWebViewerActions } from '../../PdfWebViewer'
import { Annotation } from '../../../pdf-viewer-api/types'
import { PdfItemType } from '../../../pdf-viewer-api/enums'
import { Icon, icons } from '../../../common/Icon'
import { classNames } from '../../../common/classNames'
import { formatDate } from '../../../common/formatDate'

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

    case PdfItemType.TEXT:
    case PdfItemType.POPUP:
      return <Icon icon={icons.stickyNote} fill={fill ? fill : undefined} />

    case PdfItemType.INK:
      return <Icon icon={icons.pencil} fill={fill ? fill : undefined} />

    default:
      return <Icon icon={icons.freeText} fill={fill ? fill : undefined} />
  }
}

let dblClickTimer: number | undefined

/** @internal */
export const AnnotationListItem: Component<
  { annotation: Annotation; selected: boolean },
  PdfWebViewerState,
  PdfWebViewerActions
> = ({ annotation, selected }) => (state, actions) => (
  <li
    class={classNames('pwv-annotation-navigation-item', {
      'pwv-selected': selected,
    })}
    onclick={() => {
      if (dblClickTimer) {
        window.clearTimeout(dblClickTimer)
      } else {
        dblClickTimer = window.setTimeout(() => {
          console.log('goToAnnotation -> select')
          console.log(annotation)
          actions.api.goToAnnotation(annotation, 'select')
        }, 250)
      }
    }}
    ondblclick={() => {
      console.log('goToAnnotation -> edit')
      console.log(annotation)
      actions.api.goToAnnotation(annotation, 'edit')
    }}
  >
    <div>
      <AnnotationIcon itemType={annotation.itemType} fill={annotation.color} />
      {annotation.originalAuthor && (
        <span class="pwv-author">{annotation.originalAuthor}</span>
      )}
      <time>{formatDate(annotation.lastModified)}</time>
      <span>{annotation.itemType}</span>
    </div>
    <div>
      <h5>{annotation.subject}</h5>
      <p>{annotation.content}</p>
    </div>
    {!!annotation.isLocked() && (
      <Icon icon={icons.lock} className="pwv-locked-icon" />
    )}
  </li>
)
