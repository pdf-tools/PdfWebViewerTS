import { CanvasModule, CanvasModuleRegistration } from '../CanvasModule'
import { createAnnotationbar } from './Annotationbar'
import { AddRectangleAnnotationLayer } from './AddRectangleAnnotationLayer'

export class ShapeAnnotationModule extends CanvasModule {
  public annotationbarElement: HTMLElement | null = null
  public toolbarElement: HTMLElement | null = null

  constructor() {
    super()
    this.onBtnAddRectangleClicked = this.onBtnAddRectangleClicked.bind(this)
  }

  public onRegister() {
    this.annotationbarElement = document.createElement('div')
    this.annotationbarElement.classList.add('pwv-commandbar-group')
    createAnnotationbar(
      {
        onBtnAddClicked: this.onBtnAddRectangleClicked,
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
      this.createCanvasLayer('add', AddRectangleAnnotationLayer)
    } else {
      this.removeCanvasLayer('add')
    }
  }
}
