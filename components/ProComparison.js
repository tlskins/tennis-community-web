import React, { useState, useRef } from "react"
import ReactPlayer from "react-player"

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
  


const ProComparison = () => {
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

        {/* Controls Panel */}
          
        <div className="flex flex-row content-center justify-center items-center mt-4">
          {/* Picture in Picture */}
          { sideVideoPip &&
            <input type='button'
              className='border rounded p-0.5 mx-1 text-xs font-bold bg-indigo-700 text-white'
              value='-'
              onClick={() => setSideVideoPip(false)}
            />
          }
          { !sideVideoPip &&
            <input type='button'
              className='border rounded p-0.5 mx-1 text-xs font-bold bg-indigo-700 text-white'
              value='+'
              onClick={() => setSideVideoPip(true)}
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
            step='0.05'
            onChange={handleSideSeekChange}
          />

          <div className="bg-white rounded p-0.5 mx-1 text-xs">
            <span> { sideVideoDuration ? sideVideoDuration.toFixed(2) : "0.00" }/1.0</span>
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
  
export default ProComparison