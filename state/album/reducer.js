import { SET_ALBUM } from "./action"

const albumnInitialState = null
  

export function albumReducer(
  state = albumnInitialState,
  action
) {
  switch (action.type) {
  case SET_ALBUM: {
    const { payload } = action  
    return payload
  }
  default:
    return state
  }
}
  