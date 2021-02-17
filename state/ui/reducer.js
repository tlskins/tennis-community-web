import {
  NEW_NOTIFICATION,
  REMOVE_NOTIFICATION,
  SET_LOGIN_FORM_VISIBLE,
} from "./action"

export const flashNotificationInitialState = []
export const navBarInitialState = { showLoginForm: "" }

export function navBarReducer(
  state = navBarInitialState,
  action
) {
  switch (action.type) {
  case SET_LOGIN_FORM_VISIBLE: {
    return { ...state, showLoginForm: action.payload }
  }
  default:
    return state
  }
}
  
export function flashNotificationReducer(
  state = flashNotificationInitialState,
  action
) {
  switch (action.type) {
  case NEW_NOTIFICATION: {
    if (state.find( note => note.id === action.payload.id)) {
      return state
    }
    return [
      ...state,
      action.payload,
    ]
  }
  case REMOVE_NOTIFICATION: {
    const idx = state.findIndex( note => note.id === action.payload)
    if (idx < 0) {
      return state
    }
    return [
      ...state.slice(0, idx),
      ...state.slice(idx+1, state.length),
    ]
  }
  default:
    return state
  }
}
  