import { get, put, post, del } from "../api/rest"
import { setAlbum } from "../../state/album/action"
import { HandleError } from "./errors"
import { newNotification } from "../../state/ui/action"
import { setAlbums } from "../../state/album/action"


export const LoadAlbums = (dispatch) => async (homeApproved = undefined) => {
  try {
    const params = {}

    if (homeApproved != null) {
      params.homeApproved = homeApproved
    }
  
    const response = await get("/albums", params)
    dispatch(setAlbums(response.data))
    return response.data
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
}

export const LoadAlbum = (dispatch) => async (albumId) => {
  try {
    const response = await get(`/albums/${albumId}`)
    dispatch(setAlbum(response.data))
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
  return true
}

export const DeleteAlbum = (dispatch) => async (albumId) => {
  try {
    await del(`/albums/${albumId}`)
    const response = await get("/albums")
    dispatch(setAlbums(response.data))
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
  return true
}

export const UpdateAlbum = (dispatch) => async (album, shareAlbum = false) => {
  try {
    const response = await put(`/albums/${album.id}`, { ...album, shareAlbum })
    dispatch(setAlbum(response.data))
    dispatch(newNotification({
      alertType: "success",
      message: `Album ${album.name} updated!`,
    }))
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
  return true
}

export const CreateAlbum = (dispatch) => async album => {
  try {
    const response = await post("/albums", album)
    dispatch(setAlbum(response.data))
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
  return true
}

export const PostComment = (dispatch) => async ({ albumId, swingId, replyId, text, frame }) => {
  try {
    const params = { text, frame }
    if (swingId) {
      params.swingId = swingId
    }
    if (replyId) {
      params.replyId = replyId
    }
    const response = await post(`/albums/${albumId}/comments`, params)
    dispatch(setAlbum(response.data))
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
  return true
}

export const FlagComment = (dispatch) => async ({
  commentCreatedAt,
  commentId,
  commenterId,
  albumId,
  swingId,
  text,
}) => {
  try {
    await post("/moderation/comments", {
      commentCreatedAt,
      commentId,
      commenterId,
      albumId,
      swingId,
      text,
    })
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
  return true
}

export const FlagAlbum = (dispatch) => async ({
  albumCreatedAt,
  albumUserId,
  albumId,
  albumName,
}) => {
  try {
    await post("/moderation/albums", {
      albumCreatedAt,
      albumUserId,
      albumId,
      albumName,
    })
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
  return true
}
