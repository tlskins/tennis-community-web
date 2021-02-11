import { get, put, post, del } from "../api/rest"
import { setAlbum } from "../../state/album/action"
import { HandleError } from "./errors"
import { newNotification } from "../../state/ui/action"
import { setMyAlbums, setFriendsAlbums, setSharedAlbums, setPublicAlbums } from "../../state/album/action"


export const LoadMyAlbums = (dispatch) => async ({ limit, offset } = {}) => {
  try {
    const response = await put("/albums/search", { my: true, limit, offset })
    dispatch(setMyAlbums(response.data))
    return true
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
}

export const LoadFriendsAlbums = (dispatch) => async ({ limit, offset } = {}) => {
  try {
    const response = await put("/albums/search", { friends: true, limit, offset })
    dispatch(setFriendsAlbums(response.data))
    return true
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
}

export const LoadSharedAlbums = (dispatch) => async ({ limit, offset } = {}) => {
  try {
    const response = await put("/albums/search", { shared: true, limit, offset })
    dispatch(setSharedAlbums(response.data))
    return true
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
}

export const LoadPublicAlbums = (dispatch) => async ({ homeApproved, limit, offset } = {}) => {
  try {
    const params = { isPublic: true, limit, offset }
    if (homeApproved != null) {
      params.homeApproved = homeApproved
    }
    const response = await put("/albums/search", params)
    dispatch(setPublicAlbums(response.data))
    return true
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
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
  return true
}

export const UpdateAlbum = (dispatch) => async (album, shareAlbum = false, calculateMetrics = false) => {
  try {
    const response = await put(`/albums/${album.id}`, { ...album, shareAlbum, calculateMetrics })
    dispatch(setAlbum(response.data))
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
  return true
}

export const UpdateSwing = (dispatch) => async (data) => {
  try {
    const response = await put("/albums/swings", data)
    dispatch(setAlbum(response.data))
    dispatch(newNotification({ message: `Swing "${data.name}" updated!` }))
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
