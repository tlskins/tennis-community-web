import { get } from "../api/rest"
import { setAlbum } from "../../state/album/action"
import { HandleError } from "./errors"
  

export const GetAlbums = (dispatch) => async () => {
  try {
    const response = await get("/albums")
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