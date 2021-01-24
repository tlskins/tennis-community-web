import { NEW_NOTIFICATION, REMOVE_NOTIFICATION } from "./action"
import Moment from "moment"

const flashNotificationInitialState = []

export function flashNotificationReducer(
  state = flashNotificationInitialState,
  action
) {
  switch (action.type) {
  case NEW_NOTIFICATION: {
    return [
      ...state,
      { id: Moment().format(), ...action.payload }
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
  