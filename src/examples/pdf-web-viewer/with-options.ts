import { PdfWebViewer } from '../../'
import { PdfWebViewerOptions } from '../../'
import '../styles/examples.scss'
import '../../styles/themes/pdf-web-viewer.scss'

const viewerOptionsForm = document.getElementById('viewerOptionsForm') as HTMLFormElement

viewerOptionsForm.addEventListener('submit', e => {
  e.preventDefault()
  const inputElements = viewerOptionsForm.querySelectorAll<HTMLInputElement>( 'input, select' ) as any
  const options: any = {}
  inputElements.forEach((element: HTMLInputElement) => {
    options[element.name] = element.type === 'checkbox' ? element.value === 'on' ? true : false : element.value
  })
  createViewer(options)
})

const createViewer = (options: Partial<PdfWebViewerOptions & { license: string }>) => {
  const viewerContainer = document.getElementById('viewer') as HTMLElement
  const license = options.license as string
  const viewer = new PdfWebViewer(viewerContainer, license, options)
}
