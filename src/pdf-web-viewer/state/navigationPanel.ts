import { ActionsType } from 'hyperapp'
import { OutlineItem } from '../../pdf-viewer-api'

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

/** @internal */
export interface NavigationPanelState {
  showNavigation: boolean
  selectedNavigation: NavigationType
  outlineItemsLoaded: boolean
  pages: PageNavigationItem[]
  outlines: OutlineNavigationItem[]
}

/** @internal */
export const state: NavigationPanelState = {
  showNavigation: false,
  selectedNavigation: 'pages',
  outlineItemsLoaded: false,
  pages: [],
  outlines: [],
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
}
