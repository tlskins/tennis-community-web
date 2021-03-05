import { createStore, applyMiddleware, combineReducers } from "redux"
import thunkMiddleware from "redux-thunk"
import { createLogger } from "redux-logger"

import {
  flashNotificationReducer,
  navBarReducer,
} from "./ui/reducer"
import {
  confirmationReducer,
  userReducer,
  usersCacheReducer,
} from "./user/reducer"
import { recentUploadsReducer } from "./upload/reducer"
import {
  albumReducer,
  albumsReducer,
} from "./album/reducer"

export const LOG_OUT = "LOG_OUT"

export const logOut = () => ({
  type: LOG_OUT
})

export const rootReducer = combineReducers({
  confirmation: confirmationReducer,
  flashNotification: flashNotificationReducer,
  user: userReducer,
  usersCache: usersCacheReducer,
  recentUploads: recentUploadsReducer,
  album: albumReducer,
  albums: albumsReducer,
  navBar: navBarReducer,
})

const loggerMiddleware = createLogger()

export const store = createStore(
  rootReducer,
  applyMiddleware(
    thunkMiddleware,
    loggerMiddleware
  )
)