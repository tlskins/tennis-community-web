import { get, post, put } from "../api/rest"
import { setUser } from "../../state/user/action"
import { logOut } from "../../state/store"
import { HandleError } from "./errors"

export const CreateUser = (dispatch) => async ({ firstName, lastName, email, password, userName }) => {
  try {
    await post("/users", { firstName, lastName, email, password, userName })
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
  return true
}

export const SignIn = (dispatch) => async ({ email, password }) => {
  try {
    const response = await post("/users/sign_in", { email, password })
    dispatch(setUser(response.data))
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
  return true
}

export const SignOut = (dispatch) => () => dispatch(logOut())

export const LoadUser = (dispatch) => async () => {
  try {
    const response = await get("/users")
    dispatch(setUser(response.data))
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
  return true
}

export const RemoveNotification = (dispatch) => async ({ uploadNotificationId, friendNotificationId, commentNotificationId }) => {
  try {
    const response = await put("/users/remove_notification", { uploadNotificationId, friendNotificationId, commentNotificationId })
    dispatch(setUser(response.data))
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
  return true
}