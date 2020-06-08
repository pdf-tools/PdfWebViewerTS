import { PdfItemType } from '../../pdf-viewer-api'
import { CanvasModule, CanvasModuleRegistration } from '../CanvasModule'
import { createAnnotationbar } from './Annotationbar'
import { AddShapeAnnotationLayer } from './AddShapeAnnotationLayer'

export class ShapeAnnotationModule extends CanvasModule {
  public annotationbarElement: HTMLElement | null = null
  public toolbarElement: HTMLElement | null = null

  constructor() {
    super()
    this.name = 'ShapeAnnotationModule'
    this.onBtnAddRectangleClicked = this.onBtnAddRectangleClicked.bind(this)
    this.onBtnAddCircleClicked = this.onBtnAddCircleClicked.bind(this)
  }

  public onRegister() {
    this.annotationbarElement = document.createElement('div')
    this.annotationbarElement.classList.add('pwv-commandbar-group')
    createAnnotationbar(
      {
        onBtnAddRectangleClicked: this.onBtnAddRectangleClicked,
        onBtnAddCircleClicked: this.onBtnAddCircleClicked,
      },
      this.annotationbarElement,
    )
    this.toolbarElement = document.createElement('div')

    return {
      annotationbar: this.annotationbarElement,
      toolbar: this.toolbarElement,
    }
  }

  private onBtnAddRectangleClicked() {
    /* tslint:disable-next-line:no-string-literal */
    if (!this.canvasLayers['add']) {
      this.createCanvasLayer('add', AddShapeAnnotationLayer, PdfItemType.SQUARE)
    } else {
      this.removeCanvasLayer('add')
    }
  }

  private onBtnAddCircleClicked() {
    /* tslint:disable-next-line:no-string-literal */
    if (!this.canvasLayers['add']) {
      this.createCanvasLayer('add', AddShapeAnnotationLayer, PdfItemType.CIRCLE)
    } else {
      this.removeCanvasLayer('add')
    }
  }
}
