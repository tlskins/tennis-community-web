import { post, put, del } from "../api/rest"
import { setUser, cacheUsers } from "../../state/user/action"
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

    if (resp.data?.length > 0) {
      dispatch(cacheUsers(resp.data))
    }

    return resp.data
  }
  catch( err ) {
    HandleError(dispatch, err)
    return []
  }
}

export const SendFriendRequest = (dispatch) => async ({ id }) => {
  try {
    await post(`/users/friends/${id}`) 

  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
  return true
}

export const AcceptFriendRequest = (dispatch) => async ({ requestId, accept }) => {
  try {
    const resp = await post(`/users/friends/requests/${requestId}`, { accept })
    dispatch(setUser(resp.data))
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
  return true
}

export const Unfriend = (dispatch) => async ({ friendId }) => {
  console.log("unfriend coord")
  try {
    await del(`/users/friends/${friendId}`)
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
  return true
}