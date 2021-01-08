import React, { Fragment, useEffect } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"

import { ClearNotifications, LoadUser } from "../behavior/coordinators/users"
import { GetRecentUploads } from "../behavior/coordinators/uploads"
import { useInterval } from "../behavior/helpers"
import { toggleFlashNotification } from "../state/ui/action"

const Notifications = ({
  user,
  toggleFlashMessage,
  clearNotifications,
  getRecentUploads,
  loadUser,
}) => {
  useInterval(loadUser, 30000, 30)

  useEffect(() => {
    if (user.uploadNotifications) {
      getRecentUploads()
      user.uploadNotifications.forEach( note => toggleFlashMessage({
        alertType: "success",
        message: note.subject,
        callback: () => clearNotifications({ uploads: true }),
      }))
    }
  }, [user.uploadNotifications])

  return(
    <Fragment />
  )
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
  }
}

const mapDispatchToProps = (dispatch) => {
  const toggleFlashMessage = ({ alertType, message, callback, }) => dispatch(toggleFlashNotification({
    on: true,
    alertType,
    callback,
    message,
  }))
  const loadUser = LoadUser(dispatch)

  return {
    clearNotifications: ClearNotifications(dispatch),
    getRecentUploads: GetRecentUploads(dispatch),
    loadUser,
    toggleFlashMessage,
  }
}
  
Notifications.propTypes = {
  user: PropTypes.object,

  clearNotifications: PropTypes.func,
  getRecentUploads: PropTypes.func,
  loadUser: PropTypes.func,
  toggleFlashMessage: PropTypes.func,
}
  
export default connect(mapStateToProps, mapDispatchToProps)(Notifications)