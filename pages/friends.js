import React, { useEffect, useState, createRef, useRef, Fragment } from "react"
import { connect } from "react-redux"
import ReactPlayer from "react-player"
import PropTypes from "prop-types"
import Moment from "moment-timezone"
import Link from "next/link"
import { useRouter } from "next/router"

import Notifications from "../components/Notifications"
import { SearchFriends, SendFriendRequest, AcceptFriendRequest, Unfriend } from "../behavior/coordinators/friends"
import { LoadUser } from "../behavior/coordinators/users"

let timer

const Friends = ({
  user,
  searchFriends,
}) => {
  const router = useRouter()
  //   const userId = router.query.id && router.query.id[0]

  const [activeSideBar, setActiveSidebar] = useState("Search Users")
  const [search, setSearch] = useState("")
  const [foundUsers, setFoundUsers] = useState([])

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
    setSearch(e.target.value)
    executeAfterTimeout(async () => {
      const friends = await searchFriends({ search: e.target.value })
      setFoundUsers(friends)
    }, 700)
  }

  return (
    <div className="flex flex-col h-screen min-h-screen">
      {/* <header>{title}</header> */}
      <Notifications />

      <main className="flex flex-1 overflow-y-auto">

        {/* Begin Sidebar */}

        <div className="h-screen top-0 sticky p-4 bg-white w-1/5 overflow-y-scroll">
          <div className="flex flex-col content-center justify-center items-center text-sm">

            {/* Search Users Sidebar */}
            <Fragment>
              <h2 className="text-blue-400 underline cursor-pointer"
                onClick={ () => {
                  setActiveSidebar(activeSideBar === "Search Users" ? "" : "Search Users")
                }}
              >
                Search Users
              </h2>
              <div className="mb-2 flex flex-col">
                { activeSideBar === "Search Users" &&
                    <Fragment>
                      <input type="text"
                        className="rounded border border-black m-1 p-1"
                        value={search}
                        onChange={onSearchUsers}
                      />
                      <div>
                        { foundUsers.map((user, i) => {
                          return(
                            <div key={i}>
                              { user.firstName } { user.lastName}
                            </div>
                          )
                        })}
                      </div>
                    </Fragment>
                }
              </div>
            </Fragment>

            {/* Friends Sidebar */}
            <Fragment>
              <h2 className="text-blue-400 underline cursor-pointer"
                onClick={ () => setActiveSidebar("Friends")}
              >
                Friends
              </h2>
            </Fragment>

          </div>
        </div>

        {/* End Sidebar */}

        {/* Begin Main */}

        <div className="p-4 flex flex-wrap w-4/5">
          Main
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
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    searchFriends: SearchFriends(dispatch),
    sendFriendRequest: SendFriendRequest(dispatch),
    acceptFriendRequest: AcceptFriendRequest(dispatch),
    unfriend: Unfriend(dispatch),
  }
}
  
Friends.propTypes = {
  user: PropTypes.object,

  acceptFriendRequest: PropTypes.func,
  searchFriends: PropTypes.func,
  sendFriendRequest: PropTypes.func,
  unfriend: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(Friends)