import React, { useEffect, useState, Fragment } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import Moment from "moment-timezone"

import Notifications from "../../components/Notifications"
import SwingUploader from "../../components/SwingUploader"
import HowToUpload from "../../components/HowToUpload"

import Sharing from "../../components/Sharing"
import { LoadMyAlbums, CreateAlbum } from "../../behavior/coordinators/albums"
import { SearchFriends } from "../../behavior/coordinators/friends"
import { newNotification } from "../../state/ui/action"

const AlbumsPerPage = 4
const SwingsPerPage = 6

const NewAlbum = ({
  user,
  usersCache,
  myAlbums,
  
  createAlbum,
  displayAlert,
  loadMyAlbums,
  searchFriends,
}) => {
  const [uploadType, setUploadType] = useState("File")
  const [albumsPage, setAlbumsPage] = useState(0)
  const [albumPage, setAlbumPage] = useState(0)
  const [activeSelectedSwing, setActiveSelectedSwing] = useState(0)
  const [activeAlbum, setActiveAlbum] = useState(undefined)
  const [selectedSwings, setSelectedSwings] = useState([])
  const [newAlbumName, setNewAlbumName] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [isViewableByFriends, setIsViewableByFriends] = useState(false)
  const [friendIds, setFriendIds] = useState([])

  const activeAlbums = myAlbums.slice(albumsPage * AlbumsPerPage, (albumsPage+1) * AlbumsPerPage)
  const activeSwings = activeAlbum?.swingVideos.slice(albumPage * SwingsPerPage, (albumPage+1) * SwingsPerPage) || []

  useEffect(() => {
    loadMyAlbums()
  }, [])

  useEffect(() => {
    if (user?.friendIds.length > 0) {
      const ids = user.friendIds.filter( id => !usersCache[id])
      if (ids.length > 0) {
        searchFriends({ ids: [ ...ids, ...user.friendIds] })
      }
    }
  }, [user?.friendIds])

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
    displayAlert({ id: Moment().toString(), message: "Uploading..." })
    if ( await createAlbum({
      name: newAlbumName,
      status: "Created",
      swingVideos: selectedSwings,
      isPublic,
      isViewableByFriends,
      friendIds,
    })) {
      displayAlert({ id: Moment().toString(), message: `Album "${newAlbumName}" Successfully Created` })
      clearForm()
    }
  }

  const clearForm = () => {
    setUploadType("File")
    setAlbumsPage(0)
    setAlbumPage(0)
    setActiveSelectedSwing(0)
    setActiveAlbum(undefined)
    setSelectedSwings([])
    setNewAlbumName("")
    setIsPublic(false)
    setIsViewableByFriends(false)
    setFriendIds([])
  }

  return (
    <div>
      { (user && user.id) &&
        <Notifications />
      }

      <main className="overflow-y-scroll bg-gray-100">
        <div className="lg:flex flex-col block">
          {/* Begin Main */}

          <div className="mt-1">
            <HowToUpload isFirst={myAlbums.length === 0} />
          </div>

          <div className="p-4 flex flex-col bg-gray-100 rounded-md content-center justify-center items-center mb-6">
            <div className="w-full p-4 flex flex-col content-center justify-center items-center border border-black shadow-md">
              <h2 className="text-center underline text-lg font-semibold mb-2">
                Create Album From
              </h2>
              <select className="mt-2 border rounded border-black p-1"
                onChange={e => setUploadType(e.target.value)}
              >
                <option value="File">File</option>
                <option value="Album">Existing Album(s)</option>
              </select>
            </div>

            { uploadType === "File" &&
              <div className="p-4 flex flex-col content-center justify-center items-center w-full">
                <SwingUploader />
              </div>
            }
          </div>
          { uploadType === "Album" &&
            <Fragment>
              <div className="p-4 flex flex-col bg-gray-100 rounded-md content-center justify-center items-center mb-2">

                {/* Begin My Albums Row */}

                <div className="w-full content-center justify-center items-center mb-4 border border-black shadow-md">
                  <h2 className="text-center underline text-lg font-semibold mb-2">
                    Select Album
                  </h2>

                  <div className="flex flex-row overflow-x-scroll content-center items-center">
                    { albumsPage > 0 &&
                      <button onClick={() => setAlbumsPage(albumsPage-1)}>&lt;</button>
                    }

                    <div className="flex flex-row lg:w-full lg:justify-between">
                      { activeAlbums.map( album => {
                        const bg = activeAlbum?.id === album.id ? "bg-gray-300" : ""
                        return(
                          <div key={album.id}
                            className={`mx-4 w-72 rounded hover:bg-gray-200 cursor-pointer content-center justify-center items-center ${bg}`}
                            onClick={onSelectAlbum(album)}
                          >
                            <div className="mb-2 rounded bg-blue-100 border border-gray-200 shadow">
                              <p><span className="font-semibold mr-1">Album:</span>{ album.name }</p>
                              <p><span className="font-semibold mr-1">Swings:</span>{ album.swingVideos.length }</p>
                              <p><span className="font-semibold mr-1">Created:</span>{ Moment(album.createdAt).format("lll") }</p>
                            </div>
                            <div className="w-full">
                              <img src={album.swingVideos[0]?.gifURL}
                                alt="loading..."
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    
                    { activeAlbums.length === AlbumsPerPage &&
                      <button onClick={() => setAlbumsPage(albumsPage+1)}>&gt;</button>
                    }
                  </div>
                  <p className="text-center">Page { albumsPage+1 }</p>
                </div>
              </div>

              { activeAlbum &&
                <div className="p-4 flex flex-col bg-gray-100 rounded-md content-center justify-center items-center mb-2">
                  {/* Begin Active Album Swings Row */}

                  <div className="w-full content-center justify-center items-center mb-4 border border-black shadow-md">
                    <h2 className="text-center underline text-lg font-semibold mb-2">
                      Select Swings
                    </h2>

                    <div className="flex flex-row overflow-x-scroll content-center items-center">
                      { albumPage > 0 &&
                          <button onClick={() => setAlbumPage(albumPage-1)}>&lt;</button>
                      }

                      <div className="flex flex-row lg:w-full lg:justify-between">
                        { activeSwings.map( swing => {
                          const bg = selectedSwings.some( sw => sw.id == swing.id) ? "bg-green-200" : ""
                          return(
                            <div key={swing.id}
                              className={`mx-4 w-72 rounded hover:bg-gray-200 cursor-pointer content-center justify-center items-center ${bg}`}
                              onClick={onSelectSwing(swing)}
                            >
                              <p>Swing: { swing.name }</p>
                              <img src={swing.gifURL}
                                alt="loading..."
                              />
                            </div>
                          )
                        })}
                      </div>
                      
                      { activeSwings.length === SwingsPerPage &&
                          <button onClick={() => setAlbumPage(albumPage+1)}>&gt;</button>
                      }
                    </div>
                    <p className="text-center">Page { albumPage+1 }</p>
                  </div>
                </div>
              }

              {/* Begin Selected Swings Row */}

              { selectedSwings.length > 0 &&
                <div className="p-4 flex flex-col bg-gray-100 rounded-md content-center justify-center items-center">
                  <div className="w-full content-center justify-center items-center mb-4 border border-black shadow-md">
                    <h2 className="text-center underline text-lg font-semibold mb-2">
                      Finalize Upload
                    </h2>

                    <div className="lg:flex flex-row content-center justify-center items-center p-2 w-full">
                      <div className="flex flex-col content-center justify-center items-center h-full">
                        <input id="albumName"
                          className="ml-2 mb-2 p-1 w-2/3 rounded text-center border border-black"
                          type="text"
                          placeholder="Album Name"
                          value={newAlbumName}
                          onChange={e => setNewAlbumName(e.target.value)}
                        />

                        <Sharing
                          isPublic={isPublic}
                          setIsPublic={setIsPublic}
                          isViewableByFriends={isViewableByFriends}
                          setIsViewableByFriends={setIsViewableByFriends}
                          friendIds={friendIds}
                          setFriendIds={setFriendIds}
                        />
                      </div>
                      
                      <div className="flex flex-col content-center justify-center items-center mx-1 p-2">
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
                  </div>
                </div>
              }
            </Fragment>
          }
          {/* End Main */}
        </div>
      </main>
    </div>
  )
}

const mapStateToProps = (state) => {
  console.log("mapStateToProps", state)
  return {
    user: state.user,
    usersCache: state.usersCache,
    myAlbums: state.albums.myAlbums,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    createAlbum: CreateAlbum(dispatch),
    loadMyAlbums: LoadMyAlbums(dispatch),
    searchFriends: SearchFriends(dispatch),
    displayAlert: args => dispatch(newNotification(args))
  }
}
  
NewAlbum.propTypes = {
  user: PropTypes.object,
  myAlbums: PropTypes.arrayOf(PropTypes.object),
  usersCache: PropTypes.object,

  createAlbum: PropTypes.func,
  loadMyAlbums: PropTypes.func,
  searchFriends: PropTypes.func,
  displayAlert: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(NewAlbum)