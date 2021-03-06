import { SET_RECENT_UPLOADS } from "./action"
import { LOG_OUT } from "../store"

export const recentUploadsInitialState = null

export function recentUploadsReducer(
  state = recentUploadsInitialState,
  action
) {
  switch (action.type) {
  case SET_RECENT_UPLOADS: {
    const { payload } = action  
    return payload
  }
  case LOG_OUT: {
    return recentUploadsInitialState
  }
  default:
    return state
  }
}
  