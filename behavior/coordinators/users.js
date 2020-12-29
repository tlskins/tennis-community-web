import { post } from "../api/rest"
import { toggleFlashNotification } from "../../store/ui/action"

export const CreateUser = (dispatch) => async ({ firstName, lastName, email, password }) => {
  try {
    await post("/users", { firstName, lastName, email, password })
  }
  catch( error ) {
    dispatch(toggleFlashNotification({
      on: true,
      alertType: "fail",
      message: error.response?.data?.message || "",
    }))
    return false
  }
  return true
}

export const SignIn = (dispatch) => async ({ email, password }) => {
  try {
    await post("/users/sign_in", { email, password })
  }
  catch( error ) {
    dispatch(toggleFlashNotification({
      on: true,
      alertType: "fail",
      message: error.response?.data?.message || "",
    }))
    return false
  }
  return true
}
