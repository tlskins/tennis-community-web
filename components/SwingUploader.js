import React, { useState, Fragment } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"

import { UploadVideo } from "../behavior/coordinators/uploads"

let uploading = false

const SwingUploader = ({ uploadVideo, user }) => {
  const [selectedVideo, setSelectedVideo] = useState(undefined)

  const onUploadVideo = async () => {
    if (uploading) {
      return
    }
    uploading = true
    const response = await uploadVideo({
      userId: user?.id,
      file: selectedVideo,
      fileName: selectedVideo.name,
      fileType: selectedVideo.type,
    })
    console.log(response)
    uploading = false
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
              Upload
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
  return {
    uploadVideo: UploadVideo(dispatch),
  }
}
  
SwingUploader.propTypes = {
  user: PropTypes.object,

  uploadVideo: PropTypes.func,
}
  
export default connect(mapStateToProps, mapDispatchToProps)(SwingUploader)