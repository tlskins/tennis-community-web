import { get, post, put } from "../api/rest"
import { setUser } from "../../state/user/action"
import { logOut } from "../../state/store"
import { HandleError } from "./errors"

export const CreateUser = (dispatch) => async ({ firstName, lastName, email, password }) => {
  try {
    await post("/users", { firstName, lastName, email, password })
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

export const ClearNotifications = (dispatch) => async ({ uploads }) => {
  try {
    const response = await put("/users/clear_notifications", { uploads })
    dispatch(setUser(response.data))
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
  return true
}