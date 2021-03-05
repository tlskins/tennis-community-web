import {
  NEW_NOTIFICATION,
  REMOVE_NOTIFICATION,
  SET_LOGIN_FORM_VISIBLE,
  SET_HEAD,
} from "./action"

export const flashNotificationInitialState = []
export const navBarInitialState = { showLoginForm: "" }
export const headInitialState = {
  title: "Hive Tennis",
  desc: "Automatically cut swings from your tennis videos! Hive Tennis is a platform to quickly cut, analyze, and get feedback on your tennis!",
  img: "https://d198sck6ekbnwc.cloudfront.net/homepage-bg.jpg",
}

export function headReducer(
  state = headInitialState,
  action
) {
  switch (action.type) {
  case SET_HEAD: {
    console.log("sethead", action.payload)
    return { ...state, ...action.payload }
  }
  default:
    return state
  }
}

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
  