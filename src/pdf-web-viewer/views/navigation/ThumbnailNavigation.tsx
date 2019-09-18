import { h, Component } from 'hyperapp'
import { ScrollContainer } from '../../../common/ScrollContainer'
import { classNames } from '../../../common/classNames'

/** @internal */
export interface ThumbnailNavigationProps {
  pages: any[]
  isVisible: boolean
  selectedPage: number
  firstVisiblePage: number
  lastVisiblePage: number
  onPageSelected(pageNr: number): void
  onLoadThumbnails(fromPage: number, toPage: number): void
}

/** @internal */
/* tslint:disable-next-line:max-line-length */
export const ThumbnailNavigation: Component<ThumbnailNavigationProps> = ({ pages, isVisible, firstVisiblePage, lastVisiblePage, onPageSelected, onLoadThumbnails }, children) => (
  <ScrollContainer>
    <div
      class="pwv-page-navigation"
      data-firstvisiblepage={firstVisiblePage}
      data-lastvisiblepage={lastVisiblePage}
      data-isvisible={isVisible}
      oncreate={(element: HTMLElement) => {
        createThumbnailNavigation(element, isVisible, firstVisiblePage, lastVisiblePage, onLoadThumbnails)
      }}
    >
      <ul>
        {pages.map(page => (
          <li
            id={`page_${page.pageNumber}`}
            key={page.pageNumber}
            class={classNames(
              { 'pwv-selected': page.pageNumber === firstVisiblePage },
            )}
          >
            {page.thumbnail !== null ?
              <img
                src={page.thumbnail}
                onclick={() => { onPageSelected(page.pageNumber) }}
              /> :
              <div
                class="pwv-page-placeholder"
                onclick={() => { onPageSelected(page.pageNumber) }}
              />
            }
            <div class="pwv-page-nr">{page.pageNumber}</div>
          </li>
        ))}
      </ul>
    </div>
  </ScrollContainer>
)

/* tslint:disable-next-line:max-line-length */
const createThumbnailNavigation = (element: HTMLElement, isVisible: boolean, firstPage: number, lastPage: number, onLoadThumbnails: (fromPage: number, toPage: number) => void) => {
  let navigationIsVisible = isVisible
  let firstVisiblePage = firstPage
  let lastVisiblePage = lastPage
  let scrollEventThrottlingTimer: number | null = null

  const findScrollContainer = (el: HTMLElement): HTMLElement | null => {
    if (el.classList.contains('pwv-scroll-container-sc')) {
      return el
    } else {
      const pEl = el.parentElement
      if (pEl) {
        return findScrollContainer(pEl)
      } else {
        return null
      }
    }
  }
  const scrollContainer = findScrollContainer(element) as HTMLElement
  scrollContainer.addEventListener('scroll', () => {

    if (scrollEventThrottlingTimer) {
      window.clearTimeout(scrollEventThrottlingTimer)
    }
    scrollEventThrottlingTimer = window.setTimeout(() => {
      const liElement = element.querySelector('li')
      if (liElement) {
        const docHeight = liElement.getBoundingClientRect().height
        const marginTop = liElement.offsetTop
        const currentPos = scrollContainer.scrollTop - marginTop
        const containerHeight = (scrollContainer.parentElement as HTMLElement).getBoundingClientRect().height

        const fromPage = Math.floor(currentPos / docHeight) - 1
        const toPage = Math.floor((currentPos + containerHeight) / docHeight) + 2

        onLoadThumbnails(fromPage, toPage)
      }
    }, 100)
  })

  let lastTime: number | null = null
  let targetPos = 0

  const scrollAnimation = (timestamp: number) => {
    if (lastTime === null) {
      lastTime = timestamp
    }

    const throttleFactor = (timestamp - lastTime) * .01
    lastTime = timestamp

    const currentPos = scrollContainer.scrollTop
    const totalDiff = targetPos - currentPos
    let scrollDiff = totalDiff * throttleFactor
    if (Math.abs(scrollDiff) < 1) {
      scrollDiff = 1 * Math.sign(scrollDiff)
    }

    const nextPosition = Math.round(currentPos + scrollDiff)
    scrollContainer.scrollTop = nextPosition

    if (nextPosition !== targetPos) {
      window.requestAnimationFrame(scrollAnimation)
    }
  }

  const scrollTo = (topPos: number) => {
    targetPos = topPos
    lastTime = performance.now() - 16
    window.requestAnimationFrame(scrollAnimation)
  }

  const mutationObserver = new MutationObserver(function(mutations) {
    const liElement = element.querySelector('li')
    if (liElement) {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes') {
          if (mutation.attributeName === 'data-firstvisiblepage') {
            const firstVisiblePageAttr = element.dataset.firstvisiblepage
            if (firstVisiblePageAttr) {
              firstVisiblePage = parseInt(firstVisiblePageAttr, undefined)
            }
          } else if (mutation.attributeName === 'data-lastvisiblepage') {
            const lastVisiblePageAttr = element.dataset.lastvisiblepage
            if (lastVisiblePageAttr) {
              lastVisiblePage = parseInt(lastVisiblePageAttr, undefined)
            }
          } else if (mutation.attributeName === 'data-isvisible') {
            const isVisibleAttr = element.dataset.isvisible
            navigationIsVisible = isVisibleAttr !== undefined
          }
        }
      })

      if (!navigationIsVisible) {
        return
      }

      const maxScrollHeight = element.getBoundingClientRect().height
      const scrollHeight = scrollContainer.getBoundingClientRect().height
      const containerHeight = (scrollContainer.parentElement as HTMLElement).getBoundingClientRect().height
      const maxScrollTopPos = maxScrollHeight - containerHeight + (scrollHeight - containerHeight)
      const docHeight = liElement.getBoundingClientRect().height
      const marginTop = liElement.offsetTop
      const pageNumber = firstVisiblePage + (lastVisiblePage - firstVisiblePage) / 2

      let scrollToPos = (pageNumber - 1) * docHeight + marginTop - (containerHeight / 2) + (docHeight / 2)

      if (scrollToPos < 0) {
        scrollToPos = 0
      }
      if (scrollToPos > maxScrollTopPos) {
        scrollToPos = maxScrollTopPos
      }

      scrollTo(Math.floor(scrollToPos))
    }
  })

  mutationObserver.observe(element, {
    attributes: true,
    characterData: true,
    childList: false,
    subtree: false,
    attributeOldValue: false,
    characterDataOldValue: false,
  })
}
