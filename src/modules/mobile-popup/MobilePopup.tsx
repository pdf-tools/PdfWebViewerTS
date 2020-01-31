import { h, Component, app, ActionsType } from 'hyperapp'
import { icons } from '../../common/Icon'
import { ColorPicker } from '../../common/ColorPicker'
import { CommandbarButton } from '../../common/CommandbarButton'
import { Color } from '../../common/Color'
import { translationManager } from '../../common/TranslationManager'
import { Annotation } from 'pdf-viewer-api';

/** @internal */
export interface MobilePopupViewProps {
  fallbackColors: string[]
  onClose: (id: number, content: string, subject: string) => void
  onDelete: (id: number) => void
  onUpdateContent: (id: number, content: string) => void
  onUpdateColor: (id: number, color: string) => void
  canEdit: (author: string) => boolean
  toggleLock: () => void
}

/** @internal */
interface MobilePopupViewState {
  id: number | null
  content: string | null
  subject: string | null
  color: string | null
  colorPalette: string[] | null
  lastModified: string | null
  originalAuthor: string | null
  isLocked: boolean
  timer?: number
}

/** @internal */
export interface MobilePopupViewActions {
  getState(): MobilePopupViewState
  openPopup(popup: MobilePopupViewState): MobilePopupViewProps
  setColor(color: string): MobilePopupViewProps
  closePopup(): MobilePopupViewProps
  setLock(isLocked: boolean): MobilePopupViewProps
}

/** @internal */
export const createMobilePopupView = (props: MobilePopupViewProps, element: HTMLElement) => {
  const state: MobilePopupViewState = {
    id: 0,
    content: null,
    subject: null,
    color: null,
    lastModified: null,
    originalAuthor: null,
    colorPalette: props.fallbackColors,
    isLocked: false,
    timer: 0,
  }

  const actions: ActionsType<MobilePopupViewState, MobilePopupViewActions> = {
    getState: () => $state => $state,
    openPopup: (popup: MobilePopupViewState) => $state => {
      return {
        ...$state,
        id: popup.id,
        content: popup.content,
        subject: popup.subject,
        color: popup.color,
        lastModified: popup.lastModified,
        originalAuthor: popup.originalAuthor,
        isLocked: popup.isLocked,
        timer: 0,
      }
    },
    setColor: (color: string) => $state => {
      return {
        ...$state,
        color,
      }
    },
    closePopup: () => $state => ({
      ...$state,
      id: 0,
    }),
    setLock: (isLocked: boolean) => $state => {
      return {
        ...$state,
        isLocked,
      }
    },
  }

  const App = () => (
    <MobilePopupView />
  )

  const MobilePopupView: Component<{}, MobilePopupViewState, MobilePopupViewActions> = ({ }) => ($state, $actions) => {
    let colorString

    if ($state.color) {
      const color = new Color($state.color)
      if (color.isDark()) {
        colorString = 'rgba(255, 255, 255, 0.9)'
      } else {
        colorString = 'rgba(0, 0, 0, 0.9)'
      }
    }

    const headerStyles: any = {
      color : colorString,
    }
    return (
      <div
        class="pwv-popup"
        style={{backgroundColor: $state.color}}
        oncreate={(element: HTMLElement) => {
          element.addEventListener('onclick', (e: Event) => { e.preventDefault(); e.cancelBubble = true }, false)
          element.addEventListener('mousedown', (e: Event) => { e.cancelBubble = true; e.stopPropagation()}, false)
          element.addEventListener('mousemove', (e: Event) => { e.cancelBubble = true}, false)
          element.addEventListener('mouseup', (e: Event) => { e.cancelBubble = true}, false)
          element.addEventListener('touchstart', (e: Event) => { e.cancelBubble = true; e.stopPropagation()}, false)
          element.addEventListener('touchmove', (e: Event) => { e.cancelBubble = true}, false)
          element.addEventListener('touchend', (e: Event) => { e.cancelBubble = true}, false)
        }}
      >
        <div>
          <div class="pwv-popup-header">
            <div class="pwv-popup-header-info"
            style = {headerStyles}>
              <div class="pwv-popup-header-author">
                {$state.originalAuthor}
              </div>
              <div class="pwv-popup-header-modified">
                {$state.lastModified}
              </div>
            </div>
            <div class="pwv-popup-toolbar">
              <CommandbarButton
                icon={icons.delete}
                onClick={() => {
                  if ($state.id) {
                    props.onDelete($state.id)
                  }
                }}
                disabled={$state.isLocked}
              />
              <CommandbarButton
                  onClick={() => {
                    props.toggleLock()
                  }}
                  disabled={!props.canEdit($state.originalAuthor ? $state.originalAuthor : 'no author set')}
                  icon={$state.isLocked ? icons.lock : icons.unlock}
              />
              <ColorPicker
                colors={$state.colorPalette !== null ? $state.colorPalette : props.fallbackColors}
                icon={icons.fillColor}
                color={$state.color || 'transparent'}
                onChange={color => {
                  if ($state.id) {
                    $state.content = (document.getElementById('pwv-popup-content-' + $state.id) as HTMLTextAreaElement).value
                    $state.color = color
                    props.onUpdateColor($state.id, color)
                  }
                }}
                disabled={$state.isLocked}
              />
              <div style={{ marginLeft: 'auto' }}>
                <CommandbarButton
                  onClick={() => {
                    if ($state.id) {
                      if ($state.timer) {
                        window.clearTimeout($state.timer)
                      }
                      const content = (document.getElementById('pwv-popup-content-' + $state.id) as HTMLTextAreaElement).value
                      const subject = (document.getElementById('pwv-popup-subject-' + $state.id) as HTMLTextAreaElement).value
                      props.onClose($state.id, content, subject)
                    }
                  }}
                  icon={icons.close}
                />
              </div>
            </div>
          </div>
          <div class="pwv-popup-subject">
            <input
              id={'pwv-popup-subject-' + $state.id}
              placeholder={translationManager.getText('annotation.subject')}
              onchange={() => {
                $state.subject = (document.getElementById('pwv-popup-subject-' + $state.id) as HTMLInputElement).value
              }}
              disabled={!props.canEdit($state.originalAuthor ? $state.originalAuthor : '') || $state.isLocked}
              value={$state.subject} />
          </div>
          <div class="pwv-popup-content">
            <textarea
              id={'pwv-popup-content-' + $state.id}
              onchange={(e: UIEvent) => {
                if ($state.id) {
                  const id = $state.id
                  const content = (e.currentTarget as HTMLTextAreaElement).value
                  $state.timer = window.setTimeout(() => {
                    props.onUpdateContent(id, content)
                  }, 20)
                }
              }}
              value={$state.content}
              disabled={!props.canEdit($state.originalAuthor ? $state.originalAuthor : '') || $state.isLocked}
            >
              {}
            </textarea>
          </div>
        </div>
      </div>
    )
  }

  return app(state, actions, App, element)
}
