import React, { useState, Fragment } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"

import { UploadVideo } from "../behavior/coordinators/uploads"


const Upload = ({ uploadVideo, user }) => {
  const [selectedVideo, setSelectedVideo] = useState(undefined)

  console.log("user",user)

  const onUploadVideo = async () => {
    const response = await uploadVideo({
      userId: user?.id,
      file: selectedVideo,
      fileName: selectedVideo.name,
      fileType: selectedVideo.type,
    })
    console.log(response)
  }

  const onFileChange = e => {
    setSelectedVideo(e.target.files[0])
  }

  return(
    <div className="flex flex-col h-screen min-h-screen">
      <main className="flex flex-1 overflow-y-auto">
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
      </main>
    </div>
  )
}

const mapStateToProps = (state) => {
  console.log("mapstate", state)
  return {
    user: state.user,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    uploadVideo: UploadVideo(dispatch),
  }
}
  
Upload.propTypes = {
  user: PropTypes.object,

  uploadVideo: PropTypes.func,
}
  
export default connect(mapStateToProps, mapDispatchToProps)(Upload)