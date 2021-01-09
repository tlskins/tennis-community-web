import { post, put } from "../api/rest"
import { setUser } from "../../state/user/action"
import { HandleError } from "./errors"

export const SearchFriends = (dispatch) => async ({ search, ids, limit, offset }) => {
  try {
    const params = {}
    if (search) {
      params.search = search
    }
    if (ids) {
      params.ids = ids
    }
    if (limit) {
      params.limit = limit
    }
    if (offset) {
      params.offset = offset
    }
    const resp = await put("/users/friends/search", params)
    return resp.data
  }
  catch( err ) {
    HandleError(dispatch, err)
    return []
  }
}

export const SendFriendRequest = (dispatch) => async ({ friendId }) => {
  try {
    await post(`/users/friends/${friendId}`)
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
  return true
}

export const AcceptFriendRequest = (dispatch) => async ({ requestId }) => {
  try {
    const resp = await post(`/users/friends/requests/${requestId}`)
    dispatch(setUser(resp.data))
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
  return true
}

export const Unfriend = (dispatch) => async ({ friendId }) => {
  try {
    await delete(`users/friends/${friendId}`)
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
  return true
}