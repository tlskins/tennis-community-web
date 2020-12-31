import { TOGGLE_FLASH_NOTIF } from "./action"

const flashNotificationInitialState = {
  alertType: "",
  message: "",
  on: false,
}
  

export function flashNotificationReducer(
  state = flashNotificationInitialState,
  action
) {
  switch (action.type) {
  case TOGGLE_FLASH_NOTIF: {
    const { payload } = action
  
    return {
      alertType: payload.alertType,
      message: payload.message,
      on: payload.on,
      callback: payload.callback,
    }
  }
  default:
    return state
  }
}
  