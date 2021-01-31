import React, { Fragment, useEffect } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import { useRouter } from "next/router"

import { RemoveNotification, LoadUser } from "../behavior/coordinators/users"
import { GetRecentUploads } from "../behavior/coordinators/uploads"
import { useInterval } from "../behavior/helpers"
import { newNotification } from "../state/ui/action"

const Notifications = ({
  user,

  toggleFlashMessage,
  removeNotification,
  getRecentUploads,
  loadUser,
}) => {
  const router = useRouter()
  useInterval(loadUser, 30000, 30)
  
  const uploadNoteIds = user.uploadNotifications.map( note => note.id)
  const friendNoteIds = user.friendNotifications.map( note => note.id)
  const commentNoteIds = user.commentNotifications.map( note => note.id)

  useEffect(() => {
    if (user.uploadNotifications?.length > 0) {
      getRecentUploads()
      user.uploadNotifications.forEach( note => toggleFlashMessage({
        id: note.id,
        alertType: "success",
        message: note.subject,
        callback: async () => {
          await removeNotification({ uploadNotificationId: note.id })
          if (note.type === "Upload Complete") {
            router.push(`/albums/${note.albumId}`)
          }
        }
      }))
    }
  }, [uploadNoteIds])

  useEffect(async () => {
    user.friendNotifications.forEach( note => {
      toggleFlashMessage({
        id: note.id,
        alertType: "success",
        message: note.subject,
        callback: async () => {
          await removeNotification({ friendNotificationId: note.id })
          if (note.type === "New Friend Request") {
            router.push("/friends")
          }
        },
      })
    })
  }, [friendNoteIds])

  useEffect(async () => {
    user.commentNotifications.forEach( note => {
      let message = `${note.friendUserName} commented on your album ${note.albumName}`
      if (note.numComments > 1) {
        message = `${note.friendUserName} made ${note.numComments} comments on your album ${note.albumName}`
      }
      toggleFlashMessage({
        id: note.id,
        alertType: "success",
        message,
        callback: async () => {
          await removeNotification({ commentNotificationId: note.id })
          router.push(`/albums/${note.albumId}`)
        },
      })
    })
  }, [commentNoteIds])

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
    removeNotification: RemoveNotification(dispatch),
    getRecentUploads: GetRecentUploads(dispatch),
    loadUser: LoadUser(dispatch),
    toggleFlashMessage: ({ alertType, message, callback, }) => dispatch(newNotification({
      alertType,
      callback,
      message,
    })),
  }
}
  
Notifications.propTypes = {
  user: PropTypes.object,

  removeNotification: PropTypes.func,
  getRecentUploads: PropTypes.func,
  loadUser: PropTypes.func,
  toggleFlashMessage: PropTypes.func,
}
  
export default connect(mapStateToProps, mapDispatchToProps)(Notifications)