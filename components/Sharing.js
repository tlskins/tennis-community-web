import React, { useState, useEffect, Fragment } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"

import { SearchFriends } from "../behavior/coordinators/friends"


let timer

const Sharing = ({
  // redux
  user,
  usersCache,

  searchFriends,
  // inherited
  isPublic,
  isViewableByFriends,
  setIsViewableByFriends,
  showUsage,
  friendIds,
  invEmail,
  invFirstName,
  invLastName,

  setIsPublic,
  setFriendIds,
  setInvEmail,
  setInvFirstName,
  setInvLastName,
}) => {
  const [isSearchingFriends, setIsSearchingFriends] = useState(friendIds.length > 0)
  const [friendSearch, setFriendSearch] = useState("")
  const [searchedFriends, setSearchedFriends] = useState([])
  const [isInviting, setIsInviting] = useState(false)

  useEffect( () => {
    if (friendIds.length > 0) {
      const ids = friendIds.filter( id => !usersCache[id])
      if (ids.length > 0) {
        searchFriends({ ids: [ ...ids] })
      }
    }
  }, [friendIds])

  const executeAfterTimeout = (func, timeout) => {
    if ( timer ) {
      clearTimeout( timer )
    }
    timer = undefined
    timer = setTimeout(() => {
      func()
    }, timeout )
  }

  const onSearchFriends = text => async () => {
    const friends = await searchFriends({ search: text, limit: 10 })
    setSearchedFriends(friends)
  }

  const onSearchFriendsThrottle = async text => {
    setFriendSearch(text)
    executeAfterTimeout(onSearchFriends( text ), 600)
  }

  return(
    <div className="flex flex-col p-8 bg-gray-300 rounded shadow-lg">
      {/* <p className="mb-2 font-semibold tracking-wide">Share with</p> */}
      
      <div className="flex flex-col mr-5">
        { user.disablePublicAlbums &&
          <p className="rounded-md p-2 font-semibold bg-red-200 mb-2">Your public sharing has been disabled</p>
        }
        { !user.disablePublicAlbums &&
          <div className="flex flex-row">
            <input
              className="mr-2"
              type="checkbox"
              checked={isPublic}
              onChange={e => setIsPublic(e.target.checked)}
            />
            <span className="font-semibold text-sm text-center"> Public</span>
          </div>
        }
      </div>

      <div className="flex flex-col mr-5">
        <div className="flex flex-row">
          <input
            className="mr-2"
            type="checkbox"
            checked={isViewableByFriends}
            onChange={e => setIsViewableByFriends(e.target.checked)}
          />
          <span className="font-semibold text-sm text-center"> All friends</span>
        </div>
      </div>

      { setInvEmail &&
        <div className="flex flex-col mr-5">
          <div className="flex flex-row">
            <input id="inviteUser"
              className="mr-2"
              type="checkbox"
              checked={isInviting}
              onChange={() => setIsInviting(!isInviting)}
            />
            <span className="font-semibold text-sm text-center"> By email</span>
          </div>

          { isInviting &&
              <div className="flex flex-col mr-2 mt-2">
                <input type="text"
                  className="rounded text-xs p-1 mb-1 rounded bg-gray-100 shadow-lg"
                  placeholder="email"
                  value={invEmail}
                  onChange={e => setInvEmail(e.target.value)}
                />
                <input type="text"
                  className="rounded text-xs p-1 mb-1 rounded bg-gray-100 shadow-lg"
                  placeholder="first name (optional)"
                  value={invFirstName}
                  onChange={e => setInvFirstName(e.target.value)}
                />
                <input type="text"
                  className="rounded text-xs p-1 mb-1 rounded bg-gray-100 shadow-lg"
                  placeholder="last name (optional)"
                  value={invLastName}
                  onChange={e => setInvLastName(e.target.value)}
                />
              </div>
          }
        </div>
      }

      {/* Specific Friends */}
      <div className="flex flex-col mr-5">
        <div className="flex flex-row">
          <input
            className="mr-2"
            type="checkbox"
            checked={isSearchingFriends}
            onChange={e => {
              if (!e.target.checked) setFriendIds([])
              setIsSearchingFriends(e.target.checked)
            }}
          />
          <span className="font-semibold text-sm text-center"> Requesting feedback</span>
        </div>

        { friendIds.length > 0 &&
            <div className="max-h-20 overflow-y-auto w-full bg-white p-1 border border-white rounded">
              { friendIds.map( (friendId, i) => {
                const friend = usersCache[friendId]
                return(
                  <div key={friendId}
                    className="rounded shadow-lg text-xs font-semibold bg-green-300 py-1 px-1.5 cursor-pointer hover:bg-red-200 mt-1"
                    onClick={() => setFriendIds([...friendIds.slice(0,i), ...friendIds.slice(i+1,friendIds.length)])}
                  >
                    <p>{ friend ? `${friend.firstName} ${friend.lastName}` : "Loading..."}</p>
                  </div>
                )
              })}
            </div>
        }

        { isSearchingFriends &&
            <Fragment>
              <input type="text"
                className="rounded border border-black p-1 my-2 text-xs"
                placeholder="search"
                value={friendSearch}
                onChange={e => onSearchFriendsThrottle(e.target.value)}
              />

              <div className="max-h-20 overflow-y-auto bg-white p-1 border border-white rounded">
                { searchedFriends.map( friend => {
                  return(
                    <div key={friend.id}
                      className="rounded shadow-lg text-xs font-semibold bg-blue-300 py-1 px-1.5 cursor-pointer hover:bg-green-300 mt-1"
                      onClick={() => setFriendIds([...friendIds, friend.id])}
                    >
                      <p>{ `@${friend.userName} (${friend.firstName} ${friend.lastName})` }</p>
                    </div>
                  )
                })}
              </div> 
            </Fragment>
        }

        { showUsage &&
            <div className="absolute -my-20 mx-32 w-60 bg-yellow-300 text-black text-xs font-semibold tracking-wide rounded shadow py-1.5 px-4 bottom-full z-10">
              <ul className="list-disc pl-6">
                <li>Public - All users can view and comment on your album</li>
                <li>Friends - Only friends can view and comment on your album</li>
                <li>Email - Send album to email address, invites user to create an account and comment</li>
                <li>Specific Friends - Sends email reminder to friends to review your album</li>
              </ul>
            </div>
        }
      </div>
    </div>
  )
}

const mapDispatchToProps = (dispatch) => {
  return {
    searchFriends: SearchFriends(dispatch),
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    usersCache: state.usersCache,
  }
}

Sharing.propTypes = {
  isPublic: PropTypes.bool,
  isViewableByFriends: PropTypes.bool,
  friendIds: PropTypes.arrayOf(PropTypes.string),
  invEmail: PropTypes.string,
  invFirstName: PropTypes.string,
  invLastName: PropTypes.string,
  showUsage: PropTypes.bool,
  user: PropTypes.object,
  usersCache: PropTypes.object,

  searchFriends: PropTypes.func,
  setIsPublic: PropTypes.func,
  setIsViewableByFriends: PropTypes.func,
  setFriendIds: PropTypes.func,
  setInvEmail: PropTypes.func,
  setInvFirstName: PropTypes.func,
  setInvLastName: PropTypes.func,
}
  
export default connect(mapStateToProps, mapDispatchToProps)(Sharing)