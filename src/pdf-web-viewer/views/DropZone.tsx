import { h, Component } from 'hyperapp'

/** @internal */
export interface DropZoneProps {
  enabled: boolean
  onFileSelected(file: File): void
}

let allowDropTimer = 0

/** @internal */
export const DropZone: Component<DropZoneProps> = ({ enabled, onFileSelected }, children) => {

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    if (!enabled) {
      return
    }
    if (e.dataTransfer) {
      const dropContainer = e.currentTarget as Element
      const items = e.dataTransfer.items
      if (items && items.length === 1 && items[0].type === 'application/pdf') {
        dropContainer.classList.add('pwv-dropzone-dragover')
        clearTimeout(allowDropTimer)
        allowDropTimer = window.setTimeout(() => {
          dropContainer.classList.remove('pwv-dropzone-dragover')
        }, 150)
      }
    }
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer) {
      let pdfFile: File | null = null
      if (e.dataTransfer.items) {
        /* tslint:disable-next-line */
        for (let i = 0; i < 
          e.dataTransfer.items.length; i++) {
          const item = e.dataTransfer.items[i]
          if (item.kind === 'file' && item.type === 'application/pdf') {
            pdfFile = item.getAsFile()
            break
          }
        }
      } else {
        /* tslint:disable-next-line */
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          const file = e.dataTransfer.files[i]
          if (file.type === 'application/pdf') {
            pdfFile = file
            break
          }
        }
      }
      if (enabled && pdfFile !== null) {
        onFileSelected(pdfFile)
      }
    }
  }

  return (
    <div
      class="pwv-dropzone"
      ondragover={handleDragOver}
      ondrop={handleDrop}
    >
      {children}
      <div class="pwv-dropzone-drophere">
      </div>
    </div>
  )
}
