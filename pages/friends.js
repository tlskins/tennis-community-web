import React, { useEffect, useState, Fragment } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import Moment from "moment-timezone"
import { useRouter } from "next/router"

import Notifications from "../components/Notifications"
import {
  SearchFriends,
  SendFriendRequest,
  AcceptFriendRequest,
  Unfriend,
} from "../behavior/coordinators/friends"
import { LoadUser } from "../behavior/coordinators/users"
import { newNotification } from "../state/ui/action"

let timer

const Friends = ({
  user,
  usersCache,
  
  acceptFriendRequest,
  loadUser,
  searchFriends,
  sendFriendRequest,
  displayAlert,
  unfriend,
}) => {
  const router = useRouter()

  const [search, setSearch] = useState("")
  const [foundUsers, setFoundUsers] = useState([])
  const [displayUserId, setDisplayUserId] = useState(undefined)
  const [activeFriendReq, setActiveFriendReq] = useState(undefined)
  const displayUser = usersCache[displayUserId]

  useEffect(() => {
    if (!user || !user.id) {
      router.push("/")
    }
  }, [user])

  if (!user) {
    return(<Fragment/>)
  }

  useEffect(() => {
    if (user.friendRequests.length > 0 || user.friendIds.length > 0) {
      let ids = user.friendRequests.map( r => r.fromUserId === user.id ? r.toUserId : r.fromUserId)
      ids = ids.filter( id => !usersCache[id])
      searchFriends({ ids: [ ...ids, ...user.friendIds] })
    }
  }, [user.friendRequests, user.friendIds])
  
  useEffect(() => {
    if (user.friendRequests.length > 0 || user.friendIds.length > 0) {
      let ids = user.friendRequests.map( r => r.fromUserId === user.id ? r.toUserId : r.fromUserId)
      ids = ids.filter( id => !usersCache[id])
      searchFriends({ ids: [ ...ids, ...user.friendIds] })
    }
  }, [user.friendRequests, user.friendIds])

  const executeAfterTimeout = (func, timeout) => {
    if ( timer ) {
      clearTimeout( timer )
    }
    timer = undefined
    timer = setTimeout(() => {
      func()
    }, timeout )
  }

  const onSearchUsers = async e => {
    const search = e.target.value
    setSearch(search)
    executeAfterTimeout(async () => {
      if (search) {
        const friends = await searchFriends({ search })
        setFoundUsers(friends)
      } else {
        setFoundUsers([])
      }
    }, 700)
  }

  const onSendFriendRequest = ({ id, userName }) => async () => {
    if (await sendFriendRequest({ id })) {
      displayAlert({ message: `Friend request sent to ${userName}` })
      loadUser()
    }
  }

  const onAcceptFriendRequest = (requestId, accept) => async () => {
    if (await acceptFriendRequest({ requestId, accept })) {
      displayAlert({ message: "Friend request accepted" })
    }
  }

  const onUnfriend = (friendId, friendName) => async () => {
    if (await unfriend({ friendId })) {
      loadUser()
      displayAlert({ message: `Unfriended ${friendName}` })
    }
  } 

  return (
    <div className="flex flex-col h-screen min-h-screen">
      { (user && user.id) &&
        <Notifications />
      }
      <main className="flex flex-1 overflow-y-auto">

        {/* Begin Sidebar */}

        <div className="h-screen top-0 sticky p-4 bg-white w-1/5 overflow-y-scroll border-r border-gray-400">
          <div className="flex flex-col content-center justify-center items-center text-sm">

            {/* Search Users Sidebar */}
            <Fragment>
              <h2 className="text-blue-400 underline mb-2">
                Search Users
              </h2>
              <div className="mb-2 flex flex-col">
                <input type="text"
                  placeholder="search"
                  className="rounded border border-gray-400 m-1 p-1 text-center shadow"
                  value={search}
                  onChange={onSearchUsers}
                />
                <div>
                  { foundUsers.map(({ id, userName, firstName, lastName }, i) => {
                    const isFriend = user.friendIds.includes(id)
                    const isRequested = user.friendRequests.find( req => req.toUserId === id || req.fromUserId === id )
                    return(
                      <div key={i}
                        className="rounded border border-gray my-1 p-1 bg-gray-200 hover:bg-indigo-200 cursor-pointer flex content-center justify-center items-center"
                      >
                        <div className="flex flex-col">
                          <p className="text-center text-blue-800 text-sm underline">@{ userName }</p>
                          <p className="text-center text-xs">{ firstName } {lastName}</p>
                        </div>
                        { (!isFriend && !isRequested && id !== user.id) &&
                            <button className="rounded border border-black bg-green-200 p-1 ml-2 text-xs"
                              onClick={onSendFriendRequest({ id, userName })}
                            >
                              Request
                            </button>
                        }
                      </div>
                    )
                  })}
                </div>
              </div>
            </Fragment>
          </div>
        </div>

        {/* End Sidebar */}

        {/* Begin Main */}

        <div className="p-4 flex flex-col flex-wrap w-4/5 bg-gray-100">
          { displayUser &&
            <div className="p-4 mb-4 bg-white rounded shadow-md">
              <h2> 
                <span className="font-semibold mr-1">Username:</span>
                { displayUser.userName }
              </h2>
              <p>
                <span className="font-semibold mr-1">Name:</span>
                { displayUser.firstName } { displayUser.lastName }
              </p>
              <p>
                <span className="font-semibold mr-1">Since:</span>
                { Moment(displayUser.createdAt).format("LLL") }
              </p>
            </div>
          }

          <div className="flex flex-row grid grid-cols-2 bg-white rounded shadow-md">
            <div className="p-4 mb-4">
              <div className="content-center justify-center items-center mb-2">
                <h2 className="underline font-semibold text-center">
                Requests
                </h2>
              </div>
              <div className="flex flex-col">
                { user.friendRequests.length === 0 &&
                <h2>None</h2>
                }
                { user.friendRequests.map(req => {
                  if (req.fromUserId === user.id) {
                    const cache = usersCache[req.toUserId]
                    return(
                      <div key={req.id}
                        className="border border-gray-200 rounded my-1 p-2 bg-gray-200 shadow-md"
                      >
                        <div className="flex flex-row content-center justify-center items-center">
                          <p>Pending friend request to</p>
                          <span className="underline text-blue-400 cursor-pointer ml-1"
                            onClick={() => setDisplayUserId(req.fromUserId)}
                          >
                            { cache ? `${cache.userName} (${cache.firstName} ${cache.lastName})` : "..." }
                          </span>
                        </div>
                      </div>
                    )
                  }
                  const cache = usersCache[req.fromUserId]
                  return(
                    <div key={req.id}
                      className="flex flex-col border rounded my-1 p-2 bg-yellow-200"
                      onMouseEnter={() => setActiveFriendReq(req.id)}
                      onMouseLeave={() => setActiveFriendReq(undefined)}
                    >
                      <div className="flex flex-row">
                        Pending friend request from
                        <span className="underline text-blue-400 cursor-pointer ml-1"
                          onClick={() => setDisplayUserId(req.fromUserId)}
                        >
                          { cache ? cache.userName : "..." }
                        </span>
                      </div>
                      { activeFriendReq === req.id &&
                        <div className="flex flex-row">
                          <button className="rounded mx-1 p-2 underline bg-green-400 cursor-pointer"
                            onClick={onAcceptFriendRequest(req.id, true)}
                          >
                            Accept
                          </button>
                          <button className="rounded mx-1 p-2 underline bg-red-400 cursor-pointer"
                            onClick={onAcceptFriendRequest(req.id, false)}
                          >
                            Reject
                          </button>
                        </div>
                      }
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="p-4 mb-4">
              <div className="content-center justify-center items-center mb-2">
                <h2 className="underline font-semibold text-center">
                Friends
                </h2>
              </div>
              <div className="flex flex-col">
                { user.friendIds.length === 0 &&
                <h2>None</h2>
                }
                { user.friendIds.map(friendId => {
                  const cache = usersCache[friendId]
                  return(
                    <div key={friendId}
                      className="flex flex-row border border-gray-200 rounded my-1 p-2 bg-yellow-200 shadow-md content-center justify-center items-center"
                      onMouseEnter={() => setActiveFriendReq(friendId)}
                      onMouseLeave={() => setActiveFriendReq(undefined)}
                    >
                      <div className="flex flex-row">
                        <span className="underline text-blue-400 cursor-pointer ml-1"
                          onClick={() => setDisplayUserId(friendId)}
                        >
                          { cache ? cache.userName : "..." } ({ cache ? `${cache.firstName} ${cache.lastName}` : "..." })
                        </span>
                      </div>
                    
                      { activeFriendReq === friendId &&
                        <div className="flex flex-row">
                          <button className="rounded ml-2 px-2 py-0.5 underline bg-red-400 cursor-pointer"
                            onClick={onUnfriend( friendId, cache?.userName)}
                          >
                            Unfriend
                          </button>
                        </div>
                      }
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
        {/* End Main */}
      </main>
    </div>
  )
}

const mapStateToProps = (state) => {
  console.log("mapStateToProps", state)
  return {
    user: state.user,
    usersCache: state.usersCache,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    searchFriends: SearchFriends(dispatch),
    sendFriendRequest: SendFriendRequest(dispatch),
    acceptFriendRequest: AcceptFriendRequest(dispatch),
    loadUser: LoadUser(dispatch),
    unfriend: Unfriend(dispatch),
    displayAlert: args => dispatch(newNotification(args))
  }
}
  
Friends.propTypes = {
  user: PropTypes.object,
  usersCache: PropTypes.object,

  acceptFriendRequest: PropTypes.func,
  loadUser: PropTypes.func,
  displayAlert: PropTypes.func,
  searchFriends: PropTypes.func,
  sendFriendRequest: PropTypes.func,
  unfriend: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(Friends)