import { CanvasModule, CanvasModuleRegistration } from '../CanvasModule'
import { createAnnotationbar } from './Annotationbar'
import { EditInkAnnotationLayer } from './EditInkAnnotationLayer'

export class EditInkAnnotationModule extends CanvasModule {

  public annotationbarElement: HTMLElement | null = null
  public toolbarElement: HTMLElement | null = null

  constructor() {
    super()
    this.name = 'EditInkAnnotationModule'
    this.onBtnAddClicked = this.onBtnAddClicked.bind(this)
    this.activate = this.activate.bind(this)
  }

  public onRegister() {
    this.annotationbarElement = document.createElement('div')
    this.annotationbarElement.classList.add('pwv-commandbar-group')
    createAnnotationbar({
      onBtnAddClicked: this.onBtnAddClicked,
    }, this.annotationbarElement)
    this.toolbarElement = document.createElement('div')

    return {
      annotationbar: this.annotationbarElement,
      toolbar: this.toolbarElement,
    }
  }

  public activate() {
    this.onBtnAddClicked()
  }

  private onBtnAddClicked() {
    /* tslint:disable-next-line:no-string-literal */
    if (!this.canvasLayers['add']) {
      this.createCanvasLayer('add', EditInkAnnotationLayer)
    } else {
      this.removeCanvasLayer('add')
    }
  }
}
