import { post } from "../api/rest"
import { setUser } from "../../state/user/action"
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
