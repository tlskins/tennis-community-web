import React, { useEffect, useState, createRef, Fragment } from "react"
import { connect } from "react-redux"
import ReactPlayer from "react-player"
import PropTypes from "prop-types"
import { useRouter } from "next/router"

import Notifications from "../../../../components/Notifications"
import { LoadAlbum, PostComment } from "../../../../behavior/coordinators/albums"


const SWING_FRAMES = 45

const Album = ({
  album,
  loadAlbum,
}) => {
  const router = useRouter()
  const albumId = router.query.albumid
  const swingId = router.query.id && router.query.id[0]
  console.log("query", router)

  const [playbackRate, setPlaybackRate] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [playerRef, setPlayerRef] = useState(undefined)
  const [playerFrame, setPlayerFrame] = useState(0.0)

  const swingVideos = album?.swingVideos || []
  const swing = swingVideos.find( sw => sw.id === swingId )

  useEffect(() => {
    if (albumId && (!album || album.id !== albumId)) {
      loadAlbum(albumId)
    }
  }, [albumId])

  useEffect(() => {
    if (album?.id) {
      setPlayerRef(createRef())
    }
  }, [album?.id])

  const handleSeekChange = (playerRef) => e => {
    const frame = parseInt(e.target.value)
    console.log("handleSeekChange frame", frame)
    if (frame != null) {
      const seekTo = frame === SWING_FRAMES ? 0.9999 : parseFloat((frame/SWING_FRAMES).toFixed(4))
      console.log("handleSeekChange seekTo", seekTo)
      playerRef.current.seekTo(seekTo)
      setPlayerFrame(frame)
    }
  }

  const renderVideo = ({ swing, ref, playing, pip, duration }) => {
    if (!swing) {
      return null
    }

    return(
      <Fragment>
        <ReactPlayer
          className="rounded-md overflow-hidden"
          ref={ref}
          url={swing.videoURL} 
          playing={playing}
          pip={pip}
          volume={0}
          muted={true}
          playbackRate={playbackRate}
          loop={true}
          progressInterval={200}
          onProgress={({ played }) => {
            console.log("onProgress played", played)
            const frame = Math.round(played*SWING_FRAMES)
            console.log("onProgress frame", frame)
            setPlayerFrame(frame)
          }}
          height="452px"
          width="570px"
        />

        {/* Controls Panel */}
        <div className="flex flex-row content-center justify-center p-1 mt-4 bg-gray-100 rounded">
          {/* Play / Pause */}
          { playing &&
            <input type='button'
              className='border w-10 rounded p-0.5 mx-1 text-xs bg-red-700 text-white'
              value='pause'
              onClick={() => setPlaying(!playing)}
            />
          }
          { !playing &&
            <input type='button'
              className='border w-10 rounded p-0.5 mx-1 text-xs bg-green-700 text-white'
              value='play'
              onClick={() => setPlaying(!playing)}
            />
          }
          
          {/* Seek */}
          <input
            type='range'
            value={duration}
            min={0}
            max={SWING_FRAMES}
            step='1'
            onChange={handleSeekChange(ref)}
            onFocus={ e => {
              e.stopPropagation()
              e.preventDefault()
            }}
          />

          <div className="bg-white rounded p-0.5 mx-1 text-xs">
            <span> { duration ? duration : "0" }/{SWING_FRAMES}</span>
          </div>
        </div>
      </Fragment>
    )
  }


  return (
    <div className="flex flex-col h-screen min-h-screen">
      {/* <header>{title}</header> */}
      <Notifications />

      <main className="flex overflow-y-scroll">

        {/* Begin Album Videos */}

        <div className="p-4 flex flex-wrap w-4/5">
          <div className="flex flex-col relative w-1/2 items-center hover:bg-green-200 rounded-md p-2">
            {
              renderVideo({
                swing,
                ref: playerRef,
                playing: playing,
                duration: playerFrame,
              }) 
            }
          </div>
        </div>
        {/* End Album Videos */}
      </main>
    </div>
  )
}

const mapStateToProps = (state) => {
  console.log("mapStateToProps", state)
  return {
    album: state.album,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    loadAlbum: LoadAlbum(dispatch),
    postComment: PostComment(dispatch),
  }
}
  
Album.propTypes = {
  album: PropTypes.object,

  loadAlbum: PropTypes.func,
  postComment: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(Album)