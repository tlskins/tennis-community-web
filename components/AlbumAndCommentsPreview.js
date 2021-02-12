import React from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import ReactPlayer from "react-player"
import Moment from "moment"

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
    <div key={album.id} className="lg:flex flex-row content-center justify-center items-center bg-gray-100 mb-6 p-2 border-2 border-gray-200 rounded-lg shadow-md w-full">
      <div className="lg:flex flex-col lg:w-3/5 content-center justify-center items-center pr-1">
        <div className="flex flex-col w-full text-center">
          <a href={`/albums/${album.id}`}
            className="text-xs font-semibold text-blue-400 underline mb-1 px-2 cursor-pointer"
          >
            {album.name}
          </a>
          <a href={`/albums/${album.id}/swings/${album.swingVideos[swingIdx]?.id}`}
            className="text-xs font-semibold text-blue-400 underline mb-1 px-2 cursor-pointer"
          >
            swing: {album.swingVideos[swingIdx]?.name}
          </a>
        </div>

        {/* Video Player */}
        
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
          />
        </div>
        
        {/* Controls Panel */}
        <div className="flex flex-row content-center justify-center py-1 my-2 bg-gray-300 rounded lg:w-4/5">

          { swingIdx > 0 &&
              <input type='button'
                className='border rounded p-0.5 mx-1 text-xs font-bold bg-black text-white cursor-pointer'
                value='<'
                onClick={onSetSwingIndex(swingIdx-1)}
              />
          }

          {/* Picture in Picture */}
          { pip &&
            <input type='button'
              className='border rounded p-0.5 mx-1 text-xs font-bold bg-indigo-700 text-white'
              value='-'
              onClick={onTogglePip(false)}
            />
          }
          { !pip &&
            <input type='button'
              className='border rounded p-0.5 mx-1 text-xs font-bold bg-indigo-700 text-white'
              value='+'
              onClick={onTogglePip(true)}
            />
          }

          {/* Play / Pause */}
          { playing &&
            <input type='button'
              className='border w-10 rounded p-0.5 mx-1 text-xs bg-red-700 text-white'
              value='pause'
              onClick={onTogglePlay(false)}
            />
          }
          { !playing &&
            <input type='button'
              className='border w-10 rounded p-0.5 mx-1 text-xs bg-green-700 text-white'
              value='play'
              onClick={onTogglePlay(true)}
            />
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

          { swingIdx < album.swingVideos.length-1 &&
              <input type='button'
                className='border rounded p-0.5 mx-1 text-xs font-bold bg-black text-white cursor-pointer'
                value='>'
                onClick={onSetSwingIndex(swingIdx+1)}
              />
          }
        </div>
      </div>

      <div className="lg:flex flex-col lg:w-2/5 content-center text-center py-4">

        <div className="lg:flex flex-row px-2 mb-1 content-center justify-center items-center text-center">
          { album.userId === user?.id && 
            <div className="px-2 mx-1 inline-block rounded-lg bg-yellow-300 border border-gray-400 shadow-md font-semibold text-xs">
              owner
            </div>
          }
          { album.friendIds.includes(user.id) && 
            <div className="px-2 mx-1 inline-block rounded-lg bg-red-300 border border-gray-400 shadow-md font-semibold text-xs">
              shared
            </div>
          }
          { album.isViewableByFriends &&
            <div className="px-2 mx-1 inline-block rounded-lg bg-green-300 border border-gray-400 shadow-md font-semibold text-xs">
              friends
            </div>
          }
          { album.isPublic && 
            <div className="px-2 mx-1 inline-block rounded-lg bg-blue-300 border border-gray-400 shadow-md font-semibold text-xs">
              public
            </div>
          }
        </div>

        <p className="text-xs w-full mb-1">
          <span className="font-semibold">Updated</span> { Moment(album.updatedAt).format("lll") }
        </p>

        <div className="flex flex-row content-center justify-center items-center">
          <p className="text-xs bg-white rounded-lg mx-1 mb-1 text-xs px-1">
            { album.swingVideos.length } <span className="font-semibold">swings</span>
          </p>

          <div className="flex flex-row bg-white rounded-lg mx-1 mb-1 text-xs px-1 w-10">
            <p className="mr-0.5 text-center">{ (album.comments?.length || 0) + album.swingVideos.reduce((acc, swing) => acc + (swing.comments?.length || 0), 0) }</p>
            <img src={speechBubble} className="w-5 h-5"/>
          </div>
        </div>

        <div className="h-40 w-full overflow-y-scroll bg-gray-300 p-1 rounded-lg hidden lg:block">
          { comments.map((comment, j) => {
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
          { comments.length === 0 &&
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