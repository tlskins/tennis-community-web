import React, { useState, Fragment } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"

import { GetRecentUploads, UploadVideo } from "../behavior/coordinators/uploads"

let uploading = false

const SwingUploader = ({ uploadVideo, user, usersCache }) => {
  const [selectedVideo, setSelectedVideo] = useState(undefined)
  const [isUploading, setIsUploading] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [isViewableByFriends, setIsViewableByFriends] = useState(false)
  const [friendIds, setFriendIds] = useState([])
  const [friendSearch, setFriendSearch] = useState("")
  const [isSearchingFriends, setIsSearchingFriends] = useState(false)
  const [newAlbumName, setNewAlbumName] = useState("")

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

  const onUploadVideo = async () => {
    if (uploading || isUploading) {
      return
    }
    uploading = true
    setIsUploading(true)
    await uploadVideo({
      userId: user?.id,
      file: selectedVideo,
      fileName: selectedVideo.name,
      fileType: selectedVideo.type,
      albumName: newAlbumName,
      isPublic,
      isViewableByFriends,
      friendIds,
    })
    uploading = false
    setIsUploading(false)
    setSelectedVideo(undefined)
  }

  const onFileChange = e => {
    setSelectedVideo(e.target.files[0])
  }

  return(
    <div className="flex flex-col">
      <div className="flex flex-col content-center justify-center items-center p-2">
        <input type="file"
          onChange={onFileChange}
        />
        { isUploading &&
          <h2>Uploading...</h2>
        }
        { selectedVideo &&
          <div >
            <div>
              <p className="p-2">
                Video Type: { selectedVideo.type }
              </p>
              <input id="albumName"
                className="ml-2 p-1 rounded text-center border border-black"
                type="text"
                placeholder="Album Name"
                value={newAlbumName}
                onChange={e => setNewAlbumName(e.target.value)}
              />
            </div>

            <div className="mt-12">
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
                  <div className="flex flex-row">
                    <input id="specificFriends"
                      className="mr-2"
                      type="checkbox"
                      value={isSearchingFriends}
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
                            <p>{ friend?.userName } ({ friend?.firstName })</p>
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
                              <p>{ friend?.userName } ({ friend?.firstName })</p>
                            </div>
                          )
                        })}
                      </div> 
                    </Fragment>
                  }
                </div>
              </div>

              <div className="flex flex-col content-center justify-center items-center mx-1 p-2">
                <button className="border-black border rounded m-2 p-1"
                  onClick={onUploadVideo}
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    usersCache: state.usersCache,
  }
}

const mapDispatchToProps = (dispatch) => {
  const getRecentUploads = GetRecentUploads(dispatch)
  return {
    getRecentUploads,
    uploadVideo: UploadVideo(dispatch, getRecentUploads),
  }
}
  
SwingUploader.propTypes = {
  user: PropTypes.object,
  usersCache: PropTypes.object,

  getRecentUploads: PropTypes.func,
  uploadVideo: PropTypes.func,
}
  
export default connect(mapStateToProps, mapDispatchToProps)(SwingUploader)