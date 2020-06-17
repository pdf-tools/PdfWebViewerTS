import { ActionsType } from 'hyperapp'
import {
  OutlineItem,
  Annotation,
  PdfItemsOnPage,
  DeletedItem,
} from '../../pdf-viewer-api'

type NavigationType = 'pages' | 'outline' | 'annotations'

/** @internal */
export interface PageNavigationItem {
  thumbnail: string | null
  pageNumber: number
}

/** @internal */
export interface OutlineNavigationItem extends OutlineItem {
  open: boolean
  hasDescendants: boolean
  descendants: OutlineNavigationItem[]
}

export interface AnnotationItemState {
  [annotationId: number]: Annotation
}

export interface AnnotationsState {
  [page: number]: AnnotationItemState
}

export interface AnnotationSelection {
  page: number
  annotationId: number
}

/** @internal */
export interface NavigationPanelState {
  showNavigation: boolean
  selectedNavigation: NavigationType
  outlineItemsLoaded: boolean
  annotationsLoaded: boolean
  pages: PageNavigationItem[]
  outlines: OutlineNavigationItem[]
  annotations: AnnotationsState
  selectedAnnotation?: AnnotationSelection
}

/** @internal */
export const state: NavigationPanelState = {
  showNavigation: false,
  selectedNavigation: 'pages',
  outlineItemsLoaded: false,
  annotationsLoaded: false,
  pages: [],
  outlines: [],
  annotations: {},
}

/** @internal */
export interface NavigationPanelActions {
  clear(): NavigationPanelState
  setThumbnailPlaceholders(pageCount: number): NavigationPanelState
  updateThumbnail(pageThumbnail: PageNavigationItem): NavigationPanelState
  setOutlines(outline: OutlineNavigationItem[]): NavigationPanelState
  selectNavigation(navigation: NavigationType): NavigationPanelState
  toggleNavigationPanel(): NavigationPanelState
  toggleOutlineItem(path: string[]): NavigationPanelState
  clearAnnotations(): NavigationPanelState
  setAnnotationLoaded(): NavigationPanelState
  setPageAnnotations(itemsOnPage: PdfItemsOnPage): NavigationPanelState
  updateAnnotation(annotation: Annotation): NavigationPanelState
  deleteAnnotation(deletedItem: DeletedItem): NavigationPanelState
  selectAnnotation(annotation: Annotation): NavigationPanelState
  deselectAnnotation(): NavigationPanelState
}

/** @internal */
export const actions: ActionsType<
  NavigationPanelState,
  NavigationPanelActions
> = {
  clear: () => $state => ({
    ...$state,
    outlineItemsLoaded: false,
    pages: [],
    outlines: [],
  }),
  setThumbnailPlaceholders: (pageCount: number) => $state => {
    const pages: PageNavigationItem[] = []
    for (let i = 0; i < pageCount; i++) {
      pages.push({
        thumbnail: null,
        pageNumber: i + 1,
      })
    }
    return {
      ...$state,
      pages,
    }
  },
  updateThumbnail: (newThumbnail: PageNavigationItem) => $state => ({
    ...$state,
    pages: $state.pages.map(p =>
      p.pageNumber === newThumbnail.pageNumber ? newThumbnail : p,
    ),
  }),
  setOutlines: (outlines: OutlineNavigationItem[]) => $state => ({
    ...$state,
    outlineItemsLoaded: true,
    outlines,
  }),
  toggleNavigationPanel: () => $state => ({
    ...$state,
    showNavigation: !$state.showNavigation,
  }),
  selectNavigation: (navigation: NavigationType) => $state => ({
    ...$state,
    selectedNavigation: navigation,
  }),
  toggleOutlineItem: (path: string[]) => $state => {
    const newState = { ...$state }
    let currentItem = { descendants: newState.outlines, open: false }
    path.forEach(id => {
      const nextItem = currentItem.descendants.find(
        item => item.id.toString() === id,
      )
      if (nextItem) {
        currentItem = nextItem
      }
    })
    currentItem.open = !currentItem.open
    return newState
  },
  clearAnnotations: () => $state => ({
    ...$state,
    annotations: {},
    selectedAnnotation: undefined,
    annotationsLoaded: false,
  }),
  setAnnotationLoaded: () => $state => ({
    ...$state,
    annotationsLoaded: true,
  }),
  setPageAnnotations: (itemsOnPage: PdfItemsOnPage) => $state => {
    const itemState: AnnotationItemState = {}

    itemsOnPage.items.forEach(an => {
      const annotation = an as Annotation
      itemState[annotation.id] = annotation
    })

    return {
      ...$state,
      annotations: { ...$state.annotations, [itemsOnPage.page]: itemState },
    }
  },
  updateAnnotation: (annotation: Annotation) => $state => {
    const page = annotation.pdfRect.page
    const id = annotation.id
    const itemsOnPage = $state.annotations[page]
      ? { ...$state.annotations[page] }
      : {}
    itemsOnPage[id] = annotation

    return {
      ...$state,
      annotations: { ...$state.annotations, [page]: itemsOnPage },
    }
  },
  deleteAnnotation: (deletedItem: DeletedItem) => $state => {
    const page = deletedItem.page
    const id = deletedItem.id
    const itemsOnPage = $state.annotations[page]

    if (!itemsOnPage) {
      return { ...$state }
    }
    delete itemsOnPage[id]

    return {
      ...$state,
      annotations: { ...$state.annotations, [page]: itemsOnPage },
    }
  },
  selectAnnotation: (annotation: Annotation) => $state => ({
    ...$state,
    selectedAnnotation: {
      page: annotation.pdfRect.page,
      annotationId: annotation.id,
    },
  }),
  deselectAnnotation: () => $state => ({
    ...$state,
    selectedAnnotation: undefined,
  }),
}
