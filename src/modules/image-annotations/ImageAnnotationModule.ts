import { CanvasModule, CanvasModuleRegistration } from '../CanvasModule'
import { createAnnotationbar } from './Annotationbar'
import { getPageOnPoint, getRectFromSelection } from '../../pdf-viewer-canvas/state/document'
import { PdfItemType, Point, PdfRect, ImageStampAnnotationArgs } from '../../pdf-viewer-api'
import { imageDataUrlToUint8Array } from '../../common/Tools'

export class ImageAnnotationModule extends CanvasModule {
  public annotationbarElement: HTMLElement | null = null
  public toolbarElement: HTMLElement | null = null

  constructor() {
    super()
    this.onFileSelected = this.onFileSelected.bind(this)
    this.createImageStampAnnotation = this.createImageStampAnnotation.bind(this)
  }

  public onRegister() {
    this.annotationbarElement = document.createElement('div')
    this.annotationbarElement.classList.add('pwv-commandbar-group')
    createAnnotationbar(
      {
        onFileSelected: this.onFileSelected,
      },
      this.annotationbarElement,
    )
    this.toolbarElement = document.createElement('div')

    return {
      annotationbar: this.annotationbarElement,
      toolbar: this.toolbarElement,
    }
  }

  private async onFileSelected(file: File) {
    const image = new Image()
    image.onload = () => {
      const imageInfo = {
        width: image.width,
        height: image.height,
        stampImage: imageDataUrlToUint8Array(image.src),
      }

      this.createImageStampAnnotation(imageInfo)
    }

    const reader = new FileReader()
    reader.onload = function (e: any) {
      image.src = e.target.result
    }
    reader.readAsDataURL(file)
  }

  private createImageStampAnnotation(imageInfo: { width: number; height: number; stampImage: Uint8Array }) {
    if (this.pdfApi !== null && this.store !== null && this.options !== null) {
      const imageRegister = this.pdfApi.registerStampImage(imageInfo.stampImage)

      const state = this.store.getState()
      const document = state.document
      const canvasRect = this.getCanvasSize()
      const screenCenter: Point = {
        x: canvasRect.width / 2,
        y: canvasRect.height / 2,
      }

      // get page to insert image
      let page = 0
      while (page === 0) {
        page = getPageOnPoint(document, screenCenter)
        if (page === 0) {
          if (screenCenter.y > 0) {
            screenCenter.y -= 1
          } else {
            page = document.firstVisiblePage
          }
        }
      }

      const pageScreenRect = this.pdfApi.getPageScreenRect(page)
      const pageBoundingBox = this.pdfApi.transformScreenRectToPdfRect(pageScreenRect, page)

      const imagepPdfRect = {
        pdfX: 0,
        pdfY: 0,
        pdfW: imageInfo.width * 0.24,
        pdfH: imageInfo.height * 0.24,
        page,
      }

      if (imagepPdfRect.pdfW > pageBoundingBox.pdfW) {
        const f = pageBoundingBox.pdfW / imagepPdfRect.pdfW
        imagepPdfRect.pdfW = imagepPdfRect.pdfW * f
        imagepPdfRect.pdfH = imagepPdfRect.pdfH * f
      }

      if (imagepPdfRect.pdfH > pageBoundingBox.pdfH) {
        const f = pageBoundingBox.pdfH / imagepPdfRect.pdfH
        imagepPdfRect.pdfW = imagepPdfRect.pdfW * f
        imagepPdfRect.pdfH = imagepPdfRect.pdfH * f
      }

      imagepPdfRect.pdfX = (pageBoundingBox.pdfW - imagepPdfRect.pdfW) / 2
      imagepPdfRect.pdfY = (pageBoundingBox.pdfH - imagepPdfRect.pdfH) / 2

      imageRegister.then((imageId) => {
        if (this.pdfApi !== null && this.options !== null) {
          const annotation: ImageStampAnnotationArgs = {
            itemType: PdfItemType.STAMP,
            imageId,
            page,
            color: this.options.defaultFillColor,
            pdfRect: imagepPdfRect,
            originalAuthor: this.options.author,
          }

          this.pdfApi
            .createItem(annotation)
            .then((annot) => {
              // select new annotation
              const pdfViewerCanvasApi = this.pdfViewerCanvas as any
              pdfViewerCanvasApi.dispatchEvent('itemSelected', annot)
            })
            .catch((err) => {
              console.log(err)
            })
        }
      })
    }
  }
}
