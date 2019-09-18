
export enum PdfItemCategory {
  ANNOTATION = 1,
  TEXT_FRAGMENT = 2,
  OUTLINE = 3,
  DESTINATION = 4,
  CONTENT_ELEMENT = 5,
}

export enum AnnotationBorderStyle {
  SOLID = 0,
  DASHED = 1,
  BEVELED = 2,
  INSET = 3,
  UNDERLINE = 4,
}

export enum StampAnnotationColor {
  GREEN = 0,
  RED = 1,
  BLUE = 2,
}

export enum PdfItemType {
  UNKNOWN = 0,
  TEXT = 1,
  LINK = 2,
  FREE_TEXT = 3,
  LINE = 4,
  SQUARE = 5,
  CIRCLE = 6,
  POLYGON = 7,
  POLY_LINE = 8,
  HIGHLIGHT = 9,
  UNDERLINE = 10,
  SQUIGGLY = 11,
  STRIKE_OUT = 12,
  STAMP = 13,
  CARET = 14,
  INK = 15,
  POPUP = 16,
  FILE_ATTACHMENT = 17,
  SOUND = 18,
  MOVIE = 19,
  WIDGET = 20,
  SCREEN = 21,
  PRINTER_MARK = 22,
  TRAP_NET = 23,
  WATERMARK = 24,
  THREED = 25,
}

export enum PdfDestinationType {
  FIT = 1,
  FITH = 2,
  FITV = 3,
  FITR = 4,
  FITB = 5,
  FITBH = 6,
  FITBV = 7,
  XYZ = 8,
}

export enum PdfFitMode {
  ACTUAL_SIZE = 0,
  FIT_WIDTH = 1,
  FIT_PAGE = 2,
}

export enum PdfPageLayoutMode {
  NONE = 0,
  ONE_COLUMN = 2,
  SINGLE_PAGE = 1,
  TWO_COLUMN_LEFT = 3,
  TWO_COLUMN_RIGHT = 4,
  TWO_PAGE_LEFT = 5,
  TWO_PAGE_RIGHT = 6,
}

export enum PdfActionType {
  UNKNOWN = 0,
  GO_TO = 1,
  URI = 2,
}

export enum StampType {
  TEXT = 0,
  IMAGE = 1,
}

export enum SearchResultType {
  OK = 0,
  NO_RESULT = 1,
  END = 2,
}
