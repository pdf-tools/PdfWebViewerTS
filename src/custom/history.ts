import { Annotation } from '../pdf-viewer-api'
import { createPdfTime } from '../common/Tools'

// tslint:disable-next-line: max-line-length
export function addHistoryEntry(annotation: Annotation, type: 'create' | 'edit' | 'delete' | 'lock' | 'unlock', author: string | undefined, content?: string | null, subject?: string | null) {
  if (!annotation.custom) {
    annotation.custom = []
  }

  if (type === 'create') {
    let history = annotation.custom
    history = []
    history.push({Type: '/Create', D: createPdfTime(), T: `(${annotation.originalAuthor})`})
    annotation.custom = history
  } else if (type === 'edit') {
    const params = []
    if (annotation.content !== content) {
      params.push('/Contents')
      params.push(content)
    }
    if (annotation.subject !== subject) {
      params.push('/Subj')
      params.push(subject)
    }
    if (params.length > 0) {
      params.push('/T')
      params.push(author)
      annotation.custom.push({Type: '/Edit', D: createPdfTime(), Parms: params, T: author})
    }
  } else if (type === 'lock' || type === 'unlock') {
    annotation.custom.push({Type: type === 'lock' ? '/Lock' : '/Unlock', D: createPdfTime(), T: author })
  } else if (type === 'delete') {
    annotation.custom.push({Type: '/Delete', D: createPdfTime(), T: author})
    if (annotation.popup) {
      annotation.popup.isOpen = false
    }
  }
}
