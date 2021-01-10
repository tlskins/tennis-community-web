import React, { useEffect, useState, Fragment } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import Moment from "moment-timezone"

import Notifications from "../../components/Notifications"
import { LoadAlbums, CreateAlbum } from "../../behavior/coordinators/albums"
import { SearchFriends } from "../../behavior/coordinators/friends"
import { toggleFlashNotification } from "../../state/ui/action"
import SwingUploader from "../../components/SwingUploader"

const AlbumsPerPage = 3
const SwingsPerPage = 6

const NewAlbum = ({
  user,
  usersCache,
  albums,
  
  createAlbum,
  displayAlert,
  loadAlbums,
  searchFriends,
}) => {
  const [uploadType, setUploadType] = useState("File")
  const [albumsPage, setAlbumsPage] = useState(0)
  const [albumPage, setAlbumPage] = useState(0)
  const [activeSelectedSwing, setActiveSelectedSwing] = useState(0)
  const [activeAlbum, setActiveAlbum] = useState(undefined)
  const [albumView, setAlbumView] = useState("gif")
  const [selectedSwings, setSelectedSwings] = useState([])
  const [newAlbumName, setNewAlbumName] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [isViewableByFriends, setIsViewableByFriends] = useState(false)
  const [friendIds, setFriendIds] = useState([])
  const [friendSearch, setFriendSearch] = useState("")

  const activeAlbums = albums.slice(albumsPage * AlbumsPerPage, (albumsPage+1) * AlbumsPerPage)
  const activeSwings = activeAlbum?.swingVideos.slice(albumPage * SwingsPerPage, (albumPage+1) * SwingsPerPage) || []
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

  useEffect(() => {
    loadAlbums()
  }, [])

  useEffect(() => {
    if (user.friendRequests.length > 0) {
      const ids = user.friendIds.filter( id => !usersCache[id])
      if (ids.length > 0) {
        searchFriends({ ids: [ ...ids, ...user.friendIds] })
      }
    }
  }, [user.friendIds])

  const onSelectAlbum = album => () => {
    setAlbumPage(0)
    if (!activeAlbum || activeAlbum.id !== album.id) {
      setActiveAlbum(album)
      return
    }
    setActiveAlbum(undefined)
  }

  const onSelectSwing = swing => () => {
    const idx = selectedSwings.findIndex( sw => sw.id === swing.id)
    if (idx === -1) {
      setSelectedSwings([...selectedSwings, swing])
      return
    }
    setSelectedSwings([...selectedSwings.slice(0,idx), ...selectedSwings.slice(idx+1,selectedSwings.length)])
  }

  const onUnselectSwing = swingIdx => () => {
    setSelectedSwings([...selectedSwings.slice(0,swingIdx), ...selectedSwings.slice(swingIdx+1,selectedSwings.length)])
  }

  const onSaveAlbum = async () => {
    if ( await createAlbum({
      name: newAlbumName,
      status: "Created",
      swingVideos: selectedSwings,
      isPublic,
      isViewableByFriends,
      friendIds,
    })) {
      displayAlert({
        alertType: "success",
        message: `Album ${newAlbumName} Successfully Created`,
      })
      clearForm()
    }
  }

  const clearForm = () => {
    setUploadType("File")
    setAlbumsPage(0)
    setAlbumPage(0)
    setActiveSelectedSwing(0)
    setActiveAlbum(undefined)
    setAlbumView("gif")
    setSelectedSwings([])
    setNewAlbumName("")
    setIsPublic(false)
    setIsViewableByFriends(false)
    setFriendIds([])
    setFriendSearch("")
  }

  return (
    <div className="flex flex-col h-screen min-h-screen">
      <Notifications />

      <main className="flex flex-1 flex-col overflow-y-auto">

        {/* Begin Main */}

        <div className="p-4 flex flex-row flex-wrap w-full">
          <h2>Create Album From</h2>
          <select className="ml-1 border rounded border-black p-1"
            onChange={e => setUploadType(e.target.value)}
          >
            <option value="File">File</option>
            <option value="Album">Album</option>
          </select>
        </div>

        { uploadType === "File" &&
            <div className="p-4 flex flex-col flex-wrap w-full">
              <SwingUploader />
            </div>
        }

        { uploadType === "Album" &&
            <div className="p-4 flex flex-col">

              {/* Begin My Albums Row */}

              <div className="flex flex-row w-full">
                { albumPage > 1 &&
                    <button onClick={() => setAlbumsPage(albumsPage-1)}>&lt;</button>
                }
                { activeAlbums.map( album => {
                  const bg = activeAlbum?.id === album.id ? "bg-gray-300" : ""
                  return(
                    <div key={album.id}
                      className={`w-1/5 mx-4 p-2 rounded hover:bg-gray-200 cursor-pointer ${bg}`}
                      onClick={onSelectAlbum(album)}
                    >
                      <p>{ album.name } ({ album.swingVideos.length })</p>
                      <p>Created: { Moment(album.createdAt).format("LLL") }</p>
                      <img src={album.swingVideos[0]?.gifURL}
                        alt="loading..."
                        style={{height: 226, width: 285}}
                      />
                    </div>
                  )
                })}
                { activeAlbums.length === AlbumsPerPage &&
                    <button onClick={() => setAlbumsPage(albumsPage+1)}>&gt;</button>
                }
              </div>
              <div>Page { albumsPage+1 }</div>

              {/* Begin Active Album Swings Row */}

              { activeAlbum &&
                <Fragment>
                  <div className="flex flex-row w-full">
                    { albumPage > 0 &&
                    <button onClick={() => setAlbumPage(albumPage-1)}>&lt;</button>
                    }
                    { activeSwings.map( (swing, i) => {
                      const url = albumView === "gif" ? swing.gifURL : swing.jpgURL
                      const bg = selectedSwings.some( sw => sw.id == swing.id) ? "bg-green-200" : ""
                      return(
                        <div key={swing.id}
                          className={`w-1/5 mx-4 p-2 rounded hover:bg-gray-200 cursor-pointer ${bg}`}
                          onClick={onSelectSwing(swing)}
                        >
                          <p>Swing { i+1 + (albumPage*SwingsPerPage) }</p>
                          <img src={url}
                            alt="loading..."
                            style={{height: 226, width: 285}}
                          />
                        </div>
                      )
                    })}
                    { activeSwings.length === SwingsPerPage &&
                    <button onClick={() => setAlbumPage(albumPage+1)}>&gt;</button>
                    }
                  </div>
                  <select onChange={e => setAlbumView(e.target.value)}>
                    <option value="gif">GIFs</option>
                    <option value="jpg">JPGs</option>
                  </select>
                  <div>Page { albumPage+1 }</div>
                </Fragment>
              }

              {/* Begin Selected Swings Row */}

              { selectedSwings.length > 0 &&
                <div className="flex flex-row content-center justify-center items-center p-2">
                  <div className="flex flex-col mr-4 p-2">
                    <p className="mb-2">Share with</p>

                    <div className="flex flex-row">
                      <input id="public"
                        className="mr-2"
                        type="checkbox"
                        value={isPublic}
                        onChange={e => setIsPublic(e.target.checked)}
                      />
                      <label htmlFor="public"> Public</label><br></br>
                    </div>

                    <div className="flex flex-row">
                      <input id="public"
                        className="mr-2"
                        type="checkbox"
                        value={isViewableByFriends}
                        onChange={e => setIsViewableByFriends(e.target.checked)}
                      />
                      <label htmlFor="public"> All Friends</label><br></br>
                    </div>

                    <div className="flex flex-col">
                      <label> Specific Friends</label>
                      <div>
                        { friendIds.map( (friendId, i) => {
                          const friend = usersCache[friendId]
                          return(
                            <div key={friendId}
                              className="rounded border border-black p-1 bg-green-200 cursor-pointer hover:bg-red-200 my-1"
                              onClick={() => setFriendIds([...friendIds.slice(0,i), ...friendIds.slice(i+1,friendIds.length)])}
                            >
                              <p>{ friend?.userName } ({ friend?.firstName })</p>
                            </div>
                          )
                        })}
                      </div>

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
                              <p>{ friend?.userName } ({ friend?.firstName })</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col content-center justify-center items-center mx-1 p-2">
                    <input type="text"
                      placeholder="Name"
                      value={newAlbumName}
                      onChange={e => setNewAlbumName(e.target.value)}
                    />
                  
                    <div className="flex flex-row my-1">
                      { activeSelectedSwing > 0 &&
                        <button onClick={() => setActiveSelectedSwing(activeSelectedSwing-1)}>&lt;</button>
                      }
                      <div className="mx-4 p-2 rounded hover:bg-red-200 cursor-pointer"
                        onClick={onUnselectSwing(activeSelectedSwing)}
                      >
                        <p>{ activeSelectedSwing+1 }/{ selectedSwings.length }</p>
                        <img src={selectedSwings[activeSelectedSwing].gifURL}
                          alt="loading..."
                          style={{height: 226, width: 285}}
                        />
                      </div>
                      { selectedSwings.length-1 > activeSelectedSwing &&
                        <button onClick={() => setActiveSelectedSwing(activeSelectedSwing+1)}>&gt;</button>
                      }
                    </div>

                    <button className="rounded border border-black p-1 my-1 w-12 bg-green-300"
                      onClick={onSaveAlbum}
                      value="Save"
                    >
                        Save
                    </button>
                  </div>
                </div>
              }
            </div>
        }
        
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
    albums: state.albums,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    createAlbum: CreateAlbum(dispatch),
    loadAlbums: LoadAlbums(dispatch),
    searchFriends: SearchFriends(dispatch),
    displayAlert: ({ alertType, message }) => dispatch(toggleFlashNotification({
      on: true,
      alertType,
      message,
    }))
  }
}
  
NewAlbum.propTypes = {
  user: PropTypes.object,
  albums: PropTypes.arrayOf(PropTypes.object),
  usersCache: PropTypes.object,

  createAlbum: PropTypes.func,
  loadAlbums: PropTypes.func,
  searchFriends: PropTypes.func,
  displayAlert: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(NewAlbum)