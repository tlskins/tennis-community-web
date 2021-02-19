import { get, put, post, del } from "../api/rest"
import { setAlbum } from "../../state/album/action"
import { HandleError } from "./errors"
import { newNotification } from "../../state/ui/action"
import { setMyAlbums, setFriendsAlbums, setSharedAlbums, setPublicAlbums } from "../../state/album/action"

import Moment from "moment"

const pAlbum = json => {
  return {
    ...json,
    allComments: [
      ...(json?.comments || []),
      ...((json?.swingVideos || []).map( swing => 
        (swing.comments || []).map( comment => 
          ({ ...comment, swingName: swing.name, swingId: swing.id })
        )
      ).flat()),
    ].sort( (a,b) => Moment(a.createdAt).isAfter(Moment(b.createdAt)) ? -1 : 1)
  }
}

const pAlbums = json => {
  return json.map( data => pAlbum(data))
}


export const LoadMyAlbums = (dispatch) => async ({ limit, offset } = {}) => {
  try {
    const response = await put("/albums/search", { my: true, limit, offset })
    const albums = pAlbums(response.data)
    dispatch(setMyAlbums(albums))
    return albums
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
}

export const LoadFriendsAlbums = (dispatch) => async ({ limit, offset } = {}) => {
  try {
    const response = await put("/albums/search", { friends: true, limit, offset })
    const albums = pAlbums(response.data)
    dispatch(setFriendsAlbums(albums))
    return albums
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
}

export const LoadSharedAlbums = (dispatch) => async ({ limit, offset } = {}) => {
  try {
    const response = await put("/albums/search", { shared: true, limit, offset })
    const albums = pAlbums(response.data)
    dispatch(setSharedAlbums(albums))
    return albums
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
    const albums = pAlbums(response.data)
    dispatch(setPublicAlbums(albums))
    return albums
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
}

export const LoadAlbum = (dispatch) => async (albumId) => {
  try {
    const response = await get(`/albums/${albumId}`)
    const album = pAlbum( response.data )
    dispatch(setAlbum(album))
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

export const UpdateAlbum = (dispatch) => async (data, shareAlbum = false, calculateMetrics = false) => {
  try {
    const response = await put(`/albums/${data.id}`, { ...data, shareAlbum, calculateMetrics })
    const album = pAlbum( response.data )
    dispatch(setAlbum(album))
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
    const album = pAlbum( response.data )
    dispatch(setAlbum(album))
    dispatch(newNotification({ message: `Swing "${album.name}" updated!` }))
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
  return true
}

export const CreateAlbum = (dispatch) => async data => {
  try {
    const response = await post("/albums", data)
    const album = pAlbum( response.data )
    dispatch(setAlbum(album))
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
    const album = pAlbum( response.data )
    dispatch(setAlbum(album))
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
