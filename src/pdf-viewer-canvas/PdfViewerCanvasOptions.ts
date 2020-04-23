import { SupportedLanguages } from '../common/TranslationManager'
import { StampAnnotationColor } from '../pdf-viewer-api/enums'
import { CanvasModuleClass } from '../modules/CanvasModule'
import { TextAnnotationModule } from '../modules/text-annotation/TextAnnotationModule'
import { InkAnnotationModule } from '../modules/ink-annotation/InkAnnotationModule'
import { FreetextAnnotationModule } from '../modules/freetext-annotation/FreetextAnnotationModule'
import { HighlightAnnotationModule } from '../modules/highlight-annotation/HighlightAnnotationModule'
import { StampAnnotationModule } from '../modules/stamp-annotation/StampAnnotationModule'
import { PopupModule } from '../modules/popup/PopupModule'
import { ShapeAnnotationModule } from '../modules/shape-annotations/ShapeAnnotationModule'

export interface StampSetting {
  name: string
  color: StampAnnotationColor
  pdfStampName?: string
}

interface Fonts {
  Helvetica: string
  Times: string
  Courier: string
  Symbol: string
  ZapfDingbats: string
}

export interface PdfViewerCanvasCoreOptions {
  [key: string]: any
  language?: keyof SupportedLanguages
  annotationBarPosition?: 'top' | 'left' | 'right' | 'bottom'
  highlightColors: string[]
  foregroundColors: string[]
  backgroundColors: string[]
  strokeColors: string[]
  strokeWidths: number[]
  fillColors: string[]
  fontSizes: number[]
  highlightOpacity: number
  textSelectionColor: string
  fontFamilies: string[]
  searchMatchColor: string
  author?: string
  stamps: StampSetting[]
  modules?: CanvasModuleClass[]
  promptOnUnsavedChanges: boolean
}

export interface PdfViewerCanvasOptions extends PdfViewerCanvasCoreOptions {
  [key: string]: any
  defaultHighlightAnnotationColor?: string
  defaultFreetextBgColor?: string
  defaultFreetextFontColor?: string
  defaultFreetextFontFamily?: keyof Fonts
  defaultFreetextFontSize?: number
  defaultFreetextBorderSize?: number
  defaultInkColor?: string
  defaultStickyNoteColor?: string
  defaultBackgroundColor: string
  defaultForegroundColor: string
  defaultHighlightColor: string
  defaultFontFamiliy: keyof Fonts
  defaultFontSize: number
  defaultBorderSize: number
  defaultStampWidth: number
  defaultStampText: string
  defaultStrokeColor: string
  defaultStrokeWidth: number
  defaultFillColor: string
  ms_custom: boolean
}

export const PdfViewerCanvasDefaultOptions: PdfViewerCanvasOptions = {
  language: 'en',
  annotationBarPosition: 'left',
  highlightColors: ['#2ADB1A', '#FFEA02', '#FF7F1F', '#FF2882', '#008AD1'],
  foregroundColors: ['#323232', '#FFFFFF', '#FFEA02', '#2ADB1A', '#0066CC', '#D82F32'],
  backgroundColors: ['#FFFFFF', '#FCF5E2', '#323232', '#FFEA02', '#D82F32', '#0066CC'],
  strokeColors: ['#323232', '#FFFFFF', '#FFEA02', '#2ADB1A', '#0066CC', '#D82F32'],
  fillColors: ['#FFFFFF', '#FCF5E2', '#323232', '#FFEA02', '#D82F32', '#0066CC'],
  defaultStrokeColor: '#323232',
  strokeWidths: [0, 1, 2, 3, 5, 8, 13, 21],
  defaultStrokeWidth: 1,
  defaultFillColor: '#FFFFFF',
  defaultHighlightColor: '#FFEA02',
  defaultBackgroundColor: '#FCF5E2',
  defaultForegroundColor: '#323232',
  defaultFontFamiliy: 'Helvetica',
  fontSizes: [9, 10, 12, 14, 16, 18, 20, 24],
  defaultFontSize: 12,
  defaultBorderSize: 1,
  highlightOpacity: 0.5,
  textSelectionColor: '#006395',
  fontFamilies: ['Helvetica', 'Times', 'Courier', 'Symbol', 'ZapfDingbats'],
  searchMatchColor: '#3ABCFF',
  stamps: [
    { name: 'stamptext.approved', color: StampAnnotationColor.GREEN, pdfStampName: 'SBApproved' },
    { name: 'stamptext.notApproved', color: StampAnnotationColor.RED, pdfStampName: 'SBNotApproved' },
    { name: 'stamptext.draft', color: StampAnnotationColor.BLUE, pdfStampName: 'SBDraft' },
    { name: 'stamptext.final', color: StampAnnotationColor.GREEN, pdfStampName: 'SBFinal' },
    { name: 'stamptext.completed', color: StampAnnotationColor.GREEN, pdfStampName: 'SBCompleted' },
    { name: 'stamptext.confidential', color: StampAnnotationColor.BLUE, pdfStampName: 'SBConfidential' },
    { name: 'stamptext.forPublic', color: StampAnnotationColor.BLUE, pdfStampName: 'SBForPublicRelease' },
    { name: 'stamptext.notForPublic', color: StampAnnotationColor.BLUE, pdfStampName: 'SBNotForPublicRelease' },
    { name: 'stamptext.void', color: StampAnnotationColor.RED, pdfStampName: 'SBVoid' },
    { name: 'stamptext.forComment', color: StampAnnotationColor.BLUE, pdfStampName: 'SBForComment' },
    { name: 'stamptext.preliminaryResults', color: StampAnnotationColor.BLUE, pdfStampName: 'SBPreliminaryResults' },
    { name: 'stamptext.informationOnly', color: StampAnnotationColor.BLUE, pdfStampName: 'SBInformationOnly' },
  ],
  defaultStampWidth: 120,
  defaultStampText: 'stamptext.approved',
  promptOnUnsavedChanges: false,
  modules: [
    PopupModule,
    TextAnnotationModule,
    HighlightAnnotationModule,
    FreetextAnnotationModule,
    InkAnnotationModule,
    StampAnnotationModule,
    ShapeAnnotationModule,
  ],
  ms_custom: false,
}

export interface OptionsToVerifyInterface {
  [key: string]: string
  defaultHighlightAnnotationColor: string
  defaultFreetextBgColor: string
  defaultFreetextFontColor: string
  defaultFreetextFontFamily: string
  defaultFreetextFontSize: string
  defaultInkColor: string
  defaultStickyNoteColor: string
  defaultBackgroundColor: string
  defaultForegroundColor: string
  defaultHighlightColor: string
  defaultFontSize: string
}
export const OptionsToVerify: OptionsToVerifyInterface = {
  defaultHighlightAnnotationColor: 'highlightColors',
  defaultFreetextBgColor: 'backgroundColors',
  defaultFreetextFontColor: 'foregroundColors',
  defaultFreetextFontFamily: 'fontFamilies',
  defaultFreetextFontSize: 'fontSizes',
  defaultInkColor: 'foregroundColors',
  defaultStickyNoteColor: 'highlightColors',
  defaultBackgroundColor: 'backgroundColors',
  defaultForegroundColor: 'foregroundColors',
  defaultHighlightColor: 'highlightColors',
  defaultFontSize: 'fontSizes',
}

export interface ColorPaletteInterface {
  [key: string]: string
  highlightColors: string
  backgroundColors: string
  foregroundColors: string
}

export const ColorPaletteMap: ColorPaletteInterface = {
  highlightColors: 'defaultHighlightColor',
  backgroundColors: 'defaultBackgroundColor',
  foregroundColors: 'defaultForegroundColor',
}
