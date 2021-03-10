import React from "react"
import ReactPlayer from "react-player"
import PropTypes from "prop-types"
import { FaPlayCircle, FaRegPauseCircle } from "react-icons/fa"
import { RiPictureInPicture2Fill, RiPictureInPictureExitFill } from "react-icons/ri"
import { BsTrash } from "react-icons/bs"
import { ImBubbles2 } from "react-icons/im"
import { IconContext } from "react-icons"
import { useRouter } from "next/router"
import handleViewport from "react-in-viewport"

const SwingPlayerContent = ({
  albumId,
  forwardedRef,
  swing,
  i,
  inViewport,
  isOwner,
  playerRefs,
  playbackRate,
  playings,
  playerFrames,
  pips,
  showAlbumUsage,
  swingFrames,
  playerWidth,
  playerHeight,

  handleSeekChange,
  onDelete,
  setPips,
  setPlayings,
  setPlayerFrames,
}) => {
  const router = useRouter()
  const duration = playerFrames[i]
  const ref = playerRefs[i]
  const pip = pips[i]
  const playing = playings[i]
  console.log("inViewport", swing.name, inViewport)
  return (
    <div className="flex flex-col justify-center items-center m-1 p-1 bg-gray-400 rounded shadow-lg"
      ref={forwardedRef}
    >
      { inViewport ?
        <>
          <ReactPlayer
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
              const frame = Math.round(played*swingFrames)
              setPlayerFrames({
                ...playerFrames,
                [i]: frame,
              })
            }}
            width={playerWidth || ""}
            height={playerHeight || ""}
            config={{
              file: {
                attributes: {
                  controlsList: "nofullscreen",
                  playsInline: true,
                }
              }
            }}
          />

          {/* Controls Panel */}
          <div className="flex flex-col content-center justify-center p-1 mt-1 w-full bg-gray-100 rounded">
            <div className="flex flex-row content-center justify-center items-center">
              <a className="text-xs text-blue-400 underline mr-1 cursor-pointer"
                onClick={() => router.push({
                  pathname: `/albums/${albumId}`,
                  query: { swing: swing.id },
                })}
              >
              Swing { swing.name } 
              </a>
              <div className="relative">
                <div className="text-xs">| Rally { swing.rally }</div>
                { (showAlbumUsage && i === 0) &&
                <div className="absolute w-40 mb-14 -mx-14 bg-yellow-300 text-black text-xs font-semibold tracking-wide rounded shadow py-1.5 px-4 bottom-full z-100">
                  Rally # in original video
                  <svg className="absolute text-yellow-300 h-2 right-0 mr-20 top-full" x="0px" y="0px" viewBox="0 0 600 400" xmlSpace="preserve"><polygon className="fill-current" points="0,0 300,400 600,0"/></svg>
                </div>
                }
              </div>

              <div className="flex flex-row bg-white rounded p-0.5 mx-1 text-xs relative">
              @<div className="w-8 text-center">{ `${parseInt(swing.timestampSecs/60)}:${parseInt(swing.timestampSecs%60).toString().padStart(2,"0")}` }</div>
                { (showAlbumUsage && i === 0) &&
                <div className="absolute w-32 mb-2 mx-3 bg-yellow-300 text-black text-xs font-semibold tracking-wide rounded shadow py-1.5 px-4 bottom-full z-100">
                  Timestamp in original video
                  <svg className="absolute text-yellow-300 h-2 left-0 ml-3 top-full" x="0px" y="0px" viewBox="0 0 600 400" xmlSpace="preserve"><polygon className="fill-current" points="0,0 300,400 600,0"/></svg>
                </div>
                }
              </div>

              <div className={`flex flex-row bg-white ${(swing.comments?.length || 0) !== 0 && "border-2 border-blue-400"} rounded p-0.5 mx-1 text-xs`}>
                {(swing.comments?.length || 0)}
                <IconContext.Provider value={{ color: (swing.comments?.length || 0) === 0 ? "black" : "blue" }}>
                  <div className="mx-1 mt-0.5 cursor-pointer">
                    <ImBubbles2 />
                  </div>
                </IconContext.Provider>
              </div>

              { isOwner &&
              <IconContext.Provider value={{ color: "red" }}>
                <div className="mx-2 content-center justify-center items-center cursor-pointer"
                  onClick={onDelete}
                >
                  <BsTrash/>
                </div>
              </IconContext.Provider>
              }
            </div>
          
            <div className="flex flex-row content-center justify-center">
              {/* Picture in Picture */}
              <div className="relative">
                { (showAlbumUsage && i === 0) &&
              <div className="absolute w-48 mb-2 -mx-40 bg-yellow-300 text-black text-xs font-semibold tracking-wide rounded shadow py-1.5 px-4 bottom-full z-100">
                View Picture-In-Picture for a draggable video
                <svg className="absolute text-yellow-300 h-2 right-0 mr-3 top-full" x="0px" y="0px" viewBox="0 0 600 400" xmlSpace="preserve"><polygon className="fill-current" points="0,0 300,400 600,0"/></svg>
              </div>
                }
                { pip &&
              <IconContext.Provider value={{ color: "blue", height: "8px", width: "8px" }}>
                <div className="mx-2 items-stretch content-center justify-center items-center cursor-pointer">
                  <RiPictureInPictureExitFill onClick={() => {
                    const newPips = pips.map((p,j) => j === i ? false : p)
                    setPips(newPips)
                  }}/>
                </div>
              </IconContext.Provider>
                }
                { !pip &&
              <IconContext.Provider value={{ color: "blue", height: "8px", width: "8px" }}>
                <div className="mx-2 items-stretch content-center justify-center items-center cursor-pointer">
                  <RiPictureInPicture2Fill onClick={() => {
                    const newPips = pips.map((p,j) => j === i ? true : p)
                    setPips(newPips)
                  }}/>
                </div>
              </IconContext.Provider>
                }
              </div>
            
              {/* Play / Pause */}
              { playing &&
              <IconContext.Provider value={{ color: "red" }}>
                <div className="mx-2 content-center justify-center items-center cursor-pointer">
                  <FaRegPauseCircle onClick={() => {
                    const newPlayings = playings.map((p,j) => j === i ? false : p)
                    setPlayings(newPlayings)
                  }}/>
                </div>
              </IconContext.Provider>
              }
              { !playing &&
              <IconContext.Provider value={{ color: "blue" }}>
                <div className="mx-2 content-center justify-center items-center cursor-pointer">
                  <FaPlayCircle onClick={() => {
                    const newPlayings = playings.map((p,j) => j === i ? true : p)
                    setPlayings(newPlayings)
                    setPlayerFrames({
                      ...playerFrames,
                      [i]: undefined,
                    })
                  }}/>
                </div>
              </IconContext.Provider>
              }
            
              {/* Seek */}
              <input
                type='range'
                tabIndex={(i*3)+3}
                value={duration}
                min={0}
                max={swingFrames}
                step='1'
                onChange={handleSeekChange(ref, i)}
                onFocus={ e => {
                  e.stopPropagation()
                  e.preventDefault()
                }}
              />

              <div className="flex flex-row content-center justify-center items-center">
                <div className="bg-white rounded p-0.5 mx-1 text-xs relative">
                  { (showAlbumUsage && i ===0) &&
                  <div className="absolute -mb-16 w-48 bg-yellow-300 text-black text-xs font-semibold tracking-wide rounded shadow py-1.5 px-4 bottom-full z-100">
                    <svg className="absolute text-yellow-300 h-2 left-0 ml-3 bottom-full" x="0px" y="0px" viewBox="0 0 600 400" xmlSpace="preserve"><polygon className="fill-current" points="0,400 300,0 600,400"/></svg>
                    Frame # / Total Frames              
                  </div>
                  }
                  <div className="w-8 text-center">{ duration ? duration.toString().padStart(2, "0") : "00" }/{swingFrames}</div>
                </div>
              </div>
            </div>
          </div>
        </>
        :
        <div />
      }
      
    </div>
  )
}

SwingPlayerContent.propTypes = {
  albumId: PropTypes.string,
  forwardedRef: PropTypes.object,
  showAlbumUsage: PropTypes.bool,
  swing: PropTypes.object,
  swingFrames: PropTypes.number,
  i: PropTypes.number,
  inViewport: PropTypes.bool,
  isOwner: PropTypes.bool,
  playbackRate: PropTypes.number,
  pips: PropTypes.arrayOf(PropTypes.bool),
  playings: PropTypes.arrayOf(PropTypes.bool),
  playerFrames: PropTypes.object,
  playerRefs: PropTypes.arrayOf(PropTypes.object),
  playerWidth: PropTypes.string,
  playerHeight: PropTypes.string,

  handleSeekChange: PropTypes.func,
  onDelete: PropTypes.func,
  setPips: PropTypes.func,
  setPlayings: PropTypes.func,
  setPlayerFrames: PropTypes.func,
}

const SwingPlayer = handleViewport(SwingPlayerContent)

export default SwingPlayer