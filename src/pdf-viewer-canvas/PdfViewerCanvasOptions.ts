import { SupportedLanguages } from '../common/TranslationManager'
import { StampAnnotationColor } from '../pdf-viewer-api/enums'
import { CanvasModuleClass } from '../modules/CanvasModule'
import { TextAnnotationModule } from '../modules/text-annotation/TextAnnotationModule'
import { InkAnnotationModule } from '../modules/ink-annotation/InkAnnotationModule'
import { FreetextAnnotationModule } from '../modules/freetext-annotation/FreetextAnnotationModule'
import { HighlightAnnotationModule } from '../modules/highlight-annotation/HighlightAnnotationModule'
import { StampAnnotationModule } from '../modules/stamp-annotation/StampAnnotationModule'
import { PopupModule } from '../modules/popup/PopupModule'
import { UserSettings } from './UserSettings'

export interface StampSetting {
  name: string,
  color: StampAnnotationColor,
  pdfStampName?: string,
}

interface Fonts {
 Helvetica: string
 Times: string
 Courier: string
 Symbol: string
 ZapfDingbats: string
}

export interface PdfViewerCanvasCoreOptions {
  [key: string]: any,
  language: keyof SupportedLanguages,
  annotationBarPosition: 'top' | 'left' | 'right' | 'bottom'
  highlightColors: string[]
  foregroundColors: string[]
  backgroundColors: string[]
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
  [key: string]: any,
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
  defaultFontFamily: keyof Fonts
  defaultFontSize: number
  defaultBorderSize: number
  defaultStampWidth: number
  defaultStampText: string
  ms_custom: boolean
}

export class PdfViewerOptions {
  private options: PdfViewerCanvasOptions
  private storage: UserSettings
  constructor(_options?: Partial<PdfViewerCanvasOptions>) {
    this.options = {...PdfViewerCanvasDefaultOptions, ..._options}
    this.storage = new UserSettings()
  }

  get language(): keyof SupportedLanguages {
    return this.options.language
  }

  get annotationBarPosition(): 'top' | 'left' | 'right' | 'bottom' {
    return this.options.annotationBarPosition
  }

  get highlightColors(): string[] {
    return this.options.highlightColors
  }
  
  get foregroundColors(): string[] {
    return this.options.foregroundColors
  }

  get backgroundColors(): string[] {
    return this.options.backgroundColors
  }

  get fontSizes(): number[] {
    return this.options.fontSizes
  }

  get highlightOpacity(): number {
    return this.options.highlightOpacity
  }

  get textSelectionColor(): string {
    return this.options.textSelectionColor
  }
  
  get fontFamilies(): string[] {
    return this.options.fontFamilies
  }
  
  get searchMatchColor(): string {
    return this.options.searchMatchColor
  }

  get author(): string | undefined {
    return this.options.author
  }

  get defaultFontFamily(): keyof Fonts {
    return this.options.defaultFontFamily
  }

  get stamps(): StampSetting[] {
    return this.options.stamps
  }

  get modules(): CanvasModuleClass[] | undefined {
    return this.options.modules
  }
  
  get promptOnUnsavedChanges(): boolean {
    return this.options.promptOnUnsavedChanges
  }

  get defaultHighlightColor(): string {
    return this.options.defaultHighlightColor
  }

  get highlightAnnotationColor(): string {
    return this.storage.getItem<string>('highlightAnnotationColor', this.defaultHighlightColor)
  }

  set highlightAnnotationColor(color: string) {
    this.storage.setItem('highlightAnnotationColor', color)
  }

  get defaultStampWidth(): number {
    return this.defaultStampWidth
  }

  get stampText(): string {
    return this.storage.getItem('stampText', this.options.defaultStampText)
  }

  set stampText(text: string) {
    this.storage.setItem('stampText', text)
  }


  get freetextFontSize(): number {
    return this.storage.getItem<number>('freetextFontSize', this.options.defaultFontSize)
  }

  set freetextFontSize(size: number) {
    this.storage.setItem('freetextFontSize', size)
  }

  get defaultFontSize(): number {
    return this.options.defaultFontSize
  }

  get freetextFontColor(): string {
    return this.storage.getItem<string>('freetextFontColor', this.options.defaultForegroundColor)
  }

  set freetextFontColor(color: string) {
    this.storage.setItem('freetextFontColor', color)
  }

  get stickyNoteColor(): string {
    return this.storage.getItem<string>('stickyNoteColor', this.options.defaultHighlightColor)
  }

  set stickyNoteColor(color: string) {
    this.storage.setItem('stickyNoteColor', color)
  }

  get freetextFontFamily(): string {
    return this.storage.getItem<keyof Fonts>('freetextFontFamily', this.options.defaultFontFamily)
  }

  set freetextFontFamily(font: string) {
    this.storage.setItem('freetextFontFamily', font)
  }

  get defaultBorderSize(): number {
    return this.options.defaultBorderSize
  }

  get freetextBorderSize(): number {
    return this.storage.getItem<number>('freetextBorderSize', this.options.defaultBorderSize)
  }

  get freetextBgColor(): string {
    return this.storage.getItem<string>('freetextBgColor', this.options.defaultBackgroundColor)
  }

  set freetextBgColor(color: string) {
    this.storage.setItem('freetextBgColor', color)
  }

  get inkColor(): string {
    return this.storage.getItem<string>('inkColor', this.options.defaultForegroundColor)
  }

  set inkColor(color: string) {
    this.storage.setItem('inkColor', color)
  }

  get inkWidth(): number {
    return this.storage.getItem<number>('inkWidth', this.options.defaultBorderSize)
  }

  set inkWidth(width: number) {
    this.storage.setItem('inkWidth', width)
  }

  get inkOpacity(): number {
    return this.storage.getItem<number>('inkOpacity', 100)
  }

  set inkOpacity(opacity: number) {
    this.storage.setItem('inkOpacity', opacity)
  }

  get ms_custom(): boolean {
    return this.options.ms_custom
  }
}

export const PdfViewerCanvasDefaultOptions: PdfViewerCanvasOptions = {
  language: 'en',
  annotationBarPosition: 'left',
  highlightColors: ['#2ADB1A', '#FFEA02', '#FF7F1F', '#FF2882', '#008AD1'],
  foregroundColors: ['#323232', '#FFFFFF', '#FFEA02', '#2ADB1A', '#0066CC', '#D82F32'],
  backgroundColors: ['#FFFFFF', '#FCF5E2', '#323232', '#FFEA02', '#D82F32', '#0066CC'],
  defaultHighlightColor: '#FFEA02',
  defaultBackgroundColor: '#FCF5E2',
  defaultForegroundColor: '#323232',
  defaultFontFamily: 'Helvetica',
  fontSizes: [9, 10, 12, 14, 16, 18, 20, 24],
  defaultFontSize: 12,
  defaultBorderSize: 1,
  highlightOpacity: .5,
  textSelectionColor: '#006395',
  fontFamilies: ['Helvetica', 'Times', 'Courier', 'Symbol', 'ZapfDingbats'],
  searchMatchColor: '#3ABCFF',
  stamps: [
    { name: 'stamptext.approved', color : StampAnnotationColor.GREEN, pdfStampName: 'SBApproved' },
    { name: 'stamptext.notApproved', color : StampAnnotationColor.RED, pdfStampName: 'SBNotApproved' },
    { name: 'stamptext.draft', color : StampAnnotationColor.BLUE, pdfStampName: 'SBDraft' },
    { name: 'stamptext.final', color : StampAnnotationColor.GREEN, pdfStampName: 'SBFinal' },
    { name: 'stamptext.completed', color : StampAnnotationColor.GREEN, pdfStampName: 'SBCompleted' },
    { name: 'stamptext.confidential', color : StampAnnotationColor.BLUE, pdfStampName: 'SBConfidential' },
    { name: 'stamptext.forPublic', color : StampAnnotationColor.BLUE, pdfStampName: 'SBForPublicRelease' },
    { name: 'stamptext.notForPublic', color : StampAnnotationColor.BLUE, pdfStampName: 'SBNotForPublicRelease' },
    { name: 'stamptext.void', color : StampAnnotationColor.RED, pdfStampName: 'SBVoid' },
    { name: 'stamptext.forComment', color : StampAnnotationColor.BLUE, pdfStampName: 'SBForComment' },
    { name: 'stamptext.preliminaryResults', color : StampAnnotationColor.BLUE, pdfStampName: 'SBPreliminaryResults' },
    { name: 'stamptext.informationOnly', color : StampAnnotationColor.BLUE, pdfStampName: 'SBInformationOnly' },
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
