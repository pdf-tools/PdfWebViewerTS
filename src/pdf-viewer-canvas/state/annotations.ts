import { ActionsType } from './appState'
import { getAnnotationBehaviors } from '../AnnotationBehaviors'
import { Annotation, PdfItemsOnPage, PdfPoint, PdfItemType, DeletedItem, PdfItemCategory } from '../../pdf-viewer-api'

/** @internal */
export interface AnnotationsState {
  openPopupChanged: boolean
  annotationsChanged: boolean
  all: { [id: number]: Annotation }
  byPage: { [page: number]: number[] }
  popupsByPage: { [page: number]: number[] }
  openPopupsByPage: { [page: number]: number[] }
}

/** @internal */
export const state: AnnotationsState = {
  annotationsChanged: false,
  openPopupChanged: false,
  all: [],
  byPage: [],
  popupsByPage: [],
  openPopupsByPage: [],
}

/** @internal */
export interface AnnotationsActions {
  setPageAnnotations(annotationsOnPage: PdfItemsOnPage): AnnotationsState
  addAnnotation(annotation: Annotation): AnnotationsState
  updateAnnotation(annotation: Annotation): AnnotationsState
  deleteAnnotation(id: number): AnnotationsState
}

/** @internal */
export const annotationHasPopup = (annotation: Annotation) => {
  if (annotation.itemType === PdfItemType.TEXT) {
    return true
  }
  if (annotation.itemType === PdfItemType.FREE_TEXT) {
    return false
  }
  const behaviors = getAnnotationBehaviors(annotation.itemType)
  return behaviors.canHavePopup && (
    // tslint:disable-next-line: max-line-length
    annotation.popup.isOpen === true || (typeof annotation.content === 'string' && annotation.content !== '') || (typeof annotation.subject === 'string' && annotation.subject !== '')
  )
}

/** @internal */
export const actions: ActionsType<AnnotationsState, AnnotationsActions> = {
  setPageAnnotations: (annotationsOnPage: PdfItemsOnPage) => $state => {
    const newState = { ...$state }
    const pageNumber = annotationsOnPage.page
    newState.byPage[pageNumber] = []
    annotationsOnPage.items.forEach(item => {
      const annotation = item as Annotation
      newState.all[annotation.id] = annotation
      newState.byPage[pageNumber].push(annotation.id)

      if (annotationHasPopup(annotation)) {
        if (!newState.popupsByPage[pageNumber]) {
          newState.popupsByPage[pageNumber] = []
        }
        newState.popupsByPage[pageNumber].push(annotation.id)
        if (annotation.popup.isOpen) {
          if (!newState.openPopupsByPage[pageNumber]) {
            newState.openPopupsByPage[pageNumber] = []
          }
          newState.openPopupsByPage[pageNumber].push(annotation.id)
          newState.openPopupChanged = true
        }
      }
    })
    newState.annotationsChanged = true
    return newState
  },
  deleteAnnotation: (id: number) => $state => {
    const newState = { ...$state }

    const annotation = $state.all[id]
    const pageNumber = annotation.pdfRect.page
    delete newState.all[id]

    newState.byPage[pageNumber] = newState.byPage[pageNumber].filter(i => i !== id)

    if (newState.popupsByPage[pageNumber]) {
      newState.popupsByPage[pageNumber] = newState.popupsByPage[pageNumber].filter(i => i !== id)
    }

    if (newState.openPopupsByPage[pageNumber]) {
      newState.openPopupChanged = newState.openPopupsByPage[pageNumber].indexOf(id) > -1
      newState.openPopupsByPage[pageNumber] = newState.openPopupsByPage[pageNumber].filter(i => i !== id)
    }
    newState.annotationsChanged = true

    return newState
  },
  updateAnnotation: (annotation: Annotation) => $state => {
    const newState = { ...$state }
    const behaviors = getAnnotationBehaviors(annotation.itemType)
    const id = annotation.id
    const pageNumber = annotation.pdfRect.page

    if (behaviors.canHavePopup) {
      if (annotationHasPopup(annotation)) {
        if (!newState.popupsByPage[pageNumber]) {
          newState.popupsByPage[pageNumber] = []
        }
        const popupIndex = newState.popupsByPage[pageNumber].indexOf(id)
        if (popupIndex < 0) {
          newState.popupsByPage[pageNumber].push(annotation.id)
        }
      } else {
        if (newState.popupsByPage[pageNumber]) {
          newState.popupsByPage[pageNumber] = newState.popupsByPage[pageNumber].filter(i => i !== id)
        }
      }

      if (annotation.popup.isOpen) {
        if (!newState.openPopupsByPage[pageNumber]) {
          newState.openPopupsByPage[pageNumber] = []
        }
        if (newState.openPopupsByPage[pageNumber].indexOf(id) < 0) {
          newState.openPopupsByPage[pageNumber].push(id)
        }
        newState.openPopupChanged = true
      } else if (newState.openPopupsByPage[pageNumber]) {
        newState.openPopupsByPage[pageNumber] = newState.openPopupsByPage[pageNumber].filter(i => i !== id)
        newState.openPopupChanged = true
      }
    }

    newState.all[annotation.id] = annotation
    newState.annotationsChanged = true

    return newState
  },
  addAnnotation: (annotation: Annotation) => $state => {
    const newState = { ...$state }
    const pageNumber = annotation.pdfRect.page
    const id = annotation.id

    newState.all[id] = annotation

    if (!newState.byPage[pageNumber]) {
      newState.byPage[pageNumber] = []
    }
    newState.byPage[pageNumber].push(id)

    if (annotationHasPopup(annotation)) {
      if (!newState.popupsByPage[pageNumber]) {
        newState.popupsByPage[pageNumber] = []
      }
      newState.popupsByPage[pageNumber].push(id)

      if (annotation.popup.isOpen) {
        if (!newState.openPopupsByPage[pageNumber]) {
          newState.openPopupsByPage[pageNumber] = []
        }
        newState.openPopupsByPage[pageNumber].push(id)
        newState.openPopupChanged = true
      }
    }
    newState.annotationsChanged = true

    return newState
  },
}

/** @internal */
export const getAnnotationsOnPoint = ($state: AnnotationsState, pdfPoint: PdfPoint) => {
  let annotations: Annotation[] | null = null
  const ids = $state.byPage[pdfPoint.page]
  if (ids) {
    const px = pdfPoint.pdfX
    const py = pdfPoint.pdfY
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i]
      const rect = $state.all[id].pdfRect
      if (px > rect.pdfX && py > rect.pdfY && px < rect.pdfX + rect.pdfW && py < rect.pdfY + rect.pdfH) {
        if (!annotations) {
          annotations = []
        }
        annotations.push($state.all[id])
      }
    }
  }
  return annotations
}

/** @internal */
export const getAnnotationOnPoint = ($state: AnnotationsState, pdfPoint: PdfPoint, isSelectable: boolean = false) => {
  const ids = $state.byPage[pdfPoint.page]
  if (ids) {
    const px = pdfPoint.pdfX
    const py = pdfPoint.pdfY
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i]
      const rect = $state.all[id].pdfRect
      if (px > rect.pdfX && py > rect.pdfY && px < rect.pdfX + rect.pdfW && py < rect.pdfY + rect.pdfH) {
        const annotation = $state.all[id]
        if (isSelectable) {
          if (getAnnotationBehaviors(annotation.itemType).selectable) {
            return annotation
          }
        } else {
          return annotation
        }
      }
    }
  }
  return null
}

/** @internal */
export const getPopups = ($state: AnnotationsState, startPage: number, endPage: number) => {
  let popups: Annotation[] = []
  for (let page = startPage; page <= endPage; page++) {
    if ($state.popupsByPage[page]) {
      popups = popups.concat($state.popupsByPage[page].map(id => $state.all[id])).filter(annot => !annot.isHidden())
    }
  }
  return popups
}

/** @internal */
export const getOpenPopups = ($state: AnnotationsState, startPage: number, endPage: number) => {
  let openPopups: Annotation[] = []
  for (let page = startPage; page <= endPage; page++) {
    if ($state.openPopupsByPage[page]) {
      openPopups = openPopups.concat($state.openPopupsByPage[page].map(id => $state.all[id]))
    }
  }
  return openPopups
}
