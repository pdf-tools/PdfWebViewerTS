import { ActionsType } from 'hyperapp'

/** @internal */
export interface PasswordFormState {
  password: string
  passwordRequiredError: boolean
  invalidPasswordError: boolean
}

/** @internal */
export const state: PasswordFormState = {
  password: '',
  passwordRequiredError: false,
  invalidPasswordError: false,
}

/** @internal */
export interface PasswordFormActions {
  clear(): PasswordFormState
  updatePassword(breakPoint: string): PasswordFormState
  validateForm(): PasswordFormState
  setInvalidPasswordError(): PasswordFormState
}

/** @internal */
export const actions: ActionsType<PasswordFormState, PasswordFormActions> = {
  clear: () => $state => ({
    password: '',
    passwordRequiredError: false,
    invalidPasswordError: false,
  }),
  updatePassword: (password: string) => $state => {
    return {
      ...$state,
      password,
    }
  },
  validateForm: () => $state => {
    return {
      ...$state,
      invalidPasswordError: false,
      passwordRequiredError: $state.password === '',
    }
  },
  setInvalidPasswordError: () => $state => ({
    ...$state,
    invalidPasswordError: true,
  }),
}
