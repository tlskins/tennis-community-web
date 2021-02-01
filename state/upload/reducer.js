import { SET_RECENT_UPLOADS } from "./action"

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
  default:
    return state
  }
}
  