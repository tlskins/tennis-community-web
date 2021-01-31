import React, { useState, useRef } from "react"
import ReactPlayer from "react-player"
import PropTypes from "prop-types"


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

const VideoResources = ({ expanded, onExpand }) => {
  const [sideVideoGroup, setSideVideoGroup] = useState("-")
  const [sideVideo, setSideVideo] = useState("-")

  const video = publicVideos[sideVideoGroup][sideVideo]
  
  const sideVideoRef = useRef(undefined)
  const [sideVideoUrl, setSideVideoUrl] = useState(video.url)
  const [sideVideoDuration, setSideVideoDuration] = useState(0)
  const [sideVideoPlayback, setSideVideoPlayback] = useState(1)
  const [sideVideoPlaying, setSideVideoPlaying] = useState(false)
  const [sideVideoHeight, setSideVideoHeight] = useState("")
  const [sideVideoWidth, setSideVideoWidth] = useState("")
  
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
    onExpand(isExpand)
    if (isExpand) {
      setSideVideoHeight(PLAYING_VIDEO_HEIGHT)
      setSideVideoWidth(PLAYING_VIDEO_WIDTH)
    } else {
      setSideVideoHeight("")
      setSideVideoWidth("")
    }
  }
  
  return(
    <div className="mb-2">
      <div className="flex flex-col content-center justify-center items-center">
        <select className="mt-4 p-0.5 border border-gray-500 rounded shadow-md"
          onChange={onSelectVideoGroup}
        >
          { Object.keys(publicVideos).map((name, i) => {
            return(
              <option key={i} value={name}>{ name }</option>
            )
          })}
        </select>

        { sideVideoGroup !== "-" &&
          <select className="mt-1 mb-4 p-0.5 border border-gray-500 rounded shadow-md"
            onChange={onSelectVideo}
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
          {/* Expand */}
          { expanded &&
            <input type='button'
              className='border rounded p-0.5 mx-1 text-xs font-bold bg-indigo-700 text-white'
              value='-'
              onClick={() => onExpandVideo(false)}
            />
          }
          { !expanded &&
            <input type='button'
              className='border rounded p-0.5 mx-1 text-xs font-bold bg-indigo-700 text-white'
              value='+'
              onClick={() => onExpandVideo(true)}
            />
          }

          {/* Play / Pause */}
          { sideVideoPlaying &&
            <input type='button'
              className='border w-10 rounded p-0.5 mx-1 text-xs bg-red-700 text-white'
              value='pause'
              onClick={() => setSideVideoPlaying(false)}
            />
          }
          { !sideVideoPlaying &&
            <input type='button'
              className='border w-10 rounded p-0.5 mx-1 text-xs bg-green-700 text-white'
              value='play'
              onClick={() => setSideVideoPlaying(true)}
            />
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

        <div className="flex flex-col content-center justify-center items-center mt-4">
          <div className="flex flex-row content-center justify-center p-1 mt-4 bg-gray-100 rounded">
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
      </div>
    </div>
  )
}

VideoResources.propTypes = {
  expanded: PropTypes.bool,

  onExpand: PropTypes.func,
}
  
export default VideoResources