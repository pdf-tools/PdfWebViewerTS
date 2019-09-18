import { CanvasModule } from '../../../modules/CanvasModule'
import { DebugLayer } from './DebugLayer'

export class DebugModule extends CanvasModule {
  constructor() {
    super()
  }

  public onRegister() {
    this.createCanvasLayer('debugInfo', DebugLayer)

    /* tslint:disable-next-line:align */
    ; (window as any).pdfViewer = {
      pdfApi: this.pdfApi,
      store: this.store,
      options: this.options,
    }

    return {
    }
  }
}
