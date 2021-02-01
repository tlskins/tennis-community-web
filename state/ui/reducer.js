import { NEW_NOTIFICATION, REMOVE_NOTIFICATION, TOGGLE_SHOW_NEW_USER } from "./action"

export const flashNotificationInitialState = [
  {
    id: "1",
    message: "Test Message about something stupid",
    buttons: [
      {
        buttonText: "view something",
        callback: () => console.log("1"),
      },
      {
        buttonText: "ignore something",
        callback: () => console.log("2"),
      }
    ]
  }
]
export const navBarInitialState = { showNewUser: 0 }

export function navBarReducer(
  state = navBarInitialState,
  action
) {
  switch (action.type) {
  case TOGGLE_SHOW_NEW_USER: {
    return { ...state, showNewUser: state.showNewUser+1 }
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
  