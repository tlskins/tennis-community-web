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
  setIsPublic,
  isViewableByFriends,
  setIsViewableByFriends,
  friendIds,
  setFriendIds,
}) => {
  console.log("sharing", isPublic, isViewableByFriends, friendIds)
  const [friendSearch, setFriendSearch] = useState("")
  const [isSearchingFriends, setIsSearchingFriends] = useState(friendIds.length > 0)

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
    <div className="flex flex-col p-2">
      <p className="mb-2">Share with</p>

      <div className="flex flex-row">
        <input id="public"
          className="mr-2"
          type="checkbox"
          checked={isPublic}
          onChange={e => setIsPublic(e.target.checked)}
        />
        <label htmlFor="public"> Public</label><br></br>
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

      <div className="flex flex-col">
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
  user: PropTypes.object,
  usersCache: PropTypes.object,

  searchFriends: PropTypes.func,
  setIsPublic: PropTypes.func,
  setIsViewableByFriends: PropTypes.func,
  setFriendIds: PropTypes.func,
}
  
export default connect(mapStateToProps, mapDispatchToProps)(Sharing)