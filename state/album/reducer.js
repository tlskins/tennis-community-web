import {
  SET_ALBUM,
  SET_MY_ALBUMS,
  SET_FRIENDS_ALBUMS,
  SET_SHARED_ALBUMS,
  SET_PUBLIC_ALBUMS,
  SET_PRO_ALBUMS,
} from "./action"
import { LOG_OUT } from "../store"

export const albumInitialState = null
export const albumsInitialState = {
  myAlbums: [],
  friendsAlbums: [],
  sharedAlbums: [],
  publicAlbums: [],
  proAlbums: [],
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
  case LOG_OUT: {
    return albumInitialState
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
  case SET_MY_ALBUMS: {
    const { payload } = action  
    return { ...state, myAlbums: [...payload] }
  }
  case SET_FRIENDS_ALBUMS: {
    const { payload } = action  
    return { ...state, friendsAlbums: [...payload] }
  }
  case SET_SHARED_ALBUMS: {
    const { payload } = action  
    return { ...state, sharedAlbums: [...payload] }
  }
  case SET_PUBLIC_ALBUMS: {
    const { payload } = action  
    return { ...state, publicAlbums: [...payload] }
  }
  case SET_PRO_ALBUMS: {
    const { payload } = action  
    return { ...state, proAlbums: [...payload] }
  }
  case LOG_OUT: {
    return { ...albumsInitialState }
  }
  default:
    return state
  }
}
  