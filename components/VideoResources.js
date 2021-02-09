import React, { useState, useRef } from "react"
import ReactPlayer from "react-player"
import PropTypes from "prop-types"
import { FaExpand, FaPlayCircle, FaRegPauseCircle } from "react-icons/fa"
import { BiCollapse } from "react-icons/bi"
import { IconContext } from "react-icons"


const publicVideos = {
  "-": { "-": {}},
  "Grips": {
    "-": {},
    "Semi-Western Forehand": {
      url: "https://www.youtube.com/watch?v=aZj7DIEftPg",
      start: 20,
      end: 55,
    },
    "In-Depth Eastern Forehand": {
      url: "https://www.youtube.com/watch?v=o0BD3ok6Vq8",
      start: 169,
      end: 251,
    },
    "In-Depth Semi-Western Forehand": {
      url: "https://www.youtube.com/watch?v=o0BD3ok6Vq8",
      start: 251,
      end: 305,
    },
    "In-Depth Western Forehand": {
      url: "https://www.youtube.com/watch?v=o0BD3ok6Vq8",
      start: 305,
      end: 353,
    },
  },
  "Serves": {
    "-": {},
    "Serve Form Basics": {
      url: "https://www.youtube.com/watch?v=w03NVg7YtNo",
      start: 20,
      end: undefined,
    },
    "Slice Serve": {
      url: "https://www.youtube.com/watch?v=TzUvhOBrdnM",
      start: 21,
      end: undefined,
    },
  },
  "Forehands": {
    "-": {},
    "Forehand Form Basics": {
      url: "https://www.youtube.com/watch?v=aZj7DIEftPg",
      start: 58,
      end: undefined,
    },
    "5 Steps To Add Power": {
      url: "https://www.youtube.com/watch?v=WpZY6bbiM6I",
      start: 23,
      end: undefined,
    }
  },
  "One-Handed Backhands": {
    "-": {},
    "One-Hand Backhand Form Basics": {
      url: "https://www.youtube.com/watch?v=hKSr14cUn9Q",
      start: 24,
      end: undefined,
    },
  },
  "Two-Handed Backhands": {
    "-": {},
    "Two-Hand Backhand Form Basics": {
      url: "https://www.youtube.com/watch?v=PBguk3yRPgI",
      start: 21,
      end: undefined,
    },
    "Tips For Adding Power": {
      url: "https://www.youtube.com/watch?v=GmgG1rJVaB0",
      start: 22,
      end: undefined,
    },
    "Tips For Adding Topspin": {
      url: "https://www.youtube.com/watch?v=OU39URVIpVc",
      start: 25,
      end: undefined,
    }
  },
}

const PLAYING_VIDEO_HEIGHT = "450px"
const PLAYING_VIDEO_WIDTH = "675px"

const VideoResources = ({
  defaultVideoGroup,
  defaultVideo,

  onExpand,
  showUsage,
}) => {
  const [sideVideoGroup, setSideVideoGroup] = useState(defaultVideoGroup || "-")
  const [sideVideo, setSideVideo] = useState(defaultVideo || "-")

  const video = publicVideos[sideVideoGroup][sideVideo]
  
  const sideVideoRef = useRef(undefined)
  const [sideVideoUrl, setSideVideoUrl] = useState(video.url)
  const [sideVideoDuration, setSideVideoDuration] = useState(0)
  const [sideVideoPlayback, setSideVideoPlayback] = useState(1)
  const [sideVideoPlaying, setSideVideoPlaying] = useState(false)
  const [sideVideoHeight, setSideVideoHeight] = useState("")
  const [sideVideoWidth, setSideVideoWidth] = useState("")
  const [sideVideoExpanded, setSideVideoExpanded] = useState(false)
  
  const handleSideSeekChange = e => {
    const seekTo = parseFloat(e.target.value)
    onSeekTo(seekTo)
  }

  const onSeekTo = seekTo => {
    if (seekTo) {
      sideVideoRef.current.seekTo(seekTo)
      setSideVideoDuration(seekTo)
    }
  }

  const onSelectVideoGroup = e => {
    setSideVideoGroup(e.target.value)
    setSideVideo("-")
    setSideVideoUrl(undefined)
  }

  const onSelectVideo = e => {
    const name = e.target.value
    const video = publicVideos[sideVideoGroup][name]
    setSideVideo(name)
    setSideVideoUrl(video.url)
    if (name === "-") {
      onExpandVideo(false)
    }
  }

  const onExpandVideo = isExpand => {
    onExpand && onExpand(isExpand)
    setSideVideoExpanded(isExpand)
    if (isExpand) {
      setSideVideoHeight(PLAYING_VIDEO_HEIGHT)
      setSideVideoWidth(PLAYING_VIDEO_WIDTH)
    } else {
      setSideVideoHeight("")
      setSideVideoWidth("")
    }
  }

  return(
    <div className="flex flex-col content-center justify-center items-center mb-2 p-2 bg-white rounded shadow-lg">
        
      <div className="relative">
        { showUsage &&
          <div className="absolute -my-32 ml-32 w-40 bg-yellow-300 text-black text-xs font-semibold tracking-wide rounded shadow py-1.5 px-4 bottom-full z-10">
            <svg className="absolute text-yellow-300 h-2 left-0 ml-3 bottom-full" x="0px" y="0px" viewBox="0 0 600 400" xmlSpace="preserve"><polygon className="fill-current" points="0,400 300,0 600,400"/></svg>
            View instructional youtube videos pre-selected by the community
          </div>
        }
        <select className="mt-4 p-0.5 border border-gray-500 rounded shadow-md"
          onChange={onSelectVideoGroup}
          value={sideVideoGroup}
        >
          { Object.keys(publicVideos).map((name, i) => {
            return(
              <option key={i} value={name}>{ name }</option>
            )
          })}
        </select>
      </div>
        

      { sideVideoGroup !== "-" &&
          <select className="mt-1 mb-4 p-0.5 border border-gray-500 rounded shadow-md"
            onChange={onSelectVideo}
            value={sideVideo}
          >
            { Object.keys(publicVideos[sideVideoGroup]).map((name, i) => {
              return(
                <option key={i} value={name}>{ name }</option>
              )
            })}
          </select>
      }
        
      <ReactPlayer
        className="rounded-md overflow-hidden"
        ref={sideVideoRef}
        url={sideVideoUrl} 
        playing={sideVideoPlaying}
        playbackRate={sideVideoPlayback}
        progressInterval={200}
        onProgress={({ played }) => {
          setSideVideoDuration(played)
        }}
        config={{
          youtube: {
            playerVars: {
              controls: 1,
              start: video.start,
              end: video.end,
            }
          }
        }}
        onReady={() => onSeekTo(video.start)}
        height={sideVideoHeight}
        width={sideVideoWidth}
      />

      {/* Controls Panel */}
          
      <div className="flex flex-row content-center justify-center items-center mt-4">

        <div className="relative">
          { showUsage &&
          <div className="absolute w-32 -my-14 -ml-24 bg-yellow-300 text-black text-xs font-semibold tracking-wide rounded shadow py-1.5 px-4 bottom-full z-100">
            <svg className="absolute text-yellow-300 h-2 right-0 mr-3 bottom-full" x="0px" y="0px" viewBox="0 0 600 400" xmlSpace="preserve"><polygon className="fill-current" points="0,400 300,0 600,400"/></svg>
            Expand video
          </div>
          }
          {/* Expand */}
          { sideVideoExpanded &&
            <IconContext.Provider value={{ color: "blue", height: "8px", width: "8px" }}>
              <div className="m-2 items-stretch content-center justify-center items-center cursor-pointer">
                <BiCollapse onClick={() => onExpandVideo(false)}/>
              </div>
            </IconContext.Provider>
          }
          { !sideVideoExpanded &&
            <IconContext.Provider value={{ color: "blue", height: "8px", width: "8px" }}>
              <div className="m-2 items-stretch content-center justify-center items-center cursor-pointer">
                <FaExpand onClick={() => onExpandVideo(true)}/>
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

      <div className="flex flex-col content-center justify-center items-center mt-4">
        {/* Seek */}
        <input
          type='range'
          value={sideVideoDuration}
          min={0}
          max={1}
          step='0.0001'
          onChange={handleSideSeekChange}
        />

        <div className="bg-white rounded p-0.5 mx-1 text-xs">
          <span> { sideVideoDuration ? sideVideoDuration.toFixed(4) : "0.0000" }/1.0</span>
        </div>
      </div>

      <div className="flex flex-col content-center justify-center items-center mt-1 bg-gray-100 rounded">
        <div className="flex flex-row content-center justify-center items-center p-4">
          <input type='button'
            className="border w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-md"
            onClick={() => setSideVideoPlayback(0.25)}
            value=".25x"
          />
          <input type='button'
            className="border w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-md"
            onClick={() => setSideVideoPlayback(0.5)}
            value=".5x"
          />
          <input type='button'
            className="border w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-md"
            onClick={() => setSideVideoPlayback(1)}
            value="1x"
          />
          <input type='button'
            className="border w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-md"
            onClick={() => setSideVideoPlayback(2)}
            value="2x"
          />
          <input type='button'
            className="border w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-md"
            onClick={() => setSideVideoPlayback(3)}
            value="3x"
          />
        </div>
      </div>
    </div>
  )
}

VideoResources.propTypes = {
  defaultVideoGroup: PropTypes.string,
  defaultVideo: PropTypes.string,
  showUsage: PropTypes.bool,

  onExpand: PropTypes.func,
}
  
export default VideoResources