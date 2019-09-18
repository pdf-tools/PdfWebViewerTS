import { CanvasModule, CanvasModuleRegistration } from '../CanvasModule'
import { PopupLayer } from './PopupLayer'

export class PopupModule extends CanvasModule {

  constructor() {
    super()
  }

  public onRegister() {
    this.createCanvasLayer('popup', PopupLayer)

    return {
    }
  }

}
