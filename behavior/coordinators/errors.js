import { toggleFlashNotification } from "../../state/ui/action"

export const HandleError = (dispatch, error) => {
  console.log("HandleError", error)
  dispatch(toggleFlashNotification({
    on: true,
    alertType: "fail",
    message: error.response?.data?.message || "",
  }))
}
  
