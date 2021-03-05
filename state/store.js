import { createStore, applyMiddleware, combineReducers } from "redux"
import { HYDRATE, createWrapper } from "next-redux-wrapper"
import thunkMiddleware from "redux-thunk"
import logger from "redux-logger"

import {
  flashNotificationReducer,
  flashNotificationInitialState,
  navBarReducer,
  navBarInitialState,
  headInitialState,
  headReducer,
} from "./ui/reducer"
import {
  confirmationReducer,
  confirmationInitialState,
  userReducer,
  userInitialState,
  usersCacheReducer,
  usersCacheInitialState,
} from "./user/reducer"
import { recentUploadsReducer, recentUploadsInitialState } from "./upload/reducer"
import {
  albumReducer,
  albumInitialState,
  albumsReducer,
  albumsInitialState,
} from "./album/reducer"


const bindMiddleware = (middleware) => {
  if (process.env.NODE_ENV !== "production") {
    const { composeWithDevTools } = require("redux-devtools-extension")
    return composeWithDevTools(applyMiddleware(...middleware))
  }
  return applyMiddleware(...middleware)
}

const combinedReducer = combineReducers({
  head: headReducer,
  confirmation: confirmationReducer,
  flashNotification: flashNotificationReducer,
  user: userReducer,
  usersCache: usersCacheReducer,
  recentUploads: recentUploadsReducer,
  album: albumReducer,
  albums: albumsReducer,
  navBar: navBarReducer,
})

export const LOG_OUT = "LOG_OUT"

export const logOut = () => ({
  type: LOG_OUT
})

const reducer = (state, action) => {
  if (action.type === HYDRATE) {
    return {
      ...state, // use previous state
      ...action.payload, // apply delta from hydration
    }
  } else if (action.type === LOG_OUT) {
    return {
      // UI
      head: headInitialState,
      flashNotification: flashNotificationInitialState,
      navBar: navBarInitialState,
      // user
      confirmation: confirmationInitialState,
      user: userInitialState,
      usersCache: usersCacheInitialState,
      // uploads
      recentUploads: recentUploadsInitialState,
      // albums
      album: albumInitialState,
      albums: albumsInitialState,
    }
  }
  else {
    return combinedReducer(state, action)
  }
}

const makeConfiguredStore = (reducer) =>
  createStore(reducer, undefined, applyMiddleware(logger))

const initStore = () => {
  const isServer = typeof window === "undefined"
  if (isServer) {
    return makeConfiguredStore(reducer)
  } else {
    // we need it only on client side
    const {persistStore, persistReducer} = require("redux-persist")
    const storage = require("redux-persist/lib/storage").default

    const persistConfig = {
      key: "root",
      whitelist: ["user"], // make sure it does not clash with server keys
      storage
    }

    const persistedReducer = persistReducer(persistConfig, reducer)
    const store = createStore(persistedReducer, bindMiddleware([thunkMiddleware]))

    store.__persistor = persistStore(store) // Nasty hack

    return store
  }
}

export const wrapper = createWrapper(initStore)