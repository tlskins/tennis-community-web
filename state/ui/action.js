export const NEW_NOTIFICATION = "NEW_NOTIFICATION"
export const REMOVE_NOTIFICATION = "REMOVE_NOTIFICATION"
export const SET_LOGIN_FORM_VISIBLE = "SET_LOGIN_FORM_VISIBLE"
export const SET_HEAD = "SET_HEAD"

export const newNotification = ( flashNotification ) => ({
  type: NEW_NOTIFICATION,
  payload: flashNotification,
})
export const removeNotification = ( id ) => ({
  type: REMOVE_NOTIFICATION,
  payload: id,
})
export const setLoginFormVisible = formType => ({
  type: SET_LOGIN_FORM_VISIBLE,
  payload: formType
})
export const setHead = ( head ) => ({
  type: SET_HEAD,
  payload: head,
})