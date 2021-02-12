import React from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import ReactPlayer from "react-player"
import Moment from "moment"

import { FaPlayCircle, FaRegPauseCircle, FaChevronCircleRight, FaChevronCircleLeft } from "react-icons/fa"
import { RiPictureInPicture2Fill, RiPictureInPictureExitFill } from "react-icons/ri"
import { ImBubbles2 } from "react-icons/im"
import { IconContext } from "react-icons"

const AlbumAndComments = ({
  album,
  duration,
  pip,
  playing,
  playerRef,
  swingIdx,
  swingFrames,
  user,
  usersCache,

  onSetSwingIndex,
  onTogglePlay,
  onHandleSeekChange,
  onTogglePip,
  onPlayerProgress,
}) => {
  const swing = album.swingVideos[swingIdx]
  return(
    <div key={album.id} className="flex flex-row bg-gray-100 mb-6 p-2 rounded shadow-lg w-full content-center justify-center items-center ">
      {/* Left Panel */}
      <div className="flex flex-col w-1/3 content-center text-center py-4 hidden lg:block">
        <p className="text-xs w-full mb-1 tracking-wide font-semibold underline">
          Album Comments
        </p>

        <div className="flex flex-row px-2 mb-1 content-center justify-center items-center text-center">
          <div className="flex flex-row bg-white rounded-lg mx-1 mb-1 text-xs px-1">
            { album.comments?.length || 0 }
            <IconContext.Provider value={{ color: "blue" }}>
              <div className="ml-2 cursor-pointer">
                <ImBubbles2 />
              </div>
            </IconContext.Provider>
          </div>

          <p className="text-xs bg-white rounded-lg mx-1 mb-1 text-xs px-1">
            { album.swingVideos.length } <span className="font-semibold">swings</span>
          </p>
        </div>

        <div className="h-40 w-full overflow-y-scroll bg-gray-300 p-1 rounded-lg">
          { (album?.comments || []).map((comment, j) => {
            const poster = usersCache[comment.userId]
            return(
              <div key={j} className="px-2 pt-1 mb-1 bg-white rounded-lg border border-gray-400 shadow">
                <textarea disabled={true}
                  className="text-xs bg-gray-100 rounded-md shadow-md w-full p-0.5"
                  value={comment.text}
                  rows={2}
                />
                <p className="text-xs w-full">
                  <span className="text-blue-400 underline">{ poster ? `@${poster.userName}` : "..." }</span> | { Moment(album.updatedAt).format("lll") }
                </p>
              </div>
            )
          })}
          { (album?.comments || []).length === 0 &&
            <p className="text-xs w-full rounded-lg bg-yellow-300 text-center">No Comments</p>
          }
        </div>
      </div>

      {/* Middle Panel */}
      <div className="flex flex-col items-center pr-1">
        <div className="flex flex-row px-2 mb-1 content-center justify-center items-center text-center">
          { album.userId === user?.id && 
            <div className="px-2 mx-1 inline-block rounded-lg bg-yellow-300 border border-gray-400 shadow-md font-semibold text-xs">
              owner
            </div>
          }
          { (album.friendIds || []).includes(user?.id) && 
            <div className="px-2 mx-1 rounded-lg bg-red-300 border border-gray-400 shadow-md font-semibold text-xs">
              shared
            </div>
          }
          { album.isViewableByFriends &&
            <div className="px-2 mx-1 rounded-lg bg-green-300 border border-gray-400 shadow-md font-semibold text-xs">
              friends
            </div>
          }
          { album.isPublic && 
            <div className="px-2 mx-1 rounded-lg bg-blue-300 border border-gray-400 shadow-md font-semibold text-xs">
              public
            </div>
          }
        </div>

        {/* Video Player */}
        <div className="flex flex-col content-center justify-center items-center">
          <div className="lg:w-1/2 content-center justify-center items-center">
            <ReactPlayer
              ref={playerRef}
              url={swing?.videoURL} 
              playing={playing}
              pip={pip}
              volume={0}
              muted={true}
              loop={true}
              progressInterval={200}
              onProgress={({ played }) => onPlayerProgress(played)}
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
          <div className="flex flex-row p-1 mt-2 bg-gray-200 rounded content-center justify-center items-center">
            
            {/* Picture in Picture */}
            { pip &&
            <IconContext.Provider value={{ color: "blue", height: "8px", width: "8px" }}>
              <div className="m-2 items-stretch content-center justify-center items-center cursor-pointer">
                <RiPictureInPictureExitFill onClick={onTogglePip(false)}/>
              </div>
            </IconContext.Provider>
            }
            { !pip &&
            <IconContext.Provider value={{ color: "blue", height: "8px", width: "8px" }}>
              <div className="m-2 items-stretch content-center justify-center items-center cursor-pointer">
                <RiPictureInPicture2Fill onClick={onTogglePip(true)}/>
              </div>
            </IconContext.Provider>
            }

            {/* Play / Pause */}
            { playing &&
            <IconContext.Provider value={{ color: "red" }}>
              <div className="m-2 content-center justify-center items-center cursor-pointer">
                <FaRegPauseCircle onClick={onTogglePlay(false)}/>
              </div>
            </IconContext.Provider>
            }
            { !playing &&
            <IconContext.Provider value={{ color: "blue" }}>
              <div className="m-2 content-center justify-center items-center cursor-pointer">
                <FaPlayCircle onClick={onTogglePlay(true)}/>
              </div>
            </IconContext.Provider>
            }
          
            {/* Seek */}
            <input
              type='range'
              value={duration}
              min={0}
              max={swingFrames}
              step='1'
              onChange={onHandleSeekChange}
              onFocus={ e => {
                console.log("focus!")
                e.stopPropagation()
                e.preventDefault()
              }}
            />

            <div className="flex flex-row content-center justify-center items-center">
              <div className="bg-white rounded p-0.5 mx-1 text-xs">
                <div className="w-8 text-center"> { duration ? duration : "0" }/{swingFrames}</div>
              </div>
            </div>

            { swingIdx > 0 &&
              <IconContext.Provider value={{ color: "blue", height: "8px", width: "8px" }}>
                <div className="m-2 items-stretch content-center justify-center items-center cursor-pointer">
                  <FaChevronCircleLeft onClick={onSetSwingIndex(swingIdx-1)}/>
                </div>
              </IconContext.Provider>
            }

            { swingIdx < album.swingVideos.length-1 &&
              <IconContext.Provider value={{ color: "blue", height: "8px", width: "8px" }}>
                <div className="m-2 items-stretch content-center justify-center items-center cursor-pointer">
                  <FaChevronCircleRight onClick={onSetSwingIndex(swingIdx+1)}/>
                </div>
              </IconContext.Provider>
            }
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex flex-col w-1/3 content-center text-center py-4 hidden lg:block">

        <div className="flex flex-row content-center justify-center items-center">
          <p className="text-xs font-semibold underline">Swing Comments</p>
        </div>

        <div className="flex flex-row content-center justify-center items-center">
          <p className="text-xs font-semibold">Swing:</p>
          <a href={`/albums/${album.id}/swings/${swing?.id}`}
            className="flex text-xs text-blue-400 text-center underline my-1 px-2 cursor-pointer"
          >
            {swing?.name}
          </a>

          <div className="flex flex-row bg-white rounded mx-1 mb-1 text-xs px-1">
            { album.swingVideos.reduce((acc, swing) => acc + (swing.comments?.length || 0), 0) }
            <IconContext.Provider value={{ color: "blue" }}>
              <div className="ml-2 cursor-pointer">
                <ImBubbles2 />
              </div>
            </IconContext.Provider>
          </div>
        </div>

        <div className="h-40 w-full overflow-y-scroll bg-gray-300 p-1 rounded-lg">
          { (swing?.comments || []).map((comment, j) => {
            const poster = usersCache[comment.userId]
            return(
              <div key={j} className="px-2 pt-1 mb-1 bg-white rounded-lg border border-gray-400 shadow">
                <textarea disabled={true}
                  className="text-xs bg-gray-100 rounded-md shadow-md w-full p-0.5"
                  value={comment.text}
                  rows={2}
                />
                <p className="text-xs w-full">
                  <span className="text-blue-400 underline">{ poster ? `@${poster.userName}` : "..." }</span> | { Moment(album.updatedAt).format("lll") }
                </p>
              </div>
            )
          })}
          { (swing?.comments || []).length === 0 &&
            <p className="text-xs w-full rounded-lg bg-yellow-300 text-center">No Comments</p>
          }
        </div>
      </div>
    </div>
  )
}
  
const mapStateToProps = (state) => {
  return {
    usersCache: state.usersCache,
  }
}
  
AlbumAndComments.propTypes = {
  album: PropTypes.object,
  duration: PropTypes.number,
  pip: PropTypes.bool,
  playing: PropTypes.bool,
  playerRef: PropTypes.object,
  swingIdx: PropTypes.number,
  swingFrames: PropTypes.number,
  user: PropTypes.object,
  usersCache: PropTypes.object,

  onTogglePlay: PropTypes.func,
  onHandleSeekChange: PropTypes.func,
  onTogglePip: PropTypes.func,
  onPlayerProgress: PropTypes.func,
  onSetSwingIndex: PropTypes.func,
}
    
export default connect(mapStateToProps, undefined)(AlbumAndComments)