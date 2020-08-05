import { CanvasModule, CanvasModuleRegistration } from '../CanvasModule'
import { PopupLayer } from './PopupLayer'

export class PopupModule extends CanvasModule {
  constructor() {
    super()
    this.name = 'PopupModule'
  }

  public onRegister() {
    this.createCanvasLayer('popup', PopupLayer)

    return {}
  }

  public activate() {
    return
  }
}
