import React, { Fragment, useEffect } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import { useRouter } from "next/router"

import { RemoveNotification, LoadUser } from "../behavior/coordinators/users"
import { GetRecentUploads } from "../behavior/coordinators/uploads"
import { useInterval } from "../behavior/helpers"
import { newNotification } from "../state/ui/action"
import { hasSession } from "../behavior/api/rest"

const Notifications = ({
  user,

  toggleFlashMessage,
  removeNotification,
  getRecentUploads,
  loadUser,
}) => {
  const router = useRouter()
  
  const uploadNoteIds = user?.uploadNotifications.map( note => note.id) || []
  const friendNoteIds = user?.friendNotifications.map( note => note.id) || []
  const commentNoteIds = user?.commentNotifications.map( note => note.id) || []

  useInterval(loadUser, 45000, 30)

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (user && user.uploadNotifications?.length > 0) {
      getRecentUploads()
      user.uploadNotifications.forEach( note => toggleFlashMessage({
        id: note.id,
        message: note.subject,
        buttons: [
          {
            buttonText: "ok",
            callback: () => removeNotification({ uploadNotificationId: note.id })
          },
          {
            buttonText: "View Album",
            callback: async () => {
              await removeNotification({ uploadNotificationId: note.id })
              if (note.type === "Upload Complete") {
                router.push(`/albums/${note.albumId}`)
              }
            }
          },
        ],
      }))
    }
  }, [uploadNoteIds])

  useEffect(async () => {
    if (user) {
      user.friendNotifications.forEach( note => {
        toggleFlashMessage({
          id: note.id,
          message: note.subject,
          buttons: [
            {
              buttonText: "ok",
              callback: () => removeNotification({ friendNotificationId: note.id }),
            },
            {
              buttonText: "View",
              callback: async () => {
                await removeNotification({ friendNotificationId: note.id })
                if (note.type === "New Friend Request") {
                  router.push("/home")
                }
              },
            },
          ],
        })
      })
    }
  }, [friendNoteIds])

  useEffect(async () => {
    if (user) {
      user.commentNotifications.forEach( note => {
        let message = `${note.friendUserName} commented on your album ${note.albumName}`
        if (note.numComments > 1) {
          message = `${note.friendUserName} made ${note.numComments} comments on your album ${note.albumName}`
        }
        toggleFlashMessage({
          id: note.id,
          message,
          buttons: [
            {
              buttonText: "ok",
              callback: () => removeNotification({ commentNotificationId: note.id }),
            },
            {
              buttonText: "View",
              callback: async () => {
                await removeNotification({ commentNotificationId: note.id })
                router.push(`/albums/${note.albumId}`)
              },
            },
          ],
        })
      })
    }
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
    toggleFlashMessage: args => dispatch(newNotification(args)),
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