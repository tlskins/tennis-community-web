import React, { useState } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import Moment from "moment"

import { GetRecentUploads, UploadVideo } from "../behavior/coordinators/uploads"
import Sharing from "./Sharing"
import { newNotification } from "../state/ui/action"

const SwingUploader = ({ displayAlert, uploadVideo, user }) => {
  const [selectedVideo, setSelectedVideo] = useState(undefined)
  const [isPublic, setIsPublic] = useState(false)
  const [isViewableByFriends, setIsViewableByFriends] = useState(false)
  const [friendIds, setFriendIds] = useState([])
  const [newAlbumName, setNewAlbumName] = useState("")

  const onUploadVideo = async () => {
    displayAlert({ id: Moment().toString(), bgColor: "bg-green-300", message: "Uploading..." })
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
    setSelectedVideo(undefined)
  }

  const onFileChange = e => {
    const file = e.target.files[0]
    console.log("filesize bytes", e.target.files[0]?.size)
    if (file.size > 250000000) { // 250 MBs
      displayAlert({ id: Moment().toString(), message: "File size must be below 250MBs", bgColor: "bg-red-300" })
      return
    }
    setSelectedVideo(e.target.files[0])
  }

  return(
    <div className="flex flex-col">
      <div className="flex flex-col content-center justify-center items-center">
        <input type="file"
          className="rounded bg-gray-200 border border-gray-400 p-2 mb-4 w-60 text-center"
          onChange={onFileChange}
        />
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

            <div className="mt-2">
              <Sharing
                isPublic={isPublic}
                setIsPublic={setIsPublic}
                isViewableByFriends={isViewableByFriends}
                setIsViewableByFriends={setIsViewableByFriends}
                friendIds={friendIds}
                setFriendIds={setFriendIds}
              />

              <div className="flex flex-col content-center justify-center items-center mx-1 p-2">
                <button className="border-gray-400 border rounded shadow-lg bg-black text-yellow-300 tracking-wide m-2 p-1"
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
    displayAlert: args => dispatch(newNotification(args)),
    getRecentUploads,
    uploadVideo: UploadVideo(dispatch, getRecentUploads),
  }
}
  
SwingUploader.propTypes = {
  user: PropTypes.object,
  usersCache: PropTypes.object,

  displayAlert: PropTypes.func,
  getRecentUploads: PropTypes.func,
  uploadVideo: PropTypes.func,
}
  
export default connect(mapStateToProps, mapDispatchToProps)(SwingUploader)