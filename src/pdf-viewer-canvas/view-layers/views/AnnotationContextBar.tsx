import { h, app, Component, ActionsType } from 'hyperapp'
import { CommandbarButton } from '../../../common/CommandbarButton'
import { Contextbar } from '../../../common/Contextbar'
import { ContextbarRow } from '../../../common/ContextbarRow'
import { ContextbarGroup } from '../../../common/ContextbarGroup'
import { icons } from '../../../common/icons'
import { translationManager } from '../../../common/TranslationManager'
import { PdfItemType, Annotation } from '../../../pdf-viewer-api'
import { getAnnotationBehaviors } from '../../AnnotationBehaviors'
import { annotationHasPopup } from '../../state/annotations'
import { ContextBarItem } from '../../state/viewer'
import { TooltipPosition } from '../../../common/Tooltip'

/** @internal */
export interface AnnotationContextBarProps {
  onDeleteAnnotation(id: number): void
  onRotateAnnotation(id: number): void
  onCopy(id: number): void
  onCreatePopup(id: number): void
  onOpenPopup(id: number): void
  onDeletePopup(id: number): void
}

/** @internal */
export interface ContextBarState {
  annotationId: number
  annotationType: PdfItemType
  deletable: boolean
  canHavePopup: boolean
  canDeletePopup: boolean
  canRotate: boolean
  canCopy: boolean
  isLocked: boolean
  hasPopup: boolean
  showConfirmDelete: boolean
  commands: ContextBarItem[]
}

/** @internal */
export interface ContextBarActions {
  setAnnotation(payload: { annotation: Annotation, commands: ContextBarItem[] }): ContextBarState
  startDelete(): ContextBarState
  cancelDelete(): ContextBarState
  delete(): ContextBarState
  copyText(): ContextBarState
  rotate(): ContextBarState
  addPopup(): ContextBarState
  editPopup(): ContextBarState
  deletePopup(): ContextBarState
}

/** @internal */
export const createAnnotationContextBar = (props: AnnotationContextBarProps, element: HTMLElement) => {

  const state: ContextBarState = {
    annotationId: 0,
    annotationType: PdfItemType.TEXT,
    hasPopup: false,
    canRotate: false,
    deletable: false,
    canCopy: false,
    isLocked: false,
    canHavePopup: false,
    canDeletePopup: true,
    showConfirmDelete: false,
    commands: [],
  }

  const actions: ActionsType<ContextBarState, ContextBarActions> = {
    setAnnotation: (payload: { annotation: Annotation, commands: ContextBarItem[] }) => $state => {
      const behaviors = getAnnotationBehaviors(payload.annotation.itemType)
      return {
        ...$state,
        showConfirmDelete: false,
        commands: payload.commands,
        annotationId: payload.annotation.id,
        annotationType: payload.annotation.itemType,
        hasPopup: annotationHasPopup(payload.annotation),
        canRotate: behaviors.rotatable,
        deletable: behaviors.deletable,
        canCopy: behaviors.text,
        isLocked: payload.annotation.isLocked(),
        canHavePopup: behaviors.canHavePopup,
        canDeletePopup: annotationHasPopup(payload.annotation) && payload.annotation.itemType !== PdfItemType.TEXT,
      }
    },
    startDelete: () => $state => {
      return {
        ...$state,
        showConfirmDelete: true,
      }
    },
    cancelDelete: () => $state => {
      return {
        ...$state,
        showConfirmDelete: false,
      }
    },
    delete: () => $state => {
      props.onDeleteAnnotation($state.annotationId)
      return {
        ...$state,
      }
    },
    rotate: () => $state => {
      props.onRotateAnnotation($state.annotationId)
      return {
        ...$state,
      }
    },
    copyText: () => $state => {
      props.onCopy($state.annotationId)
      return {
        ...$state,
      }
    },
    addPopup: () => $state => {
      props.onCreatePopup($state.annotationId)
      return {
        ...$state,
        hasPopup: true,
      }
    },
    editPopup: () => $state => {
      props.onOpenPopup($state.annotationId)
      return {
        ...$state,
      }
    },
    deletePopup: () => $state => {
      props.onDeletePopup($state.annotationId)
      return {
        ...$state,
        hasPopup: false,
      }
    },
  }

  const App = () => (
    <ContextBar />
  )

  const ContextBar: Component<{}, ContextBarState, ContextBarActions> = ({ }) => ($state, $actions) => {
    return (
      <Contextbar>
        <ContextbarRow>
          {$state.showConfirmDelete ?
            <ContextbarGroup>
              <CommandbarButton
                onClick={$actions.delete}
              >
                {translationManager.getText('contextbar.btnDelete')}
              </CommandbarButton>
              <CommandbarButton
                onClick={$actions.cancelDelete}
              >
                {translationManager.getText('contextbar.btnCancel')}
              </CommandbarButton>
            </ContextbarGroup> :
            <ContextbarGroup>
              {$state.commands.map(cmd => (
                <CommandbarButton
                  icon={cmd.icon}
                  onClick={() => {
                    cmd.onCmd($state.annotationId)
                  }}
                  disabled={$state.isLocked}
                  tooltipPos={TooltipPosition.top}
                  tooltip={$state.isLocked ? translationManager.getText('lockedAnnotation') : ''}
                />
              ))
              }
              {$state.canCopy &&
                <CommandbarButton
                  icon={icons.copy}
                  onClick={$actions.copyText}
                />
              }
              {$state.canRotate &&
                <CommandbarButton
                  icon={icons.rotate}
                  onClick={$actions.rotate}
                  disabled={$state.isLocked}
                  tooltipPos={TooltipPosition.top}
                  tooltip={$state.isLocked ? translationManager.getText('lockedAnnotation') : ''}
                />
              }
              {$state.canHavePopup && !$state.hasPopup &&
                <CommandbarButton
                  icon={icons.stickyNoteAdd}
                  onClick={$actions.addPopup}
                  tooltipPos={TooltipPosition.top}
                  tooltip={$state.isLocked ? translationManager.getText('lockedAnnotation') : ''}
                />
              }
              {$state.canHavePopup && $state.hasPopup &&
                <CommandbarButton
                  icon={icons.stickyNoteEdit}
                  onClick={$actions.editPopup}
                />
              }
              {$state.canDeletePopup && $state.hasPopup &&
                <CommandbarButton
                  icon={icons.stickyNoteRemove}
                  onClick={$actions.deletePopup}
                  disabled={$state.isLocked}
                  tooltipPos={TooltipPosition.top}
                  tooltip={$state.isLocked ? translationManager.getText('lockedAnnotation') : ''}
                  />
                }
              {$state.deletable &&
                <CommandbarButton
                  icon={icons.delete}
                  onClick={$actions.startDelete}
                  disabled={$state.isLocked}
                  tooltipPos={TooltipPosition.top}
                  tooltip={$state.isLocked ? translationManager.getText('lockedAnnotation') : ''}
                />
              }
            </ContextbarGroup>
          }
        </ContextbarRow>
      </Contextbar>
    )
  }

  return app(state, actions, App, element)

}
