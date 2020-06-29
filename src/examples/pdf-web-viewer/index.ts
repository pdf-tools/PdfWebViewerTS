import { PdfWebViewer } from '../../'
import { PdfWebViewerOptions } from '../../'
import { PdfPageLayoutMode, StampAnnotationColor } from '../../pdf-viewer-api'
import { DebugModule } from './modules/DebugModule'

import { TextAnnotationModule } from '../../modules/text-annotation/TextAnnotationModule'
import { InkAnnotationModule } from '../../modules/ink-annotation/InkAnnotationModule'
import { EditInkAnnotationModule } from '../../modules/edit-ink-annotation/EditInkAnnotationModule'
import { FreetextAnnotationModule } from '../../modules/freetext-annotation/FreetextAnnotationModule'
import { HighlightAnnotationModule } from '../../modules/highlight-annotation/HighlightAnnotationModule'
import { StampAnnotationModule } from '../../modules/stamp-annotation/StampAnnotationModule'
import { PopupModule } from '../../modules/popup/PopupModule'
import { ShapeAnnotationModule } from '../../modules/shape-annotations/ShapeAnnotationModule'
import { ImageAnnotationModule } from '../../modules/image-annotations/ImageAnnotationModule'

import { ApprovedImageStamp } from './sampleImageStamps'

import '../styles/examples.scss'
import '../../styles/themes/pdf-web-viewer.scss'

const viewerContainer = document.getElementById('viewer') as HTMLElement
const license = '1-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX'
const options: Partial<PdfWebViewerOptions> = {
  author: 'Hans Muster',
  allowFileDrop: true,
  allowSaveFile: true,
  allowOpenFile: true,
  enableThumbnailNavigation: true,
  enableOutlineNavigation: true,
  enableSearch: true,
  pageLayoutModes: [
    PdfPageLayoutMode.ONE_COLUMN,
    PdfPageLayoutMode.SINGLE_PAGE,
    PdfPageLayoutMode.TWO_COLUMN_LEFT,
    PdfPageLayoutMode.TWO_COLUMN_RIGHT,
    PdfPageLayoutMode.TWO_PAGE_LEFT,
    PdfPageLayoutMode.TWO_PAGE_RIGHT,
  ],
  language: 'en',
  highlightColors: ['#2ADB1A', '#FFEA02', '#FF7F1F', '#FF2882', '#008AD1'],
  foregroundColors: ['#323232', '#FFFFFF', '#FFEA02', '#2ADB1A', '#0066CC', '#D82F32'],
  backgroundColors: ['transparent', '#FFFFFF', '#FCF5E2', '#323232', '#FFEA02', '#D82F32', '#0066CC'],
  defaultHighlightColor: '#FFEA02',
  defaultBackgroundColor: '#FCF5E2',
  defaultForegroundColor: '#323232',
  highlightOpacity: 0.5,
  textSelectionColor: '#006395',
  searchMatchColor: '#3ABCFF',
  defaultStampWidth: 120,
  modules: [
    DebugModule,
    PopupModule,
    TextAnnotationModule,
    InkAnnotationModule,
    EditInkAnnotationModule,
    FreetextAnnotationModule,
    HighlightAnnotationModule,
    StampAnnotationModule,
    ShapeAnnotationModule,
    ImageAnnotationModule,
  ],
  stamps: [
    {
      image: ApprovedImageStamp.image,
      name: 'Approved Image',
      thumbnail: ApprovedImageStamp.thumbnail,
    },
    { text: 'APPROVED', color: StampAnnotationColor.GREEN},
    { text: 'NOT APPROVED', color: StampAnnotationColor.RED },
    { text: 'DRAFT', color: StampAnnotationColor.BLUE },
    { text: 'FINAL', color: StampAnnotationColor.GREEN },
    { text: 'COMPLETED', color: StampAnnotationColor.GREEN },
    { text: 'CONFIDENTIAL', color: StampAnnotationColor.BLUE },
    { text: 'FOR PUBLIC RELEASE', color: StampAnnotationColor.BLUE },
    { text: 'NOT FOR PUBLIC RELEASE', color: StampAnnotationColor.BLUE },
    { text: 'VOID', color: StampAnnotationColor.RED },
    { text: 'FOR COMMENT', color: StampAnnotationColor.BLUE },
    { text: 'PRELIMINARY RESULTS', color: StampAnnotationColor.BLUE },
    { text: 'INFORMATION ONLY', color: StampAnnotationColor.BLUE },
  ],

  /*****
   * EXAMPLE: Custom event handlers for open and save.
   *****/

  // onOpenFileButtonClicked: () => {
  //   alert('open file button clicked')
  //   viewer.openFile(...)
  // },
  // onSaveFileButtonClicked: () => {
  //   alert('close file button clicked')
  //   const promise = viewer.saveFile(true)
  //   if (promise) {
  //     promise.then( res => console.log(res))
  //   }
  // },
}

const viewer = new PdfWebViewer(viewerContainer, license, options)

viewer.addEventListener('appLoaded', () => {
  console.log('app loaded')

  /*****
   * EXAMPLE: Get PDF via fetch and then pass the blob
   *****/

  // fetch('http://url/to/a/pdf/sample.pdf').then( data => {
  //   data.blob().then( blob => {
  //     viewer.openFile(blob as File)
  //   })
  // }).catch( error => {
  //   console.log(error.target.status)
  // })

  /*****
   * EXAMPLE: Open PDF via URL. Large files will be opened piecewise.
   * CORS rules apply: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
   *****/
  // viewer.openFile('http://url/to/cors/accessible/file.pdf')
})

viewer.addEventListener('documentLoaded', (file) => {
  if (file instanceof Blob) {
    console.log('*** document loaded ***')
    console.log('name          : ' + file.name)
    console.log('size          : ' + Math.floor(file.size / 1024) + 'kb')
    console.log('last modified : ' + file.lastModified)
    console.log('type          : ' + file.type)
  } else {
    console.log('*** document loaded ***')
    console.log('uri: file')
  }
})
