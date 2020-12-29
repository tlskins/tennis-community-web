import React from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"

import { toggleFlashNotification } from "../store/ui/action"


const FlashNotif = (props) => {
  const { alertType, message, callback, clearNotif, on } = props
  let alertClass
  switch ( alertType ) {
  case "fail":
    alertClass = "bg-red-200"
    break
  case "success":
    alertClass = "bg-green-200"
    break
  default:
    alertClass = "bg-indigo-200"
  }

  return (
    <div id="notif_container" onClick={ clearNotif } className={ `${ alertClass } ${ !on && "hidden" } fixed w-1/2 z-10 center-absolute-x mt-2 rounded justify-between text-center flex p-3 text-hGray border border-hGray rounded font-regular text-lg items-start sm:w-full xs:w-full md:w-full` }>
      <div className="flex flex-col items-center w-full pt-3">
        <p id="notif_message px-3">{ message }</p>
        { callback &&
          <button
            onClick={ callback }
            id="ok-btn"
            className="bg-white text-xl py-1 px-4 rounded border border-solid mt-2 border-hGray cursor-pointer shadow text-hGray focus:outline-none"
            aria-label="notification_ok"
          >
          OK
          </button>
        }
      </div>
      <button className="cursor-pointer block w-3 h-3" value="X" />
      {/* <img onClick={ clearNotif } className="cursor-pointer block w-3 h-3" src={ x } alt="x" /> */}
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    alertType: state.flashNotification?.alertType,
    message: state.flashNotification?.message,
    on: state.flashNotification?.on,
    callback: state.flashNotification?.callback,
  }
}


const mapDispatchToProps = (dispatch) => ({
  clearNotif: () => {
    dispatch( toggleFlashNotification({ on: false, alertType: "",  message: "" }))
  },
})

FlashNotif.propTypes = {
  alertType: PropTypes.string,
  message: PropTypes.string,
  on: PropTypes.bool,

  clearNotif: PropTypes.func,
  callback: PropTypes.func,
}

export default connect( mapStateToProps, mapDispatchToProps )( FlashNotif )
