import React, { useEffect, useState, createRef, Fragment } from "react"
import { connect } from "react-redux"
import ReactPlayer from "react-player"
import PropTypes from "prop-types"
import { useRouter } from "next/router"
import Moment from "moment"

import Notifications from "../../../../components/Notifications"
import { LoadAlbum, PostComment } from "../../../../behavior/coordinators/albums"


const SWING_FRAMES = 45

const Album = ({
  album,

  loadAlbum,
  postComment,
}) => {
  const router = useRouter()
  const albumId = router.query.albumid
  const swingId = router.query.id && router.query.id[0]

  const [playing, setPlaying] = useState(false)
  const [playerRef, setPlayerRef] = useState(undefined)
  const [playerFrame, setPlayerFrame] = useState(0.0)
  const [comment, setComment] = useState("")

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
    if (frame != null) {
      const seekTo = frame === SWING_FRAMES ? 0.9999 : parseFloat((frame/SWING_FRAMES).toFixed(4))
      playerRef.current.seekTo(seekTo)
      setPlayerFrame(frame)
    }
  }

  const onPostComment = async () => {
    if (await postComment({ albumId, swingId, text: comment, frame: playerFrame })) {
      loadAlbum(albumId)
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
          playbackRate={1}
          loop={true}
          progressInterval={200}
          onProgress={({ played }) => {
            const frame = Math.round(played*SWING_FRAMES)
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
      <Notifications />
      <main className="flex overflow-y-scroll">
        <div className="py-8 px-24 grid grid-cols-2 gap-4 w-full">
          {/* Swing Video */}
          <div className="flex flex-col items-center p-4">
            {
              renderVideo({
                swing,
                ref: playerRef,
                playing: playing,
                duration: playerFrame,
              }) 
            }
          </div>

          <div className="py-4 px-16">
            <div className="flex flex-col p-4 items-center overscroll-contain border border-black rounded">
              <div className="flex flex-col w-full">
                <div className="flex flex-col border-b-2 border-gray-400">
                  <textarea
                    className="p-2 border border-black rounded"
                    autoFocus={true}
                    placeholder="Comment"
                    rows="4"
                    onChange={e => setComment(e.target.value)}
                  />
                  <div className="flex flex-row">
                    <p className="mx-2 p-2 text-sm text-blue-500 align-middle">
                      { Moment().format("MMM D YYYY H:m a") }
                    </p>
                    <p className="mx-2 p-2 text-sm align-middle font-bold">
                    |
                    </p>
                    <p className="p-2 text-sm align-middle font-medium">
                      frame {playerFrame}
                    </p>
                    <p className="mx-2 p-2 text-sm align-middle font-bold">
                    |
                    </p>
                    <input type='button'
                      className='border w-12 rounded py-0.5 px-2 m-2 text-xs bg-green-700 text-white text-center'
                      value='post'
                      onClick={onPostComment}
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  { (swing.comments || []).map( comment => {
                    return(
                      <div key={comment.id}
                        className="my-1 border border-gray-400 rounded"
                      >
                        <p className="p-2">
                          { comment.text }
                        </p>
                        <p className="py-1 px-0.5 text-xs">
                          @ frame { comment.frame } on { Moment(comment.createdAt).format("MMM D YYYY H:m a") }
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
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