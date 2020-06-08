import { CanvasModule, CanvasModuleRegistration } from '../CanvasModule'
import { createAnnotationbar } from './Annotationbar'
import { AddInkAnnotationLayer } from './AddInkAnnotationLayer'

export class InkAnnotationModule extends CanvasModule {
  public annotationbarElement: HTMLElement | null = null
  public toolbarElement: HTMLElement | null = null

  constructor() {
    super()
    this.name = 'InkAnnotationModule'
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
    }
  }

  private onBtnAddClicked() {
    /* tslint:disable-next-line:no-string-literal */
    if (!this.canvasLayers['add']) {
      this.createCanvasLayer('add', AddInkAnnotationLayer)
    } else {
      this.removeCanvasLayer('add')
    }
  }
}
