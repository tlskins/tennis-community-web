import { newNotification } from "../../state/ui/action"

export const HandleError = (dispatch, error) => {
  console.log("HandleError", error)
  dispatch(newNotification({
    alertType: "fail",
    message: error.response?.data?.message || "",
  }))
}

