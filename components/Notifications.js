import React, { Fragment, useEffect } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import { useRouter } from "next/router"

import { ClearNotifications, LoadUser } from "../behavior/coordinators/users"
import { SearchFriends } from "../behavior/coordinators/friends"
import { GetRecentUploads } from "../behavior/coordinators/uploads"
import { useInterval } from "../behavior/helpers"
import { toggleFlashNotification } from "../state/ui/action"

const Notifications = ({
  user,
  usersCache,

  toggleFlashMessage,
  clearNotifications,
  getRecentUploads,
  loadUser,
  searchFriends,
}) => {
  const router = useRouter()
  useInterval(loadUser, 30000, 30)

  useEffect(() => {
    if (user.uploadNotifications?.length > 0) {
      getRecentUploads()
      user.uploadNotifications.forEach( note => toggleFlashMessage({
        alertType: "success",
        message: note.subject,
        callback: () => clearNotifications({ uploads: true }),
      }))
    }
  }, [user.uploadNotifications])

  useEffect(async () => {
    if (user.friendNotifications?.length > 0) {
      // search for user
      const ids = user.friendNotifications.filter( r => !usersCache[r.friendId]).map( r => r.friendId)
      let tmpCache = {}
      if (ids.length > 0) {
        const friends = await searchFriends({ ids })
        friends.forEach( f => tmpCache[f.id] = f)
      }
      // display notifications
      user.friendNotifications.forEach( note => {
        const friend = usersCache[note.friendId] || tmpCache[note.friendId]
        toggleFlashMessage({
          alertType: "success",
          message: `${note.subject}: ${friend?.userName}`,
          callback: () => {
            clearNotifications({ friends: true })
            if (note.type === "New Friend Request") {
              router.push("/friends")
            }
          },
        })
      })
    }
  }, [user.friendNotifications])

  return(
    <Fragment />
  )
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    usersCache: state.usersCache,
  }
}


const mapDispatchToProps = (dispatch) => {
  return {
    clearNotifications: ClearNotifications(dispatch),
    getRecentUploads: GetRecentUploads(dispatch),
    loadUser: LoadUser(dispatch),
    searchFriends: SearchFriends(dispatch),
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
  usersCache: PropTypes.object,

  clearNotifications: PropTypes.func,
  getRecentUploads: PropTypes.func,
  loadUser: PropTypes.func,
  toggleFlashMessage: PropTypes.func,
  searchFriends: PropTypes.func,
}
  
export default connect(mapStateToProps, mapDispatchToProps)(Notifications)