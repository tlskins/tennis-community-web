import { get, put } from "../api/rest"
import { HandleError } from "./errors"


export const UpdateCommentFlag = (dispatch) => async ({ id, resolved }) => {
  try {
    await put(`/moderation/comments/${id}`, { resolved })
    return true
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
}

export const UpdateAlbumFlag = (dispatch) => async ({ id, resolved }) => {
  try {
    await put(`/moderation/albums/${id}`, { resolved })
    return true
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
}

export const GetRecentFlaggedComments = (dispatch) => async ({ start, end, resolved, limit, offset }) => {
  try {
    const response = await get("/moderation/comments", { start, end, resolved, limit, offset })
    return response.data
  }
  catch( err ) {
    HandleError(dispatch, err)
    return []
  }
}

export const GetRecentFlaggedAlbums = (dispatch) => async ({ start, end, resolved, limit, offset }) => {
  try {
    const response = await get("/moderation/albums", { start, end, resolved, limit, offset })
    return response.data
  }
  catch( err ) {
    HandleError(dispatch, err)
    return []
  }
}

export const GetRecentUsers = (dispatch) => async ({ start, end, limit, offset }) => {
  try {
    const response = await get("/users/recent", { start, end, limit, offset })
    return response.data
  }
  catch( err ) {
    HandleError(dispatch, err)
    return []
  }
}

export const GetRecentAlbums = (dispatch) => async ({ start, end, limit, offset }) => {
  try {
    const response = await get("/albums/recent", { start, end, limit, offset })
    return response.data
  }
  catch( err ) {
    HandleError(dispatch, err)
    return []
  }
}

export const GetRecentAlbumComments = (dispatch) => async ({ start, end, limit, offset }) => {
  try {
    const response = await get("/albums/comments/recent", { start, end, limit, offset })
    return response.data
  }
  catch( err ) {
    HandleError(dispatch, err)
    return []
  }
}

export const GetRecentSwingComments = (dispatch) => async ({ start, end, limit, offset }) => {
  try {
    const response = await get("/swings/comments/recent", { start, end, limit, offset })
    return response.data
  }
  catch( err ) {
    HandleError(dispatch, err)
    return []
  }
}