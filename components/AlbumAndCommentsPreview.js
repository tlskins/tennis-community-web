import React from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import ReactPlayer from "react-player"
import Moment from "moment"
import { FaPlayCircle, FaRegPauseCircle } from "react-icons/fa"
import { RiPictureInPicture2Fill, RiPictureInPictureExitFill } from "react-icons/ri"
import { IconContext } from "react-icons"

import speechBubble from "../public/speech-bubble.svg"


const AlbumAndCommentsPreview = ({
  album,
  comments,
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
  return(
    <div key={album.id} className="lg:flex flex-row content-center justify-center items-center bg-gray-100 mb-6 p-2 rounded shadow-lg w-full">

      {/* Details Panel */}
      <div className="lg:flex flex-col lg:w-2/5 content-center justify-center items-start py-2 mr-2">
        <div className="px-2 mx-1 text-xs">
          Album:
          <a className="text-blue-400 underline mx-1"
            href={`/albums/${album.id}`}
          >
            { album.name } 
          </a>
        </div>

        <p className="px-2 mx-1 text-xs">
          Owner: <span className="text-blue-400 mx-1">@{ usersCache[album.userId]?.userName || "..." }</span>
        </p>

        <p className="px-2 mx-1 text-xs">
          Updated: <span className="text-blue-400 mx-1">{ Moment(album.updatedAt).format("M/D/YY h:mm a") }</span>
        </p>

        <div className="flex flex-row px-2 mx-1 text-xs">
          <div>
            Shared:
          </div>
          <div className="block ml-1">
            { album.isViewableByFriends &&
            <div className="px-2 mr-1 mt-1 inline-block rounded-lg bg-green-300 shadow-md">
              friends
            </div>
            }
            { album.isPublic && 
            <div className="px-2 mr-1 mt-1 inline-block rounded-lg bg-blue-300 shadow-md">
              public
            </div>
            }
            { album.friendIds.includes(user.id) && 
            <div className="px-2 mr-1 mt-1 inline-block rounded-lg bg-yellow-300 shadow-md">
              you
            </div>
            }
            { (!album.isPublic && !album.isViewableByFriends && !album.friendIds.includes(user.id)) &&
            <div className="px-2 mr-1 mt-1 inline-block rounded-lg bg-gray-200 shadow-md">
              none
            </div>
            }
          </div>
        </div>

        { album.friendIds.includes(user.id) &&
          <p className="flex flex-row w-full px-2 mt-2 rounded shadow-lg bg-black text-yellow-300 text-xs font-semibold content-center justify-center items-center">
            Your review requested!
          </p>
        }

        <div className="flex flex-row content-center justify-center items-center mt-2">
          <p className="text-xs bg-white rounded-lg mx-1 mb-1 text-xs px-1">
            { album.swingVideos.length } <span className="font-semibold">swings</span>
          </p>

          <p className="text-xs bg-white rounded-lg mx-1 mb-1 text-xs px-1">
            { album.swingVideos[album.swingVideos.length-1]?.rally || 1 } <span className="font-semibold">rallies</span>
          </p>

          <div className="flex flex-row bg-white rounded-lg mx-1 mb-1 text-xs px-1 w-10">
            <p className="mr-0.5 text-center">{ (album.comments?.length || 0) + album.swingVideos.reduce((acc, swing) => acc + (swing.comments?.length || 0), 0) }</p>
            <img src={speechBubble} className="w-5 h-5"/>
          </div>
        </div>

        <div className="h-32 w-full overflow-y-auto bg-gray-300 p-1 rounded hidden lg:block">
          { comments.map((comment, j) => {
            const poster = usersCache[comment.userId]
            return(
              <div key={j} className="px-2 pt-1 mb-1 bg-white rounded shadow-lg">
                <textarea disabled={true}
                  className="text-xs bg-gray-100 rounded-md shadow-md w-full p-0.5"
                  value={comment.text}
                  rows={2}
                />
                <p className="text-xs w-full">
                  <span className="text-blue-400 underline">{ poster ? `@${poster.userName}` : "..." }</span>
                  { comment.swingId &&
                    <>
                      <span className="mx-1">|</span>
                      <a className="text-xs text-blue-500 align-middle underline"
                        href={`/albums/${album.id}/swings/${comment.swingId}`}
                      >
                      Swing { comment.swingName }
                      </a>
                    </>
                  }
                </p>
                <p className="text-xs w-full">
                  <span>{ Moment(album.updatedAt).format("lll") }</span>
                </p>
              </div>
            )
          })}
          { comments.length === 0 &&
            <p className="text-xs w-full rounded-lg bg-yellow-300 text-center">No Comments</p>
          }
        </div>
      </div>

      {/* Video Player */}
      <div className="lg:flex flex-col lg:w-3/5 content-center justify-center items-center py-2 shadow-lg">
        <div className="content-center justify-center items-center">
          <ReactPlayer
            ref={playerRef}
            url={album.swingVideos[swingIdx]?.videoURL} 
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
            width="220px"
          />
        </div>
        
        {/* Controls Panel */}
        <div className="flex flex-col content-center justify-center p-1 mt-1 w-full bg-gray-100 rounded">
          {/* Top Level Controls */}
          <div className="flex flex-row content-center justify-center items-center">
            {/* Picture in Picture */}
            { pip &&
                <IconContext.Provider value={{ color: "blue", height: "8px", width: "8px" }}>
                  <div className="mx-2 items-stretch content-center justify-center items-center cursor-pointer">
                    <RiPictureInPictureExitFill onClick={onTogglePip(false)}/>
                  </div>
                </IconContext.Provider>
            }
            { !pip &&
                <IconContext.Provider value={{ color: "blue", height: "8px", width: "8px" }}>
                  <div className="mx-2 items-stretch content-center justify-center items-center cursor-pointer">
                    <RiPictureInPicture2Fill onClick={onTogglePip(true)}/>
                  </div>
                </IconContext.Provider>
            }

            <a className="text-xs text-blue-400 underline mr-1"
              href={`/albums/${album.id}/swings/${album.swingVideos[swingIdx]?.id}`}
            >
              { album.swingVideos[swingIdx]?.name } 
            </a>
            { swingIdx > 0 &&
              <input type='button'
                className='rounded p-0.5 mx-1 text-xs font-bold bg-black text-white cursor-pointer'
                value='<'
                onClick={onSetSwingIndex(swingIdx-1)}
              />
            }
            { swingIdx < album.swingVideos.length-1 &&
              <input type='button'
                className='rounded p-0.5 mx-1 text-xs font-bold bg-black text-white cursor-pointer'
                value='>'
                onClick={onSetSwingIndex(swingIdx+1)}
              />
            }
          </div>

          {/* Bottom Level Controls */}
          <div className="flex flex-row content-center justify-center">
            {/* Play / Pause */}
            { playing &&
                <IconContext.Provider value={{ color: "red" }}>
                  <div className="mx-2 content-center justify-center items-center cursor-pointer">
                    <FaRegPauseCircle onClick={onTogglePlay(false)}/>
                  </div>
                </IconContext.Provider>
            }
            { !playing &&
                <IconContext.Provider value={{ color: "blue" }}>
                  <div className="mx-2 content-center justify-center items-center cursor-pointer">
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

            <div className="bg-white rounded p-0.5 mx-1 text-xs w-10">
              <p className="text-center"> { duration ? duration : "0" }/{swingFrames}</p>
            </div>
          </div>
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
  
AlbumAndCommentsPreview.propTypes = {
  album: PropTypes.object,
  comments: PropTypes.arrayOf(PropTypes.object),
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
    
export default connect(mapStateToProps, undefined)(AlbumAndCommentsPreview)