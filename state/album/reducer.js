import { SET_ALBUM, SET_ALBUMS } from "./action"

const albumInitialState = null
const albumsInitialState = {
  lastRequestAt: undefined,
  myAlbums: [],
  friendsAlbums: [],
  publicAlbums: [],
}


export function albumReducer(
  state = albumInitialState,
  action
) {
  switch (action.type) {
  case SET_ALBUM: {
    const { payload } = action  
    return payload
  }
  default:
    return state
  }
}
  
export function albumsReducer(
  state = albumsInitialState,
  action
) {
  switch (action.type) {
  case SET_ALBUMS: {
    const { payload } = action  
    return payload
  }
  default:
    return state
  }
}
  