export const NEW_NOTIFICATION = "NEW_NOTIFICATION"
export const REMOVE_NOTIFICATION = "REMOVE_NOTIFICATION"
export const TOGGLE_SHOW_NEW_USER = "TOGGLE_SHOW_NEW_USER"

export const newNotification = ( flashNotification ) => ({
  type: NEW_NOTIFICATION,
  payload: flashNotification,
})
export const removeNotification = ( id ) => ({
  type: REMOVE_NOTIFICATION,
  payload: id,
})
export const toggleShowNewUser = () => ({
  type: TOGGLE_SHOW_NEW_USER,
})