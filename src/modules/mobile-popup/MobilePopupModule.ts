import { CanvasModule, CanvasModuleRegistration } from '../CanvasModule'
import { MobilePopupLayer } from './MobilePopupLayer'

export class MobilePopupModule extends CanvasModule {

  constructor() {
    super()
  }

  public onRegister() {
    this.createCanvasLayer('mobilePopup', MobilePopupLayer)

    return {
    }
  }

}
