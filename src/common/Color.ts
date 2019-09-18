
/** @internal */
export class Color {
  private pR: number
  private pG: number
  private pB: number
  private pA: number

  constructor(color: string) {
    this.pR = 0
    this.pG = 0
    this.pB = 0
    this.pA = 0
    color = color.replace(/\s+/ig, '')
    if (color.indexOf('#') === 0) {
      if (color.length === 4) {
        this.pR = parseInt(color.substr(1, 1), 16)
        this.pG = parseInt(color.substr(2, 1), 16)
        this.pB = parseInt(color.substr(3, 1), 16)
        this.pA = 255
      } else if (color.length === 5) {
        this.pR = parseInt(color.substr(1, 1), 16)
        this.pG = parseInt(color.substr(2, 1), 16)
        this.pB = parseInt(color.substr(3, 1), 16)
        this.pA = parseInt(color.substr(4, 1), 16)
      } else if (color.length === 7) {
        this.pR = parseInt(color.substr(1, 2), 16)
        this.pG = parseInt(color.substr(3, 2), 16)
        this.pB = parseInt(color.substr(5, 2), 16)
        this.pA = 255
      } else if (color.length === 9) {
        this.pR = parseInt(color.substr(1, 2), 16)
        this.pG = parseInt(color.substr(3, 2), 16)
        this.pB = parseInt(color.substr(5, 2), 16)
        this.pA = parseInt(color.substr(7, 2), 16)
      } else {
        throw new Error('invalid color string: ' + color)
      }
    } else if (color.indexOf('rgb') === 0) {
      const values = color.substring(color.indexOf('(') + 1, color.indexOf(')')).split(',')
      if (values.length < 3 || values.length > 4) {
        throw new Error('invalid color string: ' + color)
      }
      this.pR = parseInt(values[0], 10)
      this.pG = parseInt(values[1], 10)
      this.pB = parseInt(values[2], 10)
      if (values.length === 4) {
        this.pA = Math.floor(parseFloat(values[3]) * 255)
      } else {
        this.pA = 255
      }
    } else {
      throw new Error('invalid color string: ' + color)
    }
  }

  public get r(): number {
    return this.pR
  }

  public set r(r: number) {
    this.pR = r
  }

  public get g(): number {
    return this.pG
  }

  public set g(g: number) {
    this.pG = g
  }

  public get b(): number {
    return this.pB
  }

  public set b(b: number) {
    this.pB = b
  }

  public get a(): number {
    return Math.floor(this.pA / 255 * 1000) / 1000
  }

  public darken(percent: number) {
    const f = 1 - Math.abs(percent / 100)
    const r = Math.floor(this.pR * f)
    const g = Math.floor(this.pG * f)
    const b = Math.floor(this.pB * f)
    this.pR = r > 255 ? 255 : r
    this.pG = g > 255 ? 255 : g
    this.pB = b > 255 ? 255 : b
  }

  public setOpacity(opacity: number) {
    this.pA = Math.floor(opacity * 255)
  }

  public toRgb() {
    return `rgb(${this.pR},${this.pG},${this.pB})`
  }

  public toRgba() {
    return `rgba(${this.pR},${this.pG},${this.pB},${this.a})`

  }

  public toHexRgb() {
    return `#${this.toHex(this.pR)}${this.toHex(this.pG)}${this.toHex(this.pB)}`
  }

  public toHexRgba() {
    return `#${this.toHex(this.pR)}${this.toHex(this.pG)}${this.toHex(this.pB)}${this.toHex(this.pA)}`
  }

  private toHex(value: number) {
    let h = value.toString(16)
    if (h.length === 1) {
      h = '0' + h
    }
    return h
  }

}
