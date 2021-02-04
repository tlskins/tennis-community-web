import { newNotification } from "../../state/ui/action"

import Moment from "moment"


export const HandleError = (dispatch, error) => {
  console.log("HandleError", error)
  dispatch(newNotification({
    id: Moment().toString(),
    bgColor: "bg-yellow-600",
    message: error.response?.data?.message || "",
  }))
}

