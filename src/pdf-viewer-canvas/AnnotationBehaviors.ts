import { PdfItemType } from '../pdf-viewer-api'

/** @internal */
export interface AnnotationBehaviors {
  selectable: boolean,
  editable: boolean,
  deletable: boolean,
  movable: boolean,
  rotatable: boolean,
  resizable: boolean,
  aspectRatioChangeable: boolean,
  canHavePopup: boolean,
  link: boolean,
  text: boolean,
}

const annotationBehaviors: {[key: number]: boolean[]} = {
  //                               select,edit,  delete,move,  rotate,resize,AR,    popup, link,  text
  [PdfItemType.UNKNOWN]:          [false, false, false, true,  false, false, false, true,  false, false],
  [PdfItemType.TEXT]:             [true,  false, true,  true,  false, false, false, true,  false, false],
  [PdfItemType.LINK]:             [false, false, false, true,  false, false, false, false, true , false],
  [PdfItemType.FREE_TEXT]:        [true,  true,  true,  true,  false, true,  true,  false, false, false],
  [PdfItemType.LINE]:             [true,  false, true,  true,  false, true,  true,  true,  false, false],
  [PdfItemType.SQUARE]:           [true,  false, true,  true,  false, true,  true,  true,  false, false],
  [PdfItemType.CIRCLE]:           [true,  false, true,  true,  false, true,  true,  true,  false, false],
  [PdfItemType.POLYGON]:          [true,  false, true,  true,  false, true,  true,  true,  false, false],
  [PdfItemType.POLY_LINE]:        [true,  false, true,  true,  false, true,  true,  true,  false, false],
  [PdfItemType.HIGHLIGHT]:        [true,  false, true,  false, false, false, false, true,  false, true ],
  [PdfItemType.UNDERLINE]:        [true,  false, true,  false, false, false, false, true,  false, true ],
  [PdfItemType.SQUIGGLY]:         [true,  false, true,  false, false, false, false, true,  false, true ],
  [PdfItemType.STRIKE_OUT]:       [true,  false, true,  false, false, false, false, true,  false, true ],
  [PdfItemType.STAMP]:            [true,  false, true,  true,  true,  true,  false, true,  false, false],
  [PdfItemType.CARET]:            [true,  false, true,  false, false, false, false, true,  false, false],
  [PdfItemType.INK]:              [true,  false, true,  true,  false, true,  true,  true,  false, false],
  [PdfItemType.POPUP]:            [false, false, false, false, false, false, false, false, false, false],
  [PdfItemType.FILE_ATTACHMENT]:  [false, false, false, false, false, false, false, false, false, false],
  [PdfItemType.SOUND]:            [false, false, false, false, false, false, false, false, false, false],
  [PdfItemType.MOVIE]:            [false, false, false, false, false, false, false, false, false, false],
  [PdfItemType.WIDGET]:           [false, false, false, false, false, false, false, false, false, false],
  [PdfItemType.SCREEN]:           [false, false, false, false, false, false, false, false, false, false],
  [PdfItemType.PRINTER_MARK]:     [false, false, false, false, false, false, false, false, false, false],
  [PdfItemType.TRAP_NET]:         [false, false, false, false, false, false, false, false, false, false],
  [PdfItemType.WATERMARK]:        [false, false, false, false, false, false, false, false, false, false],
  [PdfItemType.THREED]:           [false, false, false, false, false, false, false, false, false, false],
}

/** @internal */
export const getAnnotationBehaviors = (itemType: PdfItemType): AnnotationBehaviors => {
  const t = annotationBehaviors[itemType]
  if (!t) {
    console.error('unknown item type:' + itemType)
    return {
      selectable: false,
      editable: false,
      deletable: false,
      movable: false,
      rotatable: false,
      resizable: false,
      aspectRatioChangeable: false,
      canHavePopup: false,
      link: false,
      text: false,
    }
  }
  return {
    selectable: t[0],
    editable: t[1],
    deletable: t[2],
    movable: t[3],
    rotatable: t[4],
    resizable: t[5],
    aspectRatioChangeable: t[6],
    canHavePopup: t[7],
    link: t[8],
    text: t[9],
  }
}
