import React, { useState } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import Moment from "moment"

import { GetRecentUploads, UploadVideo } from "../behavior/coordinators/uploads"
import Sharing from "./Sharing"
import { newNotification } from "../state/ui/action"

const SwingUploader = ({ displayAlert, getRecentUploads, uploadVideo, user }) => {
  const [selectedVideo, setSelectedVideo] = useState(undefined)
  const [isPublic, setIsPublic] = useState(false)
  const [isViewableByFriends, setIsViewableByFriends] = useState(false)
  const [friendIds, setFriendIds] = useState([])
  const [newAlbumName, setNewAlbumName] = useState("")
  const [uploading, setUploading] = useState(false)

  const onUploadVideo = async () => {
    // displayAlert({ id: Moment().toString(), bgColor: "bg-green-300", message: "Uploading... Please do not navigate away from this page" })
    setUploading(true)
    await uploadVideo({
      userId: user?.id,
      file: selectedVideo,
      fileName: selectedVideo.name,
      fileType: selectedVideo.type,
      albumName: newAlbumName,
      isPublic,
      isViewableByFriends,
      friendIds,
      callback: onSuccessfulUpload,
    })
  }

  const onSuccessfulUpload = () => {
    getRecentUploads()
    setSelectedVideo(undefined)
    setNewAlbumName("")
    setIsPublic(false)
    setIsViewableByFriends(false)
    setFriendIds([])
    setUploading(false)
  }

  const onFileChange = e => {
    const file = e.target.files[0]
    if (file.size > 400000000) { // 400 MBs
      displayAlert({ id: Moment().toString(), message: "File size must be below 400 MB (~15 mins)", bgColor: "bg-red-300" })
      return
    }
    setSelectedVideo(e.target.files[0])
  }

  return(
    <div className="flex flex-col">
      <div className="flex flex-col content-center justify-center items-center">
        <input type="file"
          className="rounded bg-gray-200 border border-gray-400 p-2 mb-4 w-60 text-center text-black"
          onChange={onFileChange}
        />
        { selectedVideo &&
          <div >
            <div className="flex flex-col content-center justify-center items-center">
              <p className="p-2">
                Video Type: { selectedVideo.type }
              </p>
              <input id="albumName"
                className="ml-2 p-1 rounded text-center border border-black"
                type="text"
                placeholder="Album Name"
                value={newAlbumName}
                onChange={e => setNewAlbumName(e.target.value)}
                disabled={uploading}
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

              <div className="flex flex-col content-center justify-center items-center mx-1 mt-3 p-2">
                { uploading ?
                  <button className="flex flex-row rounded shadow-lg bg-yellow-300 text-black font-semibold tracking-wide m-2 py-3 px-4"
                    disabled={true}
                  >
                    <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-5 w-5 mr-2"></div>
                    Uploading...
                  </button>
                  :
                  <button className="rounded shadow-lg bg-black text-yellow-300 font-semibold tracking-wide m-2 py-3 px-4"
                    onClick={onUploadVideo}
                  >
                      Upload
                  </button>
                }
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
  return {
    displayAlert: args => dispatch(newNotification(args)),
    getRecentUploads: GetRecentUploads(dispatch),
    uploadVideo: UploadVideo(dispatch),
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