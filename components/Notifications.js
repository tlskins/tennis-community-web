import React, { Fragment, useEffect } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import { useRouter } from "next/router"

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
  const router = useRouter()
  useInterval(loadUser, 30000, 30)

  useEffect(() => {
    if (user.uploadNotifications?.length > 0) {
      getRecentUploads()
      user.uploadNotifications.forEach( note => toggleFlashMessage({
        alertType: "success",
        message: note.subject,
        callback: () => {
          clearNotifications({ uploads: true })
          if (note.type === "Upload Complete") {
            router.push(`/albums/${note.albumId}`)
          }
        }
      }))
    }
  }, [user.uploadNotifications])

  useEffect(async () => {
    user.friendNotifications.forEach( note => {
      toggleFlashMessage({
        alertType: "success",
        message: note.subject,
        callback: () => {
          clearNotifications({ friends: true })
          if (note.type === "New Friend Request") {
            router.push("/friends")
          }
        },
      })
    })
  }, [user.friendNotifications])

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
  return {
    clearNotifications: ClearNotifications(dispatch),
    getRecentUploads: GetRecentUploads(dispatch),
    loadUser: LoadUser(dispatch),
    toggleFlashMessage: ({ alertType, message, callback, }) => dispatch(toggleFlashNotification({
      on: true,
      alertType,
      callback,
      message,
    })),
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