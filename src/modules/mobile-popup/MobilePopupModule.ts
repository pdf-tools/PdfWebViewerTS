import { CanvasModule, CanvasModuleRegistration } from '../CanvasModule'
import { MobilePopupLayer } from './MobilePopupLayer'

export class MobilePopupModule extends CanvasModule {
  constructor() {
    super()
    this.name = 'MobilePopupModule'
  }

  public onRegister() {
    this.createCanvasLayer('mobilePopup', MobilePopupLayer)

    return {}
  }
}
