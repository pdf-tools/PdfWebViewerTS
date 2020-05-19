import { PdfViewerCanvasOptions } from "./PdfViewerCanvasOptions";

export class UserSettings {
    private toolSettings: any
    
    constructor() {
        const settings = localStorage.getItem('PDFToolsAG.ViewerSettings')
        this.toolSettings = settings ? JSON.parse(settings) : {}
        this.save = this.save.bind(this)
        this.getItem = this.getItem.bind(this)
        this.setItem = this.setItem.bind(this)
    }

    private save(): void {
        const settings = JSON.stringify(this.toolSettings)
        localStorage.setItem('PDFToolsAG.ViewerSettings', settings)
    }

    public getItem<T>(key: keyof PdfViewerCanvasOptions, defaultValue: T): T {
        if (this.toolSettings.hasOwnProperty(key)) {
            return this.toolSettings[key]
        } 
        return defaultValue as T
    }

    public setItem(key: keyof PdfViewerCanvasOptions, value: string | number): void {
        this.toolSettings[key] = value
        this.save()
    }
}