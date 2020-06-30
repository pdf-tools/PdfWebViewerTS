import { CanvasModule } from '../CanvasModule'
import { createAnnotationbar, AnnotationbarActions } from './Annotationbar'
import { AddFreetextAnnotationLayer } from './AddFreetextAnnotationLayer'
import { PdfItemType } from '../../pdf-viewer-api'
import { icons } from '../../common/Icon'
import { EditFreetextAnnotationLayer } from './EditFreetextAnnotationLayer'

export class FreetextAnnotationModule extends CanvasModule {
  public annotationbarElement: HTMLElement | null = null
  public toolbarElement: HTMLElement | null = null
  private annotationbar: AnnotationbarActions | null = null

  constructor() {
    super()
    this.name = 'FreetextAnnotationModule'
    this.onEdit = this.onEdit.bind(this)
    this.onBtnAddClicked = this.onBtnAddClicked.bind(this)
  }

  public onRegister() {
    this.annotationbarElement = document.createElement('div')
    this.annotationbarElement.classList.add('pwv-commandbar-group')
    createAnnotationbar(
      {
        onBtnAddClicked: this.onBtnAddClicked,
      },
      this.annotationbarElement,
    )
    this.toolbarElement = document.createElement('div')
    return {
      annotationbar: this.annotationbarElement,
      toolbar: this.toolbarElement,
      contextbar: {
        itemTypes: [PdfItemType.FREE_TEXT],
        icon: icons.edit,
        onCmd: (annotationId: number) => {
          this.onEdit(annotationId)
        },
      },
    }
  }

  public activate(annotationId: number) {
    this.onEdit(annotationId)
  }

  public onEdit(annotationId: number) {
    this.createCanvasLayer('edit', EditFreetextAnnotationLayer, annotationId)
  }

  private onBtnAddClicked() {
    /* tslint:disable-next-line:no-string-literal */
    if (!this.canvasLayers['add']) {
      if (this.store) {
        this.store.viewer.deselectAnnotation()
      }
      this.createCanvasLayer('add', AddFreetextAnnotationLayer)
    } else {
      this.removeCanvasLayer('add')
    }
  }
}
