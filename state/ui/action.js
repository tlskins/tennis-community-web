export const NEW_NOTIFICATION = "NEW_NOTIFICATION"
export const REMOVE_NOTIFICATION = "REMOVE_NOTIFICATION"

export const newNotification = ( flashNotification ) => ({
  type: NEW_NOTIFICATION,
  payload: flashNotification,
})
export const removeNotification = ( id ) => ({
  type: REMOVE_NOTIFICATION,
  payload: id,
})
 