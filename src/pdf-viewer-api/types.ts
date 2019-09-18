import { PdfItemType, PdfItemCategory, AnnotationBorderStyle, StampAnnotationColor, PdfActionType, StampType, SearchResultType } from './enums'

export interface PdfDestination {
  destinationType: number
  page: number
  left: number | null
  top: number | null
  bottom: number | null
  right: number | null
  zoom: number | null
}

export interface PdfItemsOnPage {
  page: number
  itemCategory: number
  items: PdfItem[]
}

export interface ScrollPosition {
  x: number
  y: number
}

export interface MaxScrollPosition {
  x_max: number
  y_max: number
}

export interface Point {
  x: number
  y: number
}

export interface PageImage {
  page: number
  imageData: ImageData
}

export interface ImageData {
  data: Uint8ClampedArray
  width: number
  height: number
}

export interface PdfPoint {
  pdfX: number
  pdfY: number
  page: number
}

export interface PdfRect {
  pdfX: number
  pdfY: number
  pdfW: number
  pdfH: number
  page: number
}

export interface TextSelectionRect extends PdfRect {
  id: number
}

export interface ScreenPointToPdfPointResult {
  pdfPoint: PdfPoint
  isOnPage: boolean
}

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface SearchResult {
  index: number
  list: PdfRect[]
  type: SearchResultType
}

export interface PdfItem {
  id: number
  itemCategory: PdfItemCategory
}

export interface PdfPositionalItem extends PdfItem {
  pdfRect: PdfRect
}

export interface TextFragment extends PdfPositionalItem {
  pdfRect: PdfRect
  defaultRotation: 0
  glyphOffsets: number[]
  text: string
}

export interface AnnotationPopup extends Annotation {
  isOpen: boolean
}

export interface Annotation extends PdfPositionalItem {
  itemType: PdfItemType
  lastModified: string
  borderWidth: number
  page: number
  content: string | null
  color: string | null
  originalAuthor: string
  popup: AnnotationPopup
  isLocked(): boolean
}

export interface LinkAnnotation extends PdfPositionalItem {
  actionType: PdfActionType
  destination: PdfDestination | null
  uri: string | null
  quadPointRects: PdfRect[] | null
}

export interface StampAnnotation extends PdfPositionalItem {
  rotation: number
}

export interface HighlightAnnotation extends Annotation {
  quadPointRects: PdfRect[] | null
}

export interface FreetextAnnotation extends Annotation {
  fontSize: number
  fontName: string
  fontColor: string
  richText: string | null
}

export interface StampInfoArgs {
  stampType: StampType
  stampText: string | null
  name: string | null
  image: Uint8Array | null
}

export interface StampInfo {
  stampType: StampType
  name: string | null
  stampText: string | null
  aspectRatio: number
}

export interface AnnotationBorder {
  width: number
  style: AnnotationBorderStyle
}

export interface ItemArgs {
  category: PdfItemCategory
}

export interface AnnotationArgs {
  itemType: PdfItemType
  page: number
  pdfRect: PdfRect
  color: string | null
  originalAuthor: string | undefined
  content?: string
}

export interface InkAnnotationArgs extends AnnotationArgs {
  border: AnnotationBorder
  inkList: number[][]
}

export interface FreeTextAnnotationArgs extends AnnotationArgs {
  border: AnnotationBorder
  richtext: string | null
  fontName: string | null
  fontColor: string | null
  fontSize: number | null
}

export interface TextStampAnnotationArgs extends AnnotationArgs {
  stampColor?: StampAnnotationColor
  stampText: string
  stampName?: string | null
}

export interface ImageStampAnnotationArgs extends AnnotationArgs {
  stampImage: Uint8Array
}

export interface HighlightAnnotationArgs extends AnnotationArgs {
  quadPointRects: PdfRect[]
}

export interface OutlineItem extends PdfItem {
  destination: PdfDestination
  hasDescendants: boolean
  level: number
  title: string
}

export interface DeletedItem {
  id: number
  categoryType: PdfItemCategory
}

export interface BoundingBox {
  left: number
  bottom: number
  right: number
  top: number
}

export interface TransformMatrix {
  a: number
  b: number
  c: number
  d: number
  e: number
  f: number
}

export interface ContentElement extends PdfPositionalItem {
  bbox: BoundingBox
  tm: TransformMatrix
}
