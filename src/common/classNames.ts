
/** @internal */
export const classNames = (...args: any[]) => {
  const classes: string[] = []

  args.forEach(arg => {
    if (typeof arg === 'string') {
      classes.push(arg)
    } else if (typeof arg === 'object') {
      const keys = Object.keys(arg)
      keys.forEach(k => {
        if (arg[k]) {
          classes.push(k)
        }
      })
    }
  })
  return classes.join(' ')
}
