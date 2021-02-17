import React, { useState, useEffect, Fragment } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"

import { SearchFriends } from "../behavior/coordinators/friends"


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
  const [friendSearch, setFriendSearch] = useState("")
  const [isSearchingFriends, setIsSearchingFriends] = useState(friendIds.length > 0)
  const [isInviting, setIsInviting] = useState(false)

  useEffect(() => {
    if (friendIds.length > 0) {
      const ids = friendIds.filter( id => !usersCache[id])
      if (ids.length > 0) {
        searchFriends({ ids: [ ...ids] })
      }
    }
  }, [friendIds])


  const searchRgx = new RegExp(friendSearch, "gi")
  const searchedFriendIds = user.friendIds.filter( friendId => {
    const friend = usersCache[friendId]
    if (!friend || friendIds.includes(friendId)) {
      return false
    }
    if (friendSearch === "") {
      return true
    }
    return searchRgx.test(friend.userName) || searchRgx.test(friend.firstName) || searchRgx.test(friend.lastName)
  })

  return(
    <div className="flex flex-col p-8 bg-white rounded shadow-lg">
      <p className="mb-2">Share with</p>
      <div className="flex flex-row">
        { user.disablePublicAlbums &&
          <p className="rounded-md p-2 font-semibold bg-red-200 mb-2">Your public sharing has been disabled</p>
        }
        { !user.disablePublicAlbums &&
          <Fragment>
            <input id="public"
              className="mr-2"
              type="checkbox"
              checked={isPublic}
              onChange={e => setIsPublic(e.target.checked)}
            />
            <label htmlFor="public"> Public</label><br></br>
          </Fragment>
        }
      </div>

      <div className="flex flex-row">
        <input id="public"
          className="mr-2"
          type="checkbox"
          checked={isViewableByFriends}
          onChange={e => setIsViewableByFriends(e.target.checked)}
        />
        <label htmlFor="public"> All Friends</label><br></br>
      </div>

      {/* Invite User */}
      { setInvEmail &&
        <div className="flex flex-col">
          <div className="flex flex-row mb-2">
            <input id="inviteUser"
              className="mr-2"
              type="checkbox"
              checked={isInviting}
              onChange={() => setIsInviting(!isInviting)}
            />
            <label htmlFor="inviteUser"> Share by email</label><br></br>
          </div>

          { isInviting &&
              <div className="flex flex-col mb-2">
                <input type="text"
                  className="rounded border border-black p-1 mb-1"
                  placeholder="email"
                  value={invEmail}
                  onChange={e => setInvEmail(e.target.value)}
                />
                <input type="text"
                  className="rounded border border-black p-1 mb-1"
                  placeholder="first name (optional)"
                  value={invFirstName}
                  onChange={e => setInvFirstName(e.target.value)}
                />
                <input type="text"
                  className="rounded border border-black p-1 mb-1"
                  placeholder="last name (optional)"
                  value={invLastName}
                  onChange={e => setInvLastName(e.target.value)}
                />
              </div>
          }
        </div>
      }

      {/* Specific Friends */}
      <div className="flex flex-col relative">
        <div className="flex flex-row">
          <input id="specificFriends"
            className="mr-2"
            type="checkbox"
            checked={isSearchingFriends}
            onChange={e => {
              if (!e.target.checked) {
                setFriendIds([])
              }
              setIsSearchingFriends(e.target.checked)
            }}
          />
          <label htmlFor="specificFriends"> Specific Friends</label><br></br>
        </div>

        { friendIds.length > 0 &&
            <div>
              { friendIds.map( (friendId, i) => {
                const friend = usersCache[friendId]
                return(
                  <div key={friendId}
                    className="rounded border border-black p-1 bg-green-200 cursor-pointer hover:bg-red-200 my-1"
                    onClick={() => setFriendIds([...friendIds.slice(0,i), ...friendIds.slice(i+1,friendIds.length)])}
                  >
                    <p>{ friend ? `@${friend.userName} (${friend.firstName} ${friend.lastName})` : "Loading..."}</p>
                  </div>
                )
              })}
            </div>
        }

        { isSearchingFriends &&
            <Fragment>
              <input type="text"
                className="rounded border border-black p-1 my-2"
                placeholder="search"
                value={friendSearch}
                onChange={e => setFriendSearch(e.target.value)}
              />
              <div>
                { searchedFriendIds.map( friendId => {
                  const friend = usersCache[friendId]
                  return(
                    <div key={friendId}
                      className="rounded border border-black p-1 bg-blue-200 cursor-pointer hover:bg-green-200 my-1"
                      onClick={() => setFriendIds([...friendIds, friendId])}
                    >
                      <p>{ friend ? `@${friend.userName} (${friend.firstName} ${friend.lastName})` : "Loading..."}</p>
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