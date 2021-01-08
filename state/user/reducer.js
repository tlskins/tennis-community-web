import { SET_USER } from "./action"

const userInitialState = null
  

export function userReducer(
  state = userInitialState,
  action
) {
  switch (action.type) {
  case SET_USER: {
    const { payload } = action
    return payload
  }
  default:
    return state
  }
}
  