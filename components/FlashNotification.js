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
    <div className="fixed absolute right-2 z-50 ml-12 mt-2 flex flex-col space-y-56 lg:space-y-40 items-start">
      { (notifications || []).map( ({ id, bgColor, message, buttons }, i) => {
        // let bgColor = "bg-yellow-300"
        // if (color) {
        //   bgColor = color
        // }
        return(
          <div key={i}
            onClick={ () => onRemoveNotification(id) }
            className={ "bg-yellow-300 fixed right-0 w-3/4 lg:w-1/2 shadow-lg rounded justify-between text-center flex px-3 lg:py-2 text-gray-700 rounded text-lg" }
          >
            <div className="flex flex-col items-center w-full py-6 tracking-wide font-bold">
              <p id="notif_message px-3">{ message }</p>
              <div className="flex flex-row px-5">
                { (buttons || []).map( ({ callback, buttonText }, i) => {
                  return(
                    <button key={i}
                      onClick={ callback }
                      className="bg-gray-800 text-sm py-1 px-2 mx-2 my-2 rounded cursor-pointer shadow-lg text-yellow-300 font-semibold"
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
