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
  const bg = fill ? fill : undefined
  switch (itemType) {
    case PdfItemType.HIGHLIGHT:
    case PdfItemType.SQUIGGLY:
    case PdfItemType.UNDERLINE:
    case PdfItemType.STRIKE_OUT:
      return <Icon icon={icons.highlighter} bg={bg} />

    case PdfItemType.STAMP:
      return <Icon icon={icons.stamp} bg={bg} />

    case PdfItemType.FREE_TEXT:
      return <Icon icon={icons.freeText} bg={bg} />

    case PdfItemType.POPUP:
    case PdfItemType.TEXT:
      return <Icon icon={icons.stickyNote} bg={bg} />

    case PdfItemType.INK:
      return <Icon icon={icons.pencil} bg={bg} />

    default:
      return <Icon icon={icons.annotation} bg={bg} />
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
          actions.api.goToAnnotation({ annotation, action: 'select' })
        }, 250)
      }
    }}
    ondblclick={() => {
      actions.api.goToAnnotation({ annotation, action: 'edit' })
    }}
  >
    <div>
      <AnnotationIcon itemType={annotation.itemType} fill={annotation.color} />
      {annotation.originalAuthor && (
        <span class="pwv-author">{annotation.originalAuthor}</span>
      )}
      <time>{formatDate(annotation.lastModified)}</time>
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
