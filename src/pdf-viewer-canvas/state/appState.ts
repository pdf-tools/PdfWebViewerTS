
/** @internal */
export type ActionResult<State> = Partial<State> | Promise<any> | null | void

/** @internal */
export type ActionType<State, Actions> = (data?: any) =>
  | ((state: State, actions: Actions) => ActionResult<State>)
  | ActionResult<State>

/** @internal */
export type ActionsType<State, Actions> = {
  [P in keyof Actions]:
  | ActionType<State, Actions>
  | ActionsType<any, Actions[P]>
}

/** @internal */
export const appState = <S, A>(state: S, actions: ActionsType<S, A>): A => {
  const clone = (target: any, source?: any) => {
    const out: any = {}

    for (const field of Object.keys(target)) {
      out[field] = target[field]
    }

    if (source) {
      for (const field of Object.keys(source)) {
        out[field] = source[field]
      }
    }

    return out
  }

  const getPartialState = (path: string[], source: any) => {
    let i = 0
    while (i < path.length) {
      source = source[path[i++]]
    }
    return source
  }

  function setPartialState(path: string[], value: any, source: any) {
    const target: any = {}
    if (path.length) {
      target[path[0]] =
        path.length > 1
          ? setPartialState(path.slice(1), value, source[path[0]])
          : value
      return clone(source, target)
    }
    return value
  }

  const wireStateToActions = (path: string[], wState: any, wActions: any) => {
    for (const field of Object.keys(wActions)) {
      if (typeof wActions[field] === 'function') {
        ((key, action) => {
          wActions[key] = (data: any) => {
            let result = action(data)
            if (typeof result === 'function') {
              result = result(getPartialState(path, globalState), wActions)
            }

            /* tslint:disable-next-line */
            if (result && result !== (wState = getPartialState(path, globalState)) && !result.then) {
              globalState = setPartialState(path, clone(wState, result), globalState)
            }
            return result
          }
        })(field, (wActions as any)[field])
      } else {
        wireStateToActions(
          path.concat(field),
          (wState[field] = clone(wState[field])),
          (wActions[field] = clone(wActions[field])),
        )
      }
    }
    return wActions
  }

  let globalState = clone(state)
  const wiredActions = wireStateToActions([], globalState, clone(actions))

  return wiredActions
}
