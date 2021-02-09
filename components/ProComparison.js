import React, { useState, useRef } from "react"
import ReactPlayer from "react-player"
import PropTypes from "prop-types"
import { FaPlayCircle, FaRegPauseCircle } from "react-icons/fa"
import { RiPictureInPicture2Fill, RiPictureInPictureExitFill } from "react-icons/ri"
import { IconContext } from "react-icons"


const publicVideos = [
  {
    url: "https://tennis-swings.s3.amazonaws.com/public/federer_backhand.mp4",
    name: "Federer Backhand",
  },
  {
    url: "https://tennis-swings.s3.amazonaws.com/public/federer_forehand.mp4",
    name: "Federer Forehand",
  },
  {
    url: "https://tennis-swings.s3.amazonaws.com/public/federer_serve.mp4",
    name: "Federer Serve",
  },
  {
    url: "https://tennis-swings.s3.amazonaws.com/public/djokovic_backhand.mp4",
    name: "Djokovic Backhand",
  },
  {
    url: "https://tennis-swings.s3.amazonaws.com/public/djokovic_forehand.mp4",
    name: "Djokovic Forehand",
  },
  {
    url: "https://tennis-swings.s3.amazonaws.com/public/djokovic_serve.mp4",
    name: "Djokovic Serve",
  },
  {
    url: "https://tennis-swings.s3.amazonaws.com/public/nadal_backhand.mp4",
    name: "Nadal Backhand",
  },
  {
    url: "https://tennis-swings.s3.amazonaws.com/public/nadal_forehand.mp4",
    name: "Nadal Forehand",
  },
  {
    url: "https://tennis-swings.s3.amazonaws.com/public/nadal_serve.mp4",
    name: "Nadal Serve",
  },
]
  


const ProComparison = ({ showUsage }) => {
  const sideVideoRef = useRef(undefined)
  const [sideVideo, setSideVideo] = useState(publicVideos[0].url)
  const [sideVideoDuration, setSideVideoDuration] = useState(0)
  const [sideVideoPlayback, setSideVideoPlayback] = useState(1)
  const [sideVideoPlaying, setSideVideoPlaying] = useState(false)
  const [sideVideoPip, setSideVideoPip] = useState(false)
  
  const handleSideSeekChange = e => {
    const seekTo = parseFloat(e.target.value)
    if (seekTo) {
      sideVideoRef.current.seekTo(seekTo)
      setSideVideoDuration(seekTo)
    }
  }

  return(
    <div className="mb-2">
      <div className="flex flex-col content-center justify-center items-center">
        <select className="my-4 p-0.5 border border-gray-500 rounded shadow-md"
          onChange={e => setSideVideo(e.target.value)}
        >
          { publicVideos.map((vid, i) => {
            return(
              <option key={i} value={vid.url}>{ vid.name }</option>
            )
          })}
        </select>
        
        <div className="relative">
          { showUsage &&
          <div className="absolute ml-20 -my-10 w-60 bg-yellow-300 text-black text-xs font-semibold tracking-wide rounded shadow py-1.5 px-4 bottom-full z-10">
            View pro tennis swings and compare them with your own.
            <svg className="absolute text-yellow-300 h-2 left-0 ml-3 top-full" x="0px" y="0px" viewBox="0 0 600 400" xmlSpace="preserve"><polygon className="fill-current" points="0,0 300,400 600,0"/></svg>
          </div>
          }
          <ReactPlayer
            className="rounded-md overflow-hidden"
            ref={sideVideoRef}
            url={sideVideo} 
            playing={sideVideoPlaying}
            pip={sideVideoPip}
            volume={0}
            muted={true}
            playbackRate={sideVideoPlayback}
            loop={true}
            progressInterval={200}
            onProgress={({ played }) => setSideVideoDuration(
              parseFloat((Math.ceil(played/.05)*.05).toFixed(2))
            )}
            height=""
            width=""
          />
        </div>

        {/* Controls Panel */}
          
        <div className="flex flex-row content-center justify-center items-center mt-4">        
          <div className="relative">
            { showUsage &&
            <div className="absolute w-44 mb-2 -mx-2 bg-yellow-300 text-black text-xs font-semibold tracking-wide rounded shadow py-1.5 px-4 bottom-full z-10">
              View Picture In Picture for a draggable video
              <svg className="absolute text-yellow-300 h-2 left-0 ml-3 top-full" x="0px" y="0px" viewBox="0 0 600 400" xmlSpace="preserve"><polygon className="fill-current" points="0,0 300,400 600,0"/></svg>
            </div>
            }

            {/* Picture in Picture */}
            { sideVideoPip &&
              <IconContext.Provider value={{ color: "blue", height: "8px", width: "8px" }}>
                <div className="m-2 items-stretch content-center justify-center items-center cursor-pointer">
                  <RiPictureInPictureExitFill onClick={() => setSideVideoPip(false)}/>
                </div>
              </IconContext.Provider>
            }
            { !sideVideoPip &&
              <IconContext.Provider value={{ color: "blue", height: "8px", width: "8px" }}>
                <div className="m-2 items-stretch content-center justify-center items-center cursor-pointer">
                  <RiPictureInPicture2Fill onClick={() => setSideVideoPip(true)}/>
                </div>
              </IconContext.Provider>
            }
          </div>

          {/* Play / Pause */}
          { sideVideoPlaying &&
            <IconContext.Provider value={{ color: "red" }}>
              <div className="m-2 content-center justify-center items-center cursor-pointer">
                <FaRegPauseCircle onClick={() => setSideVideoPlaying(false)}/>
              </div>
            </IconContext.Provider>
          }
          { !sideVideoPlaying &&
            <IconContext.Provider value={{ color: "blue" }}>
              <div className="m-2 content-center justify-center items-center cursor-pointer">
                <FaPlayCircle onClick={() => setSideVideoPlaying(true)}/>
              </div>
            </IconContext.Provider>
          }
        </div>

        <div className="flex flex-col content-center justify-center items-center">
          {/* Seek */}
          <input
            type='range'
            value={sideVideoDuration}
            min={0}
            max={1}
            step='0.05'
            onChange={handleSideSeekChange}
          />

          <div className="bg-white rounded p-0.5 mx-1 text-xs">
            <span> { sideVideoDuration ? sideVideoDuration.toFixed(2) : "0.00" }/1.0</span>
          </div>
        </div>

        <div className="flex flex-col content-center justify-center items-center mt-1">
          <div className="flex flex-row content-center justify-center items-center bg-gray-100 rounded p-4">
            <input type='button'
              className="w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-lg"
              onClick={() => setSideVideoPlayback(0.25)}
              value=".25x"
            />
            <input type='button'
              className="w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-lg"
              onClick={() => setSideVideoPlayback(0.5)}
              value=".5x"
            />
            <input type='button'
              className="w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-lg"
              onClick={() => setSideVideoPlayback(1)}
              value="1x"
            />
            <input type='button'
              className="w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-lg"
              onClick={() => setSideVideoPlayback(2)}
              value="2x"
            />
            <input type='button'
              className="w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-lg"
              onClick={() => setSideVideoPlayback(3)}
              value="3x"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

ProComparison.propTypes = {
  showUsage: PropTypes.bool,
}

  
export default ProComparison