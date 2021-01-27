import React from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"

import { removeNotification } from "../state/ui/action"

const getAlertClass = alertType => {
  switch ( alertType ) {
  case "fail":
    return "bg-red-200"
  case "success":
    return "bg-green-200"
  default:
    return "bg-indigo-200"
  }
}

const FlashNotif = ({ notifications, onRemoveNotification }) => {
  return (
    <div className="fixed absolute right-2 w-1/2 z-10 ml-12 mt-2 flex flex-col space-y-6 items-start">
      { (notifications || []).map( (note, i) => {
        return(
          <div key={i}
            onClick={ () => onRemoveNotification(note.id) }
            className={ `${ getAlertClass(note.alertType) } w-full shadow-md rounded justify-between text-center flex px-3 py-2 text-gray-700 border border-gray-300 rounded font-regular text-lg` }
          >
            <div className="flex flex-col items-center w-full pt-3">
              <p id="notif_message px-3">{ note.message }</p>
              { note.callback &&
                <button
                  onClick={ note.callback }
                  id="ok-btn"
                  className="bg-white text-sm py-1 px-4 rounded-lg border border-solid my-2 border-gray-300 cursor-pointer shadow text-gray-600 focus:outline-none"
                  aria-label="notification_ok"
                >
                  OK
                </button>
              }
            </div>
            <button className="cursor-pointer block w-3 h-3">
              X
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
