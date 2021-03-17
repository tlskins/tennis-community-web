import React, { useEffect, useState, createRef } from "react"
import { connect } from "react-redux"
import ReactPlayer from "react-player"
import PropTypes from "prop-types"
import { useRouter } from "next/router"
import { FaPlayCircle, FaRegPauseCircle } from "react-icons/fa"
import { IconContext } from "react-icons"

import { LoadAlbum, UpdateSwing } from "../behavior/coordinators/albums"
import { SearchFriends } from "../behavior/coordinators/friends"
import CommentsListAndForm from "./CommentsListAndForm"
import pencil from "../public/pencil.svg"

const SWING_FRAMES = 60
let timer

const executeAfterTimeout = (func, timeout) => {
  if ( timer ) {
    clearTimeout( timer )
  }
  timer = undefined
  timer = setTimeout(() => {
    func()
  }, timeout )
}

const SwingModal = ({
  album,
  swingId,
  user,
  usersCache,

  loadAlbum,
  searchFriends,
  updateSwing,
}) => {
  const router = useRouter()
  const albumId = router.query.id && router.query.id[0]
  const swingVideos = album?.swingVideos || []
  const swing = swingVideos.find( sw => sw.id === swingId )

  const [name, setName] = useState(swing?.name)
  const [showSwingUsage, setShowSwingUsage] = useState(false)

  const [playing, setPlaying] = useState(false)
  const [playerRef,] = useState(createRef())
  const [playerFrame, setPlayerFrame] = useState(0.0)
  const [playback, setPlayback] = useState(1)

  const [comments, setComments] = useState([])

  useEffect(() => {
    if (albumId && (!album || album.id !== albumId)) {
      loadAlbum(albumId)
    }
  }, [albumId])

  useEffect(() => {
    if (swing) {
      setComments(swing.comments)
      setName(swing.name)
    }
  }, [swing])

  useEffect(() => {
    if (comments.length > 0) {
      const usersSet = new Set([])
      comments.forEach( com => {
        if (!usersCache[com.userId]) usersSet.add(com.userId)
      })
      const ids = Array.from(usersSet)
      if (ids.length > 0) searchFriends({ ids })
    }
  }, [comments])

  const handleSeekChange = e => {
    const frame = parseInt(e.target.value)
    if (frame != null) {
      onSeekTo(frame)
    }
  }

  const onSeekTo = frame => {
    if (frame == null) {
      return
    }
    const seekTo = frame === SWING_FRAMES ? 0.9999 : parseFloat((frame/SWING_FRAMES).toFixed(4))
    playerRef.current.seekTo(seekTo)
    setPlayerFrame(frame)
  }

  const onUpdateSwingName = e => {
    setName(e.target.value)
    executeAfterTimeout(() => {
      updateSwing({ ...swing, albumId: album.id, name: e.target.value })
    }, 700)
  }

  const renderVideo = ({ swing, ref, playing, pip, duration }) => {
    if (!swing) {
      return null
    }

    return(
      <div className="flex flex-col">
        <div className="flex-shrink-0">
          <ReactPlayer
            className="rounded-md overflow-hidden"
            ref={ref}
            url={swing.videoURL} 
            playing={playing}
            pip={pip}
            volume={0}
            muted={true}
            playbackRate={playback}
            loop={true}
            progressInterval={200}
            onProgress={({ played }) => {
              const frame = Math.round(played*SWING_FRAMES)
              setPlayerFrame(frame)
            }}
            config={{
              file: {
                attributes: {
                  controlsList: "nofullscreen",
                  playsInline: true,
                }
              }
            }}
            height=""
            width=""
          />
        </div>

        {/* Controls Panel */}
        <div className="block lg:flex flex-col p-1 mt-2 bg-gray-100 rounded shadow-lg">
          <div className="flex flex-row content-center justify-center items-center mt-1 text-xs">
            <div className="font-semibold mr-1">Rally { swing.rally }</div> | 
            <div className="flex flex-row bg-white rounded p-0.5 mx-1 text-xs relative">
                @<div className="w-8 text-center">{ `${parseInt(swing.timestampSecs/60)}:${parseInt(swing.timestampSecs%60).toString().padStart(2,"0")}` }</div>
            </div>
          </div>

          <div className="flex flex-row content-center justify-center items-center mt-1">
            <div>
              {/* Play / Pause */}
              { playing &&
                <IconContext.Provider value={{ color: "red" }}>
                  <div className="m-2 content-center justify-center items-center cursor-pointer">
                    <FaRegPauseCircle onClick={() => setPlaying(false)}/>
                  </div>
                </IconContext.Provider>
              }
              { !playing &&
                <IconContext.Provider value={{ color: "blue" }}>
                  <div className="m-2 content-center justify-center items-center cursor-pointer">
                    <FaPlayCircle onClick={() => setPlaying(true)}/>
                  </div>
                </IconContext.Provider>
              }
            </div>

            <div className="flex flex-col ml-2 relative">
              {/* Seek */}
              <input
                type='range'
                value={duration}
                min={0}
                max={SWING_FRAMES}
                step='1'
                onChange={handleSeekChange}
                onFocus={ e => {
                  e.stopPropagation()
                  e.preventDefault()
                }}
              />

              { showSwingUsage &&
                <div className="absolute mb-2 -ml-3 w-80 bg-yellow-300 text-black text-xs font-semibold tracking-wide rounded shadow py-1.5 px-4 bottom-full">
                  <p>Drag or click once and use &lt;- and -&gt; keys to nav frame by frame</p>
                  <svg className="absolute text-yellow-300 h-2 left-0 ml-3 top-full" x="0px" y="0px" viewBox="0 0 600 400" xmlSpace="preserve"><polygon className="fill-current" points="0,0 300,400 600,0"/></svg>
                </div>
              }

            </div>

            <div className="bg-white rounded p-0.5 mx-1 text-xs w-10 relative">
              <p className="text-center"> { duration ? duration : "0" }/{SWING_FRAMES}</p>
              { showSwingUsage &&
                <div className="absolute -mb-14 ml-4 w-48 bg-yellow-300 text-black text-xs font-semibold tracking-wide rounded shadow py-1.5 px-4 bottom-full z-100">
                  <svg className="absolute text-yellow-300 h-2 left-0 ml-3 bottom-full" x="0px" y="0px" viewBox="0 0 600 400" xmlSpace="preserve"><polygon className="fill-current" points="0,400 300,0 600,400"/></svg>
                  Frame # / Total Frames
                </div>
              }
            </div>
          </div>

          <div className="flex flex-row content-center justify-center items-center px-4 py-2 bg-gray-100 rounded relative">
            <input type='button'
              className="w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-lg cursor-pointer"
              onClick={() => setPlayback(0.25)}
              value=".25x"
            />
            <input type='button'
              className="w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-lg cursor-pointer"
              onClick={() => setPlayback(0.5)}
              value=".5x"
            />
            { showSwingUsage &&
                <div className="absolute -mb-20 ml-16 w-48 bg-yellow-300 text-black text-xs font-semibold tracking-wide rounded shadow py-1.5 px-4 bottom-full z-100">
                  <svg className="absolute text-yellow-300 h-2 left-0 ml-3 bottom-full" x="0px" y="0px" viewBox="0 0 600 400" xmlSpace="preserve"><polygon className="fill-current" points="0,400 300,0 600,400"/></svg>
                  Change playback rate
                </div>
            }
            <input type='button'
              className="w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-lg cursor-pointer"
              onClick={() => setPlayback(1)}
              value="1x"
            />
            <input type='button'
              className="w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-lg cursor-pointer"
              onClick={() => setPlayback(2)}
              value="2x"
            />
            <input type='button'
              className="w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-lg cursor-pointer"
              onClick={() => setPlayback(3)}
              value="3x"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="lg:flex lg:flex-row p-2 lg:p-8 bg-gray-200 content-center justify-center items-center">
      {/* Swing Video Column */}
      <div className={"lg:flex flex-col items-center py-2 lg:py-4 px-8 rounded bg-white shadow-lg relative"}>
        <div className="mb-2 flex content-center justify-center items-center">
          <div className="flex flex-row content-center justify-center items-center relative">
            <input type="button"
              className="text-xs mr-2 rounded-full bg-black text-white hover:bg-white hover:text-black h-4 w-4 border border-white ml-2 cursor-pointer hidden lg:block"
              value="?"
              onClick={() => setShowSwingUsage(!showSwingUsage)}
            />
            <input type="text"
              className="text-xs lg:text-base text-center underline hover:bg-blue-100 p-1 rounded-lg border-2 border-gray-200"
              value={name}
              onChange={onUpdateSwingName}
              disabled={!user || user.id !== album?.userId}
            />
            { (user && user.id === album?.userId) &&
              <img src={pencil} className="w-4 h-4 absolute right-2"/>
            }
          </div>
        </div>
          
        <div className="mt-2">
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

      {/* Comments Column */}
      <div className="lg:flex flex-col lg:ml-8 lg:mt-0 mt-2 lg:w-1/2 items-center py-4 px-3 lg:px-8 overflow-y-auto rounded bg-white shadow-lg">
        <CommentsListAndForm
          albumId={albumId}
          playerFrame={playerFrame}
          user={user}
          usersCache={usersCache}
          comments={comments}
          showSwingUsage={showSwingUsage}
          swingId={swingId}
        />
      </div>
    </div>
  )
}

const mapStateToProps = (state) => {
  console.log("mapStateToProps", state)
  return {
    confirmation: state.confirmation,
    user: state.user,
    usersCache: state.usersCache,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    loadAlbum: LoadAlbum(dispatch),
    searchFriends: SearchFriends(dispatch),
    updateSwing: UpdateSwing(dispatch),
  }
}
  
SwingModal.propTypes = {
  album: PropTypes.object,
  swingId: PropTypes.string,
  user: PropTypes.object,
  usersCache: PropTypes.object,

  loadAlbum: PropTypes.func,
  searchFriends: PropTypes.func,
  updateSwing: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(SwingModal)