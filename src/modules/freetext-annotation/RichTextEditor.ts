import { Color } from '../../common/Color'
import { convertPdfToCssPixel, roundToTwo } from '../../common/Tools'

/** @internal */
export interface ExecCommandArgs {
  cmd: string
  args?: any
}

/** @internal */
export interface RichTextEditorContent {
  richText: string
  content: string
  backgroundColor: string | null
  // borderColor: string | null
  borderWidth: number
  fontName: string | null
  fontColor: string | null
  fontSizeCSS: string | null
}

/** @internal */
export class RichTextEditor {
  private element: HTMLElement
  private editorElement: HTMLIFrameElement
  private editorDocument: Document
  private content: RichTextEditorContent
  private hasRangeSelection: boolean = false

  constructor(element: HTMLElement, content: RichTextEditorContent) {
    // bind events
    this.executeCommand = this.executeCommand.bind(this)
    this.handleOnPaste = this.handleOnPaste.bind(this)
    this.handleSelectionChange = this.handleSelectionChange.bind(this)
    this.content = content

    // create elements
    this.element = element
    this.element.style.background = 'white'
    this.element.classList.add('pwv-freetexteditor')

    this.editorElement = document.createElement('iframe')
    this.editorElement.width = '100%'
    this.editorElement.height = '100%'
    this.editorElement.frameBorder = '0'
    this.editorElement.style.transformOrigin = '0 0'

    this.element.appendChild(this.editorElement)

    this.editorDocument = this.editorElement.contentDocument as Document
    this.editorDocument.open()
    this.editorDocument.close()

    // set content
    let text = content.richText.replace(/<\/p>\s*<br\s*\/>/gi, '</div>')
    // remove cr
    text = text.replace(/\r?\n|\r/, '')
    text = text.replace(/<p\s*([^>]*)>/gi, '<div $1>')

    const m = /.*(<body.*<\/body>).*/gi.exec(text)

    /* tslint:disable:max-line-length */
    this.editorDocument.body.outerHTML =
      m && m.length > 1
        ? m[1]
        : '<?xml version="1.0"?><body xmlns="http://www.w3.org/1999/xhtml" xmlns:xfa="http://www.xfa.org/schema/xfa-data/1.0/" xfa:APIVersion="Acrobat:19.12.0" xfa:spec="2.0.2"><p></p></body>'
    this.editorDocument.body.style.fontFamily = content.fontName as string
    this.editorDocument.body.style.color = content.fontColor as string
    this.editorDocument.body.style.fontSize = content.fontSizeCSS as string
    this.editorDocument.body.style.backgroundColor = content.backgroundColor as string
    this.editorDocument.body.style.borderColor = content.fontColor as string
    this.editorDocument.body.style.borderStyle = 'solid'
    this.editorDocument.body.style.borderWidth = `${content.borderWidth}px`
    this.editorDocument.body.style.padding = '4px'
    this.editorDocument.body.style.margin = '0'
    this.editorDocument.body.style.height = '100%'
    this.editorDocument.body.style.boxSizing = 'border-box'

    this.editorDocument.designMode = 'on'
    this.editorDocument.execCommand('defaultParagraphSeparator', false, 'div')

    // add event listeners
    this.editorDocument.addEventListener('paste', this.handleOnPaste, false)
    this.editorDocument.addEventListener('selectionchange', this.handleSelectionChange, false)
    this.editorDocument.addEventListener(
      'mousewheel',
      (e: Event) => {
        e.preventDefault()
        e.cancelBubble = true
      },
      false,
    )
  }

  public setZoom(zoom: number) {
    this.editorElement.style.transform = `scale(${zoom})`
    this.editorElement.width = this.element.clientWidth / zoom + 'px'
    this.editorElement.height = this.element.clientHeight / zoom + 'px'
  }

  public getEditorValues(): RichTextEditorContent {
    const richText = '<?xml version="1.0"?>' + this.cleanupRichText(this.editorDocument.body.outerHTML)
    const pureContent = this.getContent(richText)
    return {
      ...this.content,
      content: pureContent ? pureContent : '',
       backgroundColor: this.editorDocument.body.style.backgroundColor,
       fontColor: this.editorDocument.body.style.color,
       fontName: this.editorDocument.body.style.fontFamily,
       fontSizeCSS: this.editorDocument.body.style.fontSize,
      richText,
    }
  }

  public executeCommand(cmd: ExecCommandArgs) {
    switch (cmd.cmd) {
      case 'setFont': {
        this.content.fontName = cmd.args
        this.editorDocument.body.style.fontFamily = cmd.args as string
        break
      }
      case 'setFontColor': {
        this.content.fontColor = cmd.args
        this.editorDocument.body.style.color = cmd.args as string
        this.editorDocument.body.style.borderColor = cmd.args as string
        break
      }
      case 'setBorderWidth': {
        this.content.borderWidth = cmd.args
        this.editorDocument.body.style.borderWidth = `${cmd.args}px`
        break
      }
      case 'setFontSize': {
        const size = convertPdfToCssPixel(cmd.args as string)
        this.content.fontSizeCSS = size
        this.editorDocument.body.style.fontSize = size
        break
      }
      case 'setFillColor': {
        this.content.backgroundColor = cmd.args
        this.editorDocument.body.style.backgroundColor = cmd.args as string
        break
      }
      default: {
        this.editorDocument.execCommand(cmd.cmd, false, cmd.args)
      }
    }
  }

  private cleanupRichText(richText: string) {
    let text = richText.replace(/\<\/div\>/gi, '</p><br/>')
    const underline = /<u>/gi
    const found = text.match(underline) // find underline tags
    if (found && found.length > 0) {
      // if they exist remove them
      text = text.replace(/<\/?u>/gi, '')
      text = text.replace(/style=\"/gi, 'style="text-decoration:underline') // set text-decoration instead
    }
    text = text.replace(/\<div\s*([^>]*)\>/gi, '<p $1>') // replace <div (.*)> with <p $1>
    text = text.replace(/\<br\>/gi, '') // remove <br>
    text = text.replace(/\&nbsp\;/gi, ' ') // remove non breaking space
    text = text.replace(/padding\:.*?\;/gi, '') // remove: padding:...;
    text = text.replace(/margin\:.*?\;/gi, '') // remove: margin:...;
    text = text.replace(/background-color\:.*?\;/gi, '') // remove background-color:...;
    text = text.replace(/border-color\:.*?\;/gi, '') // remove background-color:...;
    text = text.replace(/border-style\:.*?\;/gi, '') // remove background-color:...;
    text = text.replace(/border-width\:.*?\;/gi, '') // remove background-color:...;
    text = text.replace(/height\:.*?\;/gi, '') // remove background-color:...;
    text = text.replace(/box-sizing\:.*?\;/gi, '') // remove background-color:...;
    text = text.replace(/\:\s*/gi, ':') // remove spaces after :
    text = text.replace(/\;\s*/gi, ';') // remove spaces after ;
    text = text.replace(/font-size\:(\d*\.?\d+)px\;/gi, (_, size) => {
      // calculate font size in pdf units
      size = roundToTwo((size / 96) * 72)
      return 'font-size:' + size + 'pt'
    })
    text = text.replace(/rgb\((.+?)\)/gi, (rgb) => {
      return new Color(rgb).toHexRgb()
    })
    // remove spaces within the styles tag
    return text.replace(/style="(.*?)"/gi, styles => {
      return styles.replace(/\s*/gi, '')
    })
  }

  private getContent(richText: string) {
    const parser = new DOMParser()
    const node = parser.parseFromString(richText, 'text/html').documentElement
    let nodes = node ? (node.querySelector('*') as Node) : null
    if (nodes) {
      while (true) {
        nodes = nodes.nextSibling
        if (nodes) {
          if (nodes.nodeName.toLocaleLowerCase() === 'body') {
            return (nodes as HTMLElement).innerText
          }
        } else {
          break
        }
      }
    }
    return null
  }

  private handleOnPaste(e: Event) {
    e.preventDefault()
    const text = (e as ClipboardEvent).clipboardData.getData('text/plain')
    if (text) {
      this.executeCommand({
        cmd: 'insertText',
        args: text,
      })
    }
  }

  private handleSelectionChange(e: Event) {}
}
