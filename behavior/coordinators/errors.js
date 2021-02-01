import { newNotification } from "../../state/ui/action"

export const HandleError = (dispatch, error) => {
  console.log("HandleError", error)
  dispatch(newNotification({
    bgColor: "bg-yellow-600",
    message: error.response?.data?.message || "",
  }))
}

