import { h, Component, app, ActionsType } from 'hyperapp'
import { icons } from '../../common/Icon'
import { ColorPicker } from '../../common/ColorPicker'
import { classNames } from '../../common/classNames'
import { CommandbarButton } from '../../common/CommandbarButton'
import { DragMoveHandler, DragMoveEvent, DragMoveEndEvent } from '../../common/DragMoveHandler'
import { PdfRect, Rect } from '../../pdf-viewer-api'
import { TooltipPosition } from '../../common/Tooltip'
import { translationManager } from '../../common/TranslationManager'
import { Color } from '../../common/Color'

/** @internal */
export interface PopupViewProps {
  maxPopupWidth: number
  maxPopupHeight: number
  currentUser: string
  onSelect: (id: number) => void
  onDeselect: (syncronize: boolean) => void
  onClose: () => void
  onDelete: (id: number) => void
  onUpdatePosition: (id: number, top: number, left: number) => void
  onUpdateSize: (id: number, width: number, height: number) => void
  onUpdateColor: (id: number, color: string) => void
  onLock: (id: number) => void
  canEdit: (author: string) => boolean
}

/** @internal */
export interface Popup {
  id: number
  colorPalette: string[]
  content: string
  subject: string | null
  color: string | null
  isLocked: boolean
  selected: boolean
  positionCalculated: boolean
  lastModified: string
  originalAuthor: string
  pdfRect: PdfRect
  cssWidth: number
  cssHeight: number
}

interface PopupViewState {
  selectedPopup: number | null
  openPopups: Popup[]
  maxPopupWidth: number
  maxPopupHeight: number
  currentUser: string
  activeContent: string | null
  activeSubject: string | null
}

export interface PopupViewActions {
  getState(): PopupViewState
  updateOpenPopups(openPopups: Popup[]): PopupViewState
  setPositionCalculated(id: number): PopupViewState
  selectPopup(id: number): PopupViewState
  deselectPopup(): PopupViewState
}

export const createPopupView = (props: PopupViewProps, element: HTMLElement) => {

  const state: PopupViewState = {
    selectedPopup: null,
    openPopups: [],
    maxPopupWidth: props.maxPopupWidth,
    maxPopupHeight: props.maxPopupHeight,
    currentUser: props.currentUser,
    activeContent: null,
    activeSubject: null,
  }

  const actions: ActionsType<PopupViewState, PopupViewActions> = {
    getState: () => $state => $state,
    updateOpenPopups: (openPopups: Popup[]) => $state => {
      openPopups.forEach(popup => {
        const oldPopup = $state.openPopups.find(op => op.id === popup.id)
        if (oldPopup) {
          popup.selected = oldPopup.selected
          popup.positionCalculated = oldPopup.positionCalculated
        }
      })
      return {
        ...$state,
        openPopups,
      }
    },
    setPositionCalculated: (id: number) => $state => {
      const popup = $state.openPopups.find(p => p.id === id)
      if (popup) {
        popup.positionCalculated = true
      }
      return {
        ...$state,
      }
    },
    selectPopup: (id: number) => $state => {
      const openPopups = $state.openPopups.map(p => ({...p, selected: p.id === id }))
      return {
        ...$state,
        openPopups,
        activeContent: null,
        activeSubject: null,
        selectedPopup: id,
      }
    },
    deselectPopup: () => $state => {
      return {
        ...$state,
        selectedPopup: null,
        activeContent: null,
        activeSubject: null,
      }
    },
  }

  const App = () => (
    <OpenPopups />
  )

  const OpenPopups: Component<{}, PopupViewState, PopupViewActions> = ({ }) => ($state, $actions) => {
    return (
      <div>
        {$state.openPopups.map(popup => (
          <Popup
            popup={{ ...popup, selected: popup.id === $state.selectedPopup }}
            colorPalette={popup.colorPalette}
            close={props.onClose}
            remove={props.onDelete}
            select={props.onSelect}
            toggleLock={props.onLock}
            canEdit={props.canEdit}
            updatePosition={payload => {
              props.onUpdatePosition(payload.id, payload.x, payload.y)
            }}
            updateSize={payload => {
              props.onUpdateSize(payload.id, payload.w, payload.h)
            }}
            updateColor={payload => {
              props.onUpdateColor(payload.id, payload.color)
            }}
          />
        ))}
      </div>
    )
  }

  return app(state, actions, App, element)
}

interface UpdatePopupPositionPayload {
  id: number
  x: number
  y: number
}

interface UpdatePopupSizePayload {
  id: number
  w: number
  h: number
}
interface UpdatePopupColorPayload {
  id: number
  color: string
}

interface PopupProps {
  popup: Popup
  colorPalette: string[]
  updateColor(payload: UpdatePopupColorPayload): void
  updatePosition(payload: UpdatePopupPositionPayload): void
  updateSize(payload: UpdatePopupSizePayload): void
  close(): void
  select(id: number): void
  remove(id: number): void
  toggleLock(id: number): void
  canEdit(author: string): boolean
}

/* tslint:disable-next-line:max-line-length */
const Popup: Component<PopupProps, PopupViewState, PopupViewActions> = ({ popup, colorPalette, updateColor, close, select, remove, toggleLock, updatePosition, updateSize, canEdit}) => ($state, $actions) => {
  const styles: any = {
    backgroundColor: popup.color,
    width: popup.cssWidth + 'px',
    height: popup.cssHeight + 'px',
  }

  let colorString
  if (popup.color != null) {
    const color = new Color(popup.color)
    if (color.isDark()) {
      colorString = 'rgba(255, 255, 255, 0.9)'
    } else {
      colorString = 'rgba(0, 0, 0, 0.9)'
    }
  }

  const headerStyles: any = {
    color : colorString,
  }
  if (!popup.positionCalculated) {
    styles.display = 'none'
  }
  return (
    <div
      class={classNames('pwv-popup', { 'pwv-popup-selected': popup.selected })}
      key={popup.id}
      style={styles}
      data-id={popup.id}
      >
      <div
        onclick={(e: MouseEvent) => {
          if (!(e as any).openDropdown) {
            window.dispatchEvent(new Event('click', e))
          }
          if (!popup.selected) {
            select(popup.id)
          }
        }}
      >
        <div class="pwv-popup-header">
          <div class="pwv-popup-header-info"
          style = { headerStyles}
          >
            <div class="pwv-popup-header-author">
              {popup.originalAuthor}
            </div>
            <div class="pwv-popup-header-modified">
              {popup.lastModified}
            </div>
          </div>
          <div class="pwv-popup-toolbar">
            <CommandbarButton
              icon={icons.delete}
              onClick={() => { remove(popup.id) }}
              disabled={!canEdit(popup.originalAuthor) || popup.isLocked}
              tooltipPos={TooltipPosition.top}
              tooltip={popup.isLocked ? translationManager.getText('lockedAnnotation') : ''}
            />
            <CommandbarButton
                onClick={() => { toggleLock(popup.id) }}
                disabled={!canEdit(popup.originalAuthor)}
                icon={popup.isLocked ? icons.lock : icons.unlock}
            />
            <ColorPicker
              colors={colorPalette}
              icon={icons.fillColor}
              color={popup.color || 'transparent'}
              onChange={color => {
                updateColor({
                  id: popup.id,
                  color,
                })
              }}
              disabled={!canEdit(popup.originalAuthor) || popup.isLocked}
              tooltipPos={TooltipPosition.top}
              tooltip={popup.isLocked ? translationManager.getText('lockedAnnotation') : ''}
            />

            <div style={{ marginLeft: 'auto' }}>
              <CommandbarButton
                onClick={(e: Event) => {
                  e.stopPropagation()
                  $state.activeContent = (document.getElementById('pwv-popup-content-' + popup.id) as HTMLTextAreaElement).value
                  $state.activeSubject = (document.getElementById('pwv-popup-subject-' + popup.id) as HTMLTextAreaElement).value
                  $state.selectedPopup = popup.id
                  close()
                }}
                icon={icons.close}
              />
            </div>
          </div>
        </div>
        <div class="pwv-popup-subject">
          <input
            id={'pwv-popup-subject-' + popup.id}
            placeholder={translationManager.getText('annotation.subject')}
            onchange={() => {
              $state.activeSubject = (document.getElementById('pwv-popup-subject-' + popup.id) as HTMLInputElement).value
            }}
            disabled={!canEdit(popup.originalAuthor) || popup.isLocked}
            value={popup.subject} />
        </div>
        <div class="pwv-popup-content">
          { (canEdit(popup.originalAuthor) && !popup.isLocked) ?
            <textarea
              id={'pwv-popup-content-' + popup.id}
              onchange={() => {
                $state.activeContent = (document.getElementById('pwv-popup-content-' + popup.id) as HTMLTextAreaElement).value
              }}
            >
              {popup.content}
            </textarea>
            :
            <div
              id={'pwv-popup-content-' + popup.id}>
              {popup.content}
            </div>
          }
        </div>
      </div>
      <div>
        <div
          class="pwv-popup-draghandle"
        >
        </div>
        <div
          class="pwv-popup-resizer"
          /* tslint:disable-next-line:max-line-length */
          oncreate={(element: HTMLElement) => { PopupComponent.create(popup.id, element, $state.maxPopupWidth, $state.maxPopupHeight, updatePosition, updateSize, select) }}
          onremove={(element: HTMLElement, done: () => void) => { PopupComponent.remove(element); done() }}
        >
        </div>
      </div>
    </div>
  )
}

type UpdatePositionCallback = (payload: UpdatePopupPositionPayload) => void
type UpdateSizeCallback = (payload: UpdatePopupSizePayload) => void
type SelectCallback = (id: number) => void

class PopupComponent {
  public static create(id: number, resizeHandle: HTMLElement, maxPopupWidth: number, maxPopupHeight: number,
                       updatePosition: UpdatePositionCallback, updateSize: UpdateSizeCallback, select: SelectCallback) {
    /* tslint:disable-next-line:max-line-length */
    (resizeHandle.parentElement as any).popup = new PopupComponent(id, resizeHandle, maxPopupWidth, maxPopupHeight, updatePosition, updateSize, select)
  }

  public static remove(resizeHandle: any) {
    (resizeHandle.parentElement as any).popup.unmount()
      (resizeHandle.parentElement as any).popup = null
  }

  private id: number
  private element: HTMLElement
  private dragHandle: HTMLElement
  private resizeHandle: HTMLElement
  private updatePosition: UpdatePositionCallback
  private updateSize: UpdateSizeCallback
  private select: SelectCallback
  private cancelContentEvents = true
  private dragOffsetX: number = 0
  private dragOffsetY: number = 0
  private containerOffsetX: number = 0
  private containerOffsetY: number = 0
  private minPopupWidth: number
  private minPopupHeight: number
  private maxPopupWidth: number
  private maxPopupHeight: number

  constructor(id: number, resizeHandle: HTMLElement, maxPopupWidth: number, maxPopupHeight: number,
              updatePosition: UpdatePositionCallback, updateSize: UpdateSizeCallback, select: SelectCallback) {
    this.id = id
    this.resizeHandle = resizeHandle
    const parent = resizeHandle.parentElement as HTMLElement
    this.dragHandle = parent.children.item(0) as HTMLElement
    this.element = parent.parentElement as HTMLElement

    this.minPopupWidth = 180
    this.minPopupHeight = 120
    this.maxPopupWidth = maxPopupWidth > this.minPopupWidth ? maxPopupWidth : this.minPopupWidth
    this.maxPopupHeight = maxPopupHeight > this.minPopupHeight ? maxPopupHeight : this.minPopupHeight

    this.updatePosition = updatePosition
    this.updateSize = updateSize
    this.select = select

    this.cancelEvent = this.cancelEvent.bind(this)

    this.startMove = this.startMove.bind(this)
    this.moving = this.moving.bind(this)
    this.endMove = this.endMove.bind(this)
    this.onSelect = this.onSelect.bind(this)

    this.startResize = this.startResize.bind(this)
    this.resizing = this.resizing.bind(this)
    this.endResize = this.endResize.bind(this)

    this.handleMouseWheel = this.handleMouseWheel.bind(this)

    new DragMoveHandler(this.dragHandle, this.startMove, this.moving, this.endMove, this.onSelect)
    new DragMoveHandler(this.resizeHandle, this.startResize, this.resizing, this.endResize)

    this.element.addEventListener('mousewheel', this.handleMouseWheel, false)

    const contentElement = this.element.firstChild as HTMLElement

    contentElement.addEventListener('onclick', this.cancelEvent, false)
    contentElement.addEventListener('keydown', this.cancelEvent, false)
    contentElement.addEventListener('mousedown', this.cancelEvent, false)
    contentElement.addEventListener('mousemove', this.cancelEvent, false)
    contentElement.addEventListener('mouseup', this.cancelEvent, false)
    contentElement.addEventListener('touchstart', this.cancelEvent, false)
    contentElement.addEventListener('touchmove', this.cancelEvent, false)
    contentElement.addEventListener('touchend', this.cancelEvent, false)
  }

  public unmount() {
    this.element.removeEventListener('mousewheel', this.handleMouseWheel)
  }

  private cancelEvent(e: any) {
    if (this.cancelContentEvents) {
      if (!(e.type === 'mousemove' && e.buttons === 0)) {
        e.cancelBubble = true
        e.stopPropagation()
      }
    }
  }

  private onSelect() {
    this.select(this.id)
  }

  private startResize(e: DragMoveEvent) {
    this.cancelContentEvents = false
    this.element.classList.add('pwv-popup-resizing')
    this.onSelect()
  }

  private resizing(e: DragMoveEvent) {

    const rect = this.element.getBoundingClientRect()

    let width = e.clientX - rect.left
    let height = e.clientY - rect.top

    width = width < this.minPopupWidth ? this.minPopupWidth : width > this.maxPopupWidth ? this.maxPopupWidth : width
    height = height < this.minPopupHeight ? this.minPopupHeight : height > this.maxPopupHeight ? this.maxPopupHeight : height

    this.element.style.width = width + 'px'
    this.element.style.height = height + 'px'

    const popupRect = {
      x: parseInt(this.element.style.left as any, undefined),
      y: parseInt(this.element.style.top as any, undefined),
      w: width,
      h: height,
    }

    const evtDetail = {
      annotationId: this.id,
      popupRect,
      color: this.element.style.backgroundColor,
    }

    window.dispatchEvent(new CustomEvent('pdfwebviewer.PopupMoved', { detail: evtDetail } ))
  }

  private endResize(e: DragMoveEndEvent) {
    if (e.moved) {
      this.updateSize({
        id: this.id,
        w: this.element.clientWidth,
        h: this.element.clientHeight,
      })
    }
    this.cancelContentEvents = true
    this.element.classList.remove('pwv-popup-resizing')
  }

  private startMove(e: DragMoveEvent) {
    const elementRect = this.element.getBoundingClientRect()
    const offsetParent = this.element.offsetParent as HTMLElement
    const offsetParentRect = offsetParent.getBoundingClientRect()

    this.dragOffsetX = e.clientX - elementRect.left
    this.dragOffsetY = e.clientY - elementRect.top
    this.containerOffsetX = offsetParentRect.left
    this.containerOffsetY = offsetParentRect.top

    this.cancelContentEvents = false
    this.element.classList.add('pwv-popup-moving')
    this.onSelect()
  }

  private moving(e: DragMoveEvent) {
    const popupRect = {
      x: e.clientX - this.containerOffsetX - this.dragOffsetX,
      y: e.clientY - this.containerOffsetY - this.dragOffsetY,
      w: parseInt(this.element.style.width as any, undefined),
      h: parseInt(this.element.style.height as any, undefined),
    }

    this.element.style.top = popupRect.y + 'px'
    this.element.style.left = popupRect.x + 'px'

    const evtDetail = {
      annotationId: this.id,
      popupRect,
      color: this.element.style.backgroundColor,
    }
    window.dispatchEvent(new CustomEvent('pdfwebviewer.PopupMoved', { detail: evtDetail } ))
  }

  private endMove(e: DragMoveEndEvent) {
    if (e.moved) {
      this.updatePosition({
        id: this.id,
        x: this.element.offsetLeft,
        y: this.element.offsetTop,
      })
    }
    this.cancelContentEvents = true
    this.element.classList.remove('pwv-popup-moving')
  }

  private handleMouseWheel(e: Event) {
    if (this.element.classList.contains('pwv-popup-selected')) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

}
