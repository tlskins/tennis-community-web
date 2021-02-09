import {
  NEW_NOTIFICATION,
  REMOVE_NOTIFICATION,
  SHOW_INVITE_FORM,
  TOGGLE_SHOW_NEW_USER,
} from "./action"

export const flashNotificationInitialState = [
  {
    id: 1,
    message: "test a lot of stuff and some things more and stupid longer stuff and whatever",
    buttons: [
      { buttonText: "do sone thing" },
      { buttonText: "do another thing" },
    ]
  },
  {
    id: 2,
    message: "test a lot of stuff and some things more and stupid longer stuff and whatever",
    buttons: [
      { buttonText: "do sone thing" },
      { buttonText: "do another thing" },
    ]
  },
]
export const navBarInitialState = { showNewUser: 0, showInviteForm: 0 }

export function navBarReducer(
  state = navBarInitialState,
  action
) {
  switch (action.type) {
  case TOGGLE_SHOW_NEW_USER: {
    return { ...state, showNewUser: state.showNewUser+1 }
  }
  case SHOW_INVITE_FORM: {
    return { ...state, showInviteForm: state.showInviteForm+1 }
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
  