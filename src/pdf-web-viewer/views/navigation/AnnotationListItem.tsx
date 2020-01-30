import { h, Component } from 'hyperapp'
import { PdfWebViewerState, PdfWebViewerActions } from '../../PdfWebViewer'
import { translationManager } from '../../../common/TranslationManager'
import { Annotation } from '../../../pdf-viewer-api/types'
import { PdfItemType } from '../../../pdf-viewer-api/enums'
import { Icon, icons } from '../../../common/Icon'
import { classNames } from '../../../common/classNames'
import { formatDate } from '../../../common/Tools'

const AnnotationIcon: Component<{ itemType: number; fill: string | null }, PdfWebViewerState, PdfWebViewerActions> = ({ itemType, fill }) => (
  state,
  actions,
) => {
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

const HistoryItem: Component<{ item: any }, PdfWebViewerState, PdfWebViewerActions> = ({ item }) => (state, actions) => {
  switch (item.Type) {
    case '/Create':
      console.log('create', item)
      return (
        <li>
          <div>
            <Icon icon={icons.addLayer} />
            {/*
            <Icon icon={icons.created} />
            */}
            {item.T && <span class="pwv-author">{item.T}</span>}
            <time>{formatDate(item.D)}</time>
          </div>
        </li>
      )
    case '/Edit':
      const params: { [key: string]: string } = {}
      if (item.Parms) {
        for (let i = 0; i < item.Parms.length; i += 2) {
          const key = item.Parms[i] as string
          const value = item.Parms[i + 1] as string
          params[key] = value
        }
      }
      return (
        <li>
          <div>
            <Icon icon={icons.pen} />
            {item.T && <span class="pwv-author">{item.T}</span>}
            <time>{formatDate(item.D)}</time>
          </div>
          <div class="pwv-ms-custom-history-content">
            {params['/Subj'] && <h5>{params['/Subj']}</h5>}
            {params['/Contents'] && <p>{params['/Contents']}</p>}
          </div>
        </li>
      )
    case '/Lock':
      return (
        <li>
          <div>
            <Icon icon={icons.lock} />
            {item.T && <span class="pwv-author">{item.T}</span>}
            <time>{formatDate(item.D)}</time>
          </div>
        </li>
      )
    case '/Unlock':
      return (
        <li>
          <div>
            <Icon icon={icons.unlock} />
            {item.T && <span class="pwv-author">{item.T}</span>}
            <time>{formatDate(item.D)}</time>
          </div>
        </li>
      )
    case '/Delete':
      return (
        <li>
          <div>
            <Icon icon={icons.delete} />
            {item.T && <span class="pwv-author">{item.T}</span>}
            <time>{formatDate(item.D)}</time>
          </div>
        </li>
      )

    default:
      return <li>...</li>
  }
}

let dblClickTimer: number | undefined

/** @internal */
export const AnnotationListItem: Component<{ annotation: Annotation; selected: boolean }, PdfWebViewerState, PdfWebViewerActions> = ({
  annotation,
  selected,
}) => (state, actions) => {
  return (
    <li
      class={classNames('pwv-annotation-navigation-item', {
        'pwv-selected': selected,
        'pwv-deleted': annotation.isHidden(),
      })}
      onclick={() => {
        if (dblClickTimer) {
          window.clearTimeout(dblClickTimer)
          dblClickTimer = undefined
        } else {
          dblClickTimer = window.setTimeout(() => {
            // if (!annotation.isHidden()) {
            // }
            actions.api.goToAnnotation({ annotation, action: 'select' })
            dblClickTimer = undefined
          }, 250)
        }
      }}
      ondblclick={() => {
        actions.api.goToAnnotation({ annotation, action: 'edit' })
        dblClickTimer = undefined
      }}
    >
      <div>
        <AnnotationIcon itemType={annotation.itemType} fill={annotation.color} />
        {annotation.originalAuthor && <span class="pwv-author">{annotation.originalAuthor}</span>}
        <time>{formatDate(annotation.lastModified)}</time>
      </div>
      <div>
        <h5>{annotation.subject}</h5>
        <p>{annotation.content}</p>
        {!!annotation.isLocked() && <Icon icon={icons.lock} className="pwv-locked-icon" />}
      </div>
      {selected && annotation.custom && annotation.custom.length > 0 && (
        <div class="pwv-ms-custom-history-list">
          <h5>{translationManager.getText('sideNavigation.annotation.history')}</h5>
          <ul>
            {annotation.custom.map(history => (
              <HistoryItem item={history} />
            ))}
          </ul>
        </div>
      )}
    </li>
  )
}
