export interface SupportedLanguages {
  en: string,
  de: string,
  fr: string,
}

/** @internal */
export interface TextResources {
  [key: string]: SupportedLanguages,
}

let currentLanguage: keyof SupportedLanguages = 'en'
let translations: TextResources = {}

/** @internal */
export const translationManager = {
  setLanguage: (lang: keyof SupportedLanguages) => {
    currentLanguage = lang
  },
  addTranslations: (res: TextResources) => {
    translations = {...translations, ...res }
  },
  getText: (key: string) => {
    const res = translations[key]
    if (!res) {
      throw new Error('Translation not found: ' + key)
    }
    return res[currentLanguage]
  },
}
