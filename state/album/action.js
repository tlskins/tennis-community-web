export const SET_ALBUM = "SET_ALBUM"
export const SET_ALBUMS = "SET_ALBUMS"

export const setAlbum = ( album ) => ({
  type: SET_ALBUM,
  payload: album,
})
  
export const setAlbums = ( albums ) => ({
  type: SET_ALBUMS,
  payload: albums,
})
  