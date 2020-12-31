export const TOGGLE_FLASH_NOTIF = "TOGGLE_FLASH_NOTIF"

export const toggleFlashNotification = ( flashNotification ) => ({
  type: TOGGLE_FLASH_NOTIF,
  payload: flashNotification,
})
  