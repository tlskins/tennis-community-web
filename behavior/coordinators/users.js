import { get, post, put, hasSession } from "../api/rest"
import { setUser, setConfirmation } from "../../state/user/action"
import { logOut } from "../../state/store"
import { HandleError } from "./errors"
import { newNotification } from "../../state/ui/action"

import Moment from "moment"

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

export const UpdateUserProfile = (dispatch) => async updates => {
  try {
    const response = await put("/users/home", updates)
    dispatch(setUser(response.data))
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
    dispatch(setConfirmation(null))
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
  return true
}

export const SignOut = (dispatch) => () => dispatch(logOut())

export const LoadUser = (dispatch) => async () => {
  if (!hasSession) return false
  
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

export const RemoveNotification = (dispatch) => async ({ uploadNotificationId, friendNotificationId, commentNotificationId, albumUserTagNotificationId }) => {
  try {
    const response = await put("/users/remove_notification", { uploadNotificationId, friendNotificationId, commentNotificationId, albumUserTagNotificationId })
    dispatch(setUser(response.data))
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
  return true
}

export const InviteUser = (dispatch) => async params => {
  if (!params.email.includes("@")) {
    dispatch(newNotification({
      id: Moment.toString(),
      bgColor: "bg-yellow-600",
      message: "Attempting to share with invalid email address",
    }))
    return false
  }
  try {
    await post("/users/invite", params)
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
  return true
}

export const LoadConfirmation = (dispatch) => async id => {
  try {
    const response = await get(`/confirmations/${id}`)
    dispatch(setConfirmation(response.data))
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
  return true
}

export const AcceptInvite = (dispatch) => async ({ id, userName, password, firstName, lastName }) => {
  try {
    const response = await post("/confirmations", { id, userName, password, firstName, lastName })
    dispatch(setUser(response.data))
    dispatch(setConfirmation(null))
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
  return true
}

export const ConfirmUser = (dispatch) => async id => {
  try {
    const response = await post("/confirmations", { id })
    dispatch(setUser(response.data))
    dispatch(setConfirmation(null))
  }
  catch( err ) {
    HandleError(dispatch, err)
    return false
  }
  return true
}
