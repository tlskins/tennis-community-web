import React, { useState, Fragment } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import Moment from "moment"

import { GetRecentUploads, UploadVideo } from "../behavior/coordinators/uploads"

let uploading = false
let refreshUploadsTimer
let lastUpload

const SwingUploader = ({ uploadVideo, getRecentUploads, user }) => {
  const [selectedVideo, setSelectedVideo] = useState(undefined)
  const [isUploading, setIsUploading] = useState(false)

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
    })
    uploading = false
    setIsUploading(false)

    // console.log("refreshUploadsTimer", refreshUploadsTimer)
    // lastUpload = Moment()
    // refreshUploadsTimer = setInterval(async () => {
    //   console.log("refreshing... ", lastUpload)
    //   await getRecentUploads()
    //   if (Moment().isAfter(lastUpload.add(12, "minutes"))) {
    //     refreshUploadsTimer = undefined
    //   }
    // }, 60000)
  }

  const onFileChange = e => {
    setSelectedVideo(e.target.files[0])
  }

  return(
    <div className="flex flex-col">
      <div className="flex flex-col p-8">
        <input type="file"
          onChange={onFileChange}
        />
        { selectedVideo &&
            <Fragment>
              <button className="border-black border rounded m-2 p-1"
                onClick={onUploadVideo}
              >
                { uploading ? "Uploading..." : "Upload" }
              </button>
              <div>
                <p className="p-2">
                Video Type: { selectedVideo.type }
                </p>
              </div>
            </Fragment>
        }
      </div>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
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

  getRecentUploads: PropTypes.func,
  uploadVideo: PropTypes.func,
}
  
export default connect(mapStateToProps, mapDispatchToProps)(SwingUploader)