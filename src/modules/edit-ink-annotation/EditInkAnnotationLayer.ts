import { CanvasLayer } from '../CanvasLayer'
import { ViewerCanvasState } from '../../pdf-viewer-canvas/state/store'
import { InkAnnotation, PdfItemType, PdfPoint, PdfRect, PdfItem, PdfItemCategory, Annotation } from '../../pdf-viewer-api/'
import { EditInkAnnotationModule } from './EditInkAnnotationModule'
import { CursorStyle } from '../../pdf-viewer-canvas/state/viewer'
import { translationManager } from '../../common/TranslationManager';

const moduleLayerName = 'EditInkAnnotation'

interface Match {
  distance: number
  lineIndex: number
  annot: InkAnnotation
}

export class EditInkAnnotationLayer extends CanvasLayer {

  private inkAnnotations: Map<number, Map<number, InkAnnotation>> = new Map()
  private infoPanel: HTMLDivElement | null = null

  public onCreate(): void {
    this.onItemCreated = this.onItemCreated.bind(this)
    this.onVisiblePageChanged = this.onVisiblePageChanged.bind(this)

    this.pdfApi.addEventListener('itemCreated', this.onItemCreated)
    this.pdfApi.addEventListener('firstVisiblePage', this.onVisiblePageChanged)
    this.pdfApi.addEventListener('lastVisiblePage', this.onVisiblePageChanged)

    this.getInkAnnotations = this.getInkAnnotations.bind(this)
    this.getInkLinesCloseToPoint = this.getInkLinesCloseToPoint.bind(this)
    this.isPointInRect = this.isPointInRect.bind(this)

    const store = this.store.getState()
    this.inkAnnotations = new Map<number, Map<number, InkAnnotation>>()
    this.getInkAnnotations(store.document.firstVisiblePage, store.document.lastVisiblePage)

    this.infoPanel = document.createElement('div')
    this.infoPanel.classList.add('pwv-ink-info-panel')
    this.infoPanel.innerHTML = translationManager.getText('eraseInkLine')
    this.containerElement.appendChild(this.infoPanel)
    this.store.viewer.beginModule(moduleLayerName)
  }

  public onSave(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      resolve()
    })
  }

  public onRemove(): void {
    this.removeCanvasElements()
    if (this.infoPanel) {
      this.containerElement.removeChild(this.infoPanel)
    }

    const toolbarElement = (this.module as EditInkAnnotationModule).toolbarElement as HTMLElement
    toolbarElement.innerHTML = ''

    this.store.viewer.endModule(moduleLayerName)
  }

  public render(timestamp: number, state: ViewerCanvasState): void {
    if (state.viewer.modeChanged && state.viewer.selectedModuleName !== moduleLayerName) {
      this.remove()
      return
    }

    const pos = {
      x: state.pointer.x.devicePixels,
      y: state.pointer.y.devicePixels,
    }
    const pdfPointRes = this.pdfApi.transformScreenPointToPdfPoint(pos)
    if (!pdfPointRes.isOnPage) {
      this.store.viewer.setCursorStyle(CursorStyle.NOT_ALLOWED)
      return
    } else {
      this.store.viewer.setCursorStyle(CursorStyle.ERASE)
    }
    if (state.pointer.action === 'click') {
      if (pdfPointRes.isOnPage) {
        const point = pdfPointRes.pdfPoint
        const page = point.page
        if (!this.inkAnnotations.get(page)) {
          return
        }
        const candidates: Match[][] = []
        let pageAnnots: Map<number, InkAnnotation> | undefined
        pageAnnots = this.inkAnnotations.get(page)
        if (pageAnnots) {
          pageAnnots.forEach((inkAnnot: InkAnnotation, id: number) => {
            const matches = this.getInkLinesCloseToPoint(inkAnnot, point)
            if (matches.length > 0) {
              candidates.push(matches)
            }
          })
        }
        let minDistance: number = Number.MAX_SAFE_INTEGER
        let minCandidate: any = null
        candidates.forEach( matches => {
          matches.forEach( match => {
            if (match.distance < minDistance) {
              minDistance = match.distance
              minCandidate = match
            }
          })
        })

        if (minCandidate !== null) {
          minCandidate.annot.inkList.splice(minCandidate.lineIndex, 1)
          if (minCandidate.annot.inkList.length === 0) {
            this.pdfApi.deleteItem(minCandidate.annot)
            this.getInkAnnotations(page, page)
          } else {
            this.pdfApi.updateItem(minCandidate.annot).then(result => {
              this.getInkAnnotations(page, page)
            })
          }
        }
      }
    }

  }

  private getInkLinesCloseToPoint(inkAnnot: InkAnnotation, point: PdfPoint): Match[] {
    if (!this.isPointInRect(inkAnnot.pdfRect, point)) {
      return []
    }
    const matches: Match[] = []
    for (let lineIndex = 0; lineIndex < inkAnnot.inkList.length; lineIndex++) {
      for (let j = 0; j < inkAnnot.inkList[lineIndex].length; j += 2) {
        const inkPoint = { x: inkAnnot.inkList[lineIndex][j], y: inkAnnot.inkList[lineIndex][j + 1] }
        const distance = (point.pdfX - inkPoint.x) ** 2 + (point.pdfY - inkPoint.y) ** 2
        const delta = (Math.max(inkAnnot.border.width, 5) * Math.max(this.store.getState().document.zoom, 1.2) * this.store.getState().canvas.pixelRatio) ** 2
        if (distance < delta) {
          matches.push({distance, lineIndex, annot: inkAnnot})
        }
      }
    }
    return matches
  }

  private isPointInRect(rect: PdfRect, point: PdfPoint): boolean {
    const tolerance = 15
    return rect.pdfX <= point.pdfX + tolerance &&
           rect.pdfY <= point.pdfY + tolerance &&
           (point.pdfY - rect.pdfY) <= rect.pdfH + tolerance &&
           (point.pdfX - rect.pdfX) <= rect.pdfW + tolerance
  }

  private getInkAnnotations(firstPage: number, lastPage: number) {
    const state = this.store.getState()
    for (let page = firstPage; page <= lastPage; page++) {
      if (!this.inkAnnotations.has(page)) {
        this.inkAnnotations.set(page, new Map<number, InkAnnotation>())
      }
      const annots = state.annotations.byPage[page]
      if (annots) {
        for (let k = 0; k < annots.length; k++) {
          const annot = state.annotations.all[annots[k]]
          if (annot.itemType === PdfItemType.INK) {
            const pageMap = this.inkAnnotations.get(page)
            if (pageMap) {
              pageMap.set(annot.id, annot as InkAnnotation)
            }
          }
        }
      } else {
        this.pdfApi.getItemsFromPage(page, PdfItemCategory.ANNOTATION).then( items => {
          const annotations = items.items as Annotation[]
          annotations.forEach(annot => {
            if (annot.itemType === PdfItemType.INK) {
              const pageMap = this.inkAnnotations.get(page)
              if (pageMap) {
                pageMap.set(annot.id, annot as InkAnnotation)
              }
            }
          })
        })
      }
    }
  }

  private onItemCreated(item: PdfItem) {
    if (item.itemCategory === PdfItemCategory.ANNOTATION) {
      const annot = item as Annotation
      if (annot.itemType === PdfItemType.INK) {
        const page = annot.pdfRect.page
        if (!this.inkAnnotations.has(page)) {
          this.inkAnnotations.set(page, new Map<number, InkAnnotation>())
        }
        const pageMap = this.inkAnnotations.get(page)
        if (pageMap) {
          pageMap.set(annot.id, annot as InkAnnotation)
        }
      }
    }
  }

  private onVisiblePageChanged() {
    const store = this.store.getState()
    this.getInkAnnotations(store.document.firstVisiblePage, store.document.lastVisiblePage)
  }
}
