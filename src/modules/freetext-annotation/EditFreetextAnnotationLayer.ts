import { CanvasLayer } from '../CanvasLayer'
import { ViewerCanvasState } from '../../pdf-viewer-canvas/state/store'
import { Color } from '../../common/Color'
import { FreetextAnnotationModule } from './FreetextAnnotationModule'
import { createEditFreetextAnnotationToolbar } from './EditFreetextAnnotationToolbar'
import { RichTextEditor } from './RichTextEditor'
import { convertPdfToCssPixel, convertCssToPdfPixel } from '../../common/Tools'

const moduleLayerName = 'AddFreetextAnnotation'

export class EditFreetextAnnotationLayer extends CanvasLayer {

  private freetextAnnotation: any | null = null
  private editorElement: HTMLElement | null = null
  private richTextEditor: RichTextEditor | null = null
  private color: string = this.options.defaultForegroundColor
  private fontSize: string = `${this.options.defaultFontSize}pt`
  private fontSizeCSS: string = convertPdfToCssPixel(`${this.options.defaultFontSize}`)
  private fontName: string = this.options.defaultFontFamiliy

  public onCreate(annotationId: number): void {
    this.store.viewer.beginModule(moduleLayerName)
    this.freetextAnnotation = this.pdfApi.getItem(annotationId) as any

    this.editorElement = this.createHtmlLayer()
    this.editorElement.style.position = 'absolute'
    this.editorElement.style.zIndex = '4'

    this.color = this.options.defaultFreetextFontColor ?
                 this.options.defaultFreetextFontColor :
                 this.options.defaultForegroundColor

    this.fontName = this.options.defaultFreetextFontFamily ?
                    this.options.defaultFreetextFontFamily :
                    this.options.defaultFontFamiliy

    if (this.options.defaultFreetextFontSize) {
      this.fontSize = `${this.options.defaultFreetextFontSize}`
      this.fontSizeCSS = convertPdfToCssPixel(`${this.options.defaultFreetextFontSize}`)
    }

    if (this.freetextAnnotation.richText) {
      const colorRes = /.*color:(.*?);/.exec(this.freetextAnnotation.richText)
      const fontNameRes = /.*font-family:(.*?);/.exec(this.freetextAnnotation.richText)
      const fontSizeRes = /.*font-size:(.*?)[;|\"]/.exec(this.freetextAnnotation.richText)

      if (colorRes && colorRes.length > 1) {
        this.color = colorRes[1]
      }
      if (fontNameRes && fontNameRes.length > 1) {
        this.fontName = fontNameRes[1]
      }
      if (fontSizeRes && fontSizeRes.length > 1) {
        this.fontSize = fontSizeRes[1]
        this.fontSizeCSS = convertPdfToCssPixel(this.fontSize)
      }
    } else {
      this.color = this.freetextAnnotation.color
      this.fontName = this.freetextAnnotation.fontName
      this.fontSizeCSS = convertPdfToCssPixel(this.freetextAnnotation.fontSize)
    }

    this.richTextEditor = new RichTextEditor(this.editorElement, {
      richText: this.freetextAnnotation.richText,
      backgroundColor: this.freetextAnnotation.color,
      borderColor: 'red',
      fontName: this.fontName,
      fontColor: this.color,
      fontSizeCSS: this.fontSizeCSS,
    })

    /* tslint:disable-next-line:align */
    ; const toolbarElement = (this.module as FreetextAnnotationModule).toolbarElement as HTMLElement

    createEditFreetextAnnotationToolbar({
      annotation: this.freetextAnnotation,
      backgroundColors: [...this.options.backgroundColors],
      fontColors: [...this.options.foregroundColors],
      fontFamilies: this.options.fontFamilies,
      fontSizes: this.options.fontSizes,
      selectedFont: this.fontName,
      selectedBackgroundColor: this.freetextAnnotation.color,
      selectedFontColor: this.color,
      selectedFontSize: this.fontSize,
      onCmd: this.richTextEditor.executeCommand,
      onClose: this.remove,
    }, toolbarElement)

  }

  public onRemove(): void {
    this.updateFreeTextAnnotation()
    this.removeHtmlElements()
    this.editorElement = null
    this.freetextAnnotation = null

    /* tslint:disable-next-line:align */
    ; const toolbarElement = (this.module as FreetextAnnotationModule).toolbarElement as HTMLElement
    toolbarElement.innerHTML = ''

    this.store.viewer.endModule(moduleLayerName)
  }

  public render(timestamp: number, state: ViewerCanvasState): void {

    if (state.viewer.modeChanged && state.viewer.selectedModuleName !== moduleLayerName) {
      this.remove()
      return
    }

    if (this.editorElement && this.freetextAnnotation && this.richTextEditor) {

      const updatePosition = state.canvas.canvasInvalidated || state.viewer.modeChanged

      if (updatePosition) {
        const screenRect = this.pdfApi.transformPdfPageRectToScreenRect(this.freetextAnnotation.pdfRect)
        this.editorElement.style.left = `${screenRect.x / devicePixelRatio}px`
        this.editorElement.style.top = `${screenRect.y / devicePixelRatio}px`
        this.editorElement.style.width = `${screenRect.w / devicePixelRatio}px`
        this.editorElement.style.height = `${screenRect.h / devicePixelRatio}px`
      }

      if (state.document.zoomChanged || state.viewer.modeChanged) {
        this.richTextEditor.setZoom(state.document.zoom)
      }
    }
  }

  private updateFreeTextAnnotation() {
    if (this.richTextEditor && this.freetextAnnotation) {
      const content = this.richTextEditor.getContent()
      const fontColor = new Color(content.fontColor as string)
      const backgroundColor = content.backgroundColor === '' ? null : new Color(content.backgroundColor as string)
      this.freetextAnnotation.richText = content.richText
      this.freetextAnnotation.fontColor = fontColor.toHexRgb()
      this.freetextAnnotation.fontName = content.fontName !== null ? content.fontName : 'Helvetica'
      this.freetextAnnotation.fontSize = content.fontSizeCSS ? convertCssToPdfPixel(content.fontSizeCSS) : this.freetextAnnotation.fontSize
      this.freetextAnnotation.color = backgroundColor !== null ? backgroundColor.toRgba() : null
      console.log(this.freetextAnnotation)
      this.pdfApi.updateItem(this.freetextAnnotation)
    }
  }
}
