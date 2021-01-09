export const SET_USER = "SET_USER"
export const CACHE_USERS = "CACHE_USERS"

export const setUser = ( user ) => ({
  type: SET_USER,
  payload: user,
})
export const cacheUsers = ( users ) => ({
  type: CACHE_USERS,
  payload: users,
})