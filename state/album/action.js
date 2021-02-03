export const SET_ALBUM = "SET_ALBUM"
export const SET_MY_ALBUMS = "SET_MY_ALBUMS"
export const SET_FRIENDS_ALBUMS = "SET_FRIENDS_ALBUMS"
export const SET_SHARED_ALBUMS = "SET_SHARED_ALBUMS"
export const SET_PUBLIC_ALBUMS = "SET_PUBLIC_ALBUMS"

export const setAlbum = ( album ) => ({
  type: SET_ALBUM,
  payload: album,
})
export const setMyAlbums = ( albums ) => ({
  type: SET_MY_ALBUMS,
  payload: albums,
})
export const setFriendsAlbums = ( albums ) => ({
  type: SET_FRIENDS_ALBUMS,
  payload: albums,
})
export const setSharedAlbums = ( albums ) => ({
  type: SET_SHARED_ALBUMS,
  payload: albums,
})
export const setPublicAlbums = ( albums ) => ({
  type: SET_PUBLIC_ALBUMS,
  payload: albums,
})
