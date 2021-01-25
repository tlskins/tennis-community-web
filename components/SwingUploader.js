import React, { useState } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"

import { GetRecentUploads, UploadVideo } from "../behavior/coordinators/uploads"
import Sharing from "./Sharing"

let uploading = false

const SwingUploader = ({ uploadVideo, user }) => {
  const [selectedVideo, setSelectedVideo] = useState(undefined)
  const [isUploading, setIsUploading] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [isViewableByFriends, setIsViewableByFriends] = useState(false)
  const [friendIds, setFriendIds] = useState([])
  const [newAlbumName, setNewAlbumName] = useState("")

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
        { (isUploading || uploading) &&
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
              <Sharing
                isPublic={isPublic}
                setIsPublic={setIsPublic}
                isViewableByFriends={isViewableByFriends}
                setIsViewableByFriends={setIsViewableByFriends}
                friendIds={friendIds}
                setFriendIds={setFriendIds}
              />

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