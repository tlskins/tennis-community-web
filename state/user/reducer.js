import { CACHE_USERS, SET_USER } from "./action"

const userInitialState = null
const usersCacheInitialState = {}


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

export function usersCacheReducer(
  state = usersCacheInitialState,
  action
) {
  switch (action.type) {
  case CACHE_USERS: {
    const newState = { ...state }
    action.payload.forEach( user => newState[user.id] = user)
    return newState
  }
  default:
    return state
  }
}
  