import React from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"

import { removeNotification } from "../state/ui/action"

// notification schema
// {
//   id: string,
//   bgColor: string,
//   message: string,
//   buttons: [
//     {
//       callback: func,
//       buttonText: string,
//     }
//   ]
// }

const FlashNotif = ({ notifications, onRemoveNotification }) => {
  return (
    <div className="fixed absolute right-2 w-1/2 z-50 ml-12 mt-2 flex flex-col space-y-6 items-start">
      { (notifications || []).map( ({ id, bgColor, message, buttons }, i) => {
        if (!bgColor) {
          bgColor = "bg-yellow-300"
        }
        return(
          <div key={i}
            onClick={ () => onRemoveNotification(id) }
            className={ `${ bgColor } w-full shadow-md rounded-xl justify-between text-center flex px-3 py-2 text-gray-700 border border-white rounded text-lg` }
          >
            <div className="flex flex-col items-center w-full py-6 tracking-wide font-bold">
              <p id="notif_message px-3">{ message }</p>
              <div className="flex flex-row px-5">
                { (buttons || []).map( ({ callback, buttonText }, i) => {
                  return(
                    <button key={i}
                      onClick={ callback }
                      className="bg-white text-sm py-1 px-2 mx-2 my-2 rounded-lg border border-solid border-gray-300 cursor-pointer shadow text-gray-600 font-semibold focus:outline-none"
                      aria-label="notification_ok"
                    >
                      { buttonText }
                    </button>
                  )
                })}
              </div>
            </div>
            <button className="cursor-pointer block w-3 h-3 font-bold">
              x
            </button>
          </div>
        )
      })}
    </div>
  )
}

const mapStateToProps = (state) => {
  console.log("mapStateToProps", state)
  return {
    notifications: state.flashNotification,
  }
}


const mapDispatchToProps = (dispatch) => ({
  onRemoveNotification: id => {
    dispatch( removeNotification(id))
  },
})

FlashNotif.propTypes = {
  notifications: PropTypes.arrayOf(PropTypes.object),

  onRemoveNotification: PropTypes.func,
}

export default connect( mapStateToProps, mapDispatchToProps )( FlashNotif )
