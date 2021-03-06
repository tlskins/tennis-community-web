import { CACHE_USERS, SET_USER, SET_CONFIRMATION } from "./action"
import { LOG_OUT } from "../store"

export const userInitialState = null
export const usersCacheInitialState = {}
export const confirmationInitialState = null

export function userReducer(
  state = userInitialState,
  action
) {
  switch (action.type) {
  case SET_USER: {
    const { payload } = action
    return payload
  }
  case LOG_OUT: {
    return userInitialState
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
  case LOG_OUT: {
    return { ...usersCacheInitialState }
  }
  default:
    return state
  }
}
  
export function confirmationReducer(
  state = confirmationInitialState,
  action
) {
  switch (action.type) {
  case SET_CONFIRMATION: {
    const { payload } = action
    return payload
  }
  case LOG_OUT: {
    return confirmationInitialState
  }
  default:
    return state
  }
}
