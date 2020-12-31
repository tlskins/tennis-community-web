import React, { useEffect, useState, createRef, useRef } from "react"
import { connect } from "react-redux"
import ReactPlayer from "react-player"

// 13 react players running at the same time took half my cpu

const videos = [
  "https://tennis-swings.s3.amazonaws.com/timuserid/2020_12_18_1152_59/tim_ground_profile_wide_540p_clip_1_swing_1.mp4",
  "https://tennis-swings.s3.amazonaws.com/timuserid/2020_12_18_1152_59/tim_ground_profile_wide_540p_clip_1_swing_2.mp4",
  "https://tennis-swings.s3.amazonaws.com/timuserid/2020_12_18_1152_59/tim_ground_profile_wide_540p_clip_1_swing_3.mp4",
  "https://tennis-swings.s3.amazonaws.com/timuserid/2020_12_18_1152_59/tim_ground_profile_wide_540p_clip_1_swing_4.mp4",
  "https://tennis-swings.s3.amazonaws.com/timuserid/2020_12_18_1152_59/tim_ground_profile_wide_540p_clip_1_swing_5.mp4",
  "https://tennis-swings.s3.amazonaws.com/timuserid/2020_12_18_1152_59/tim_ground_profile_wide_540p_clip_1_swing_6.mp4",
  "https://tennis-swings.s3.amazonaws.com/timuserid/2020_12_18_1152_59/tim_ground_profile_wide_540p_clip_1_swing_7.mp4",
  "https://tennis-swings.s3.amazonaws.com/timuserid/2020_12_18_1152_59/tim_ground_profile_wide_540p_clip_2_swing_1.mp4",
  "https://tennis-swings.s3.amazonaws.com/timuserid/2020_12_18_1152_59/tim_ground_profile_wide_540p_clip_2_swing_2.mp4",
  // "https://tennis-swings.s3.amazonaws.com/timuserid/2020_12_18_1152_59/tim_ground_profile_wide_540p_clip_2_swing_3.mp4",
  // "https://tennis-swings.s3.amazonaws.com/timuserid/2020_12_18_1152_59/tim_ground_profile_wide_540p_clip_2_swing_4.mp4",
  // "https://tennis-swings.s3.amazonaws.com/timuserid/2020_12_18_1152_59/tim_ground_profile_wide_540p_clip_2_swing_5.mp4",
  // "https://tennis-swings.s3.amazonaws.com/timuserid/2020_12_18_1152_59/tim_ground_profile_wide_540p_clip_2_swing_6.mp4",
]

const publicVideos = [
  "https://tennis-swings.s3.amazonaws.com/public/federer_backhand.mp4",
  "https://tennis-swings.s3.amazonaws.com/public/federer_forehand.mp4",
]

const Album = () => {
  const videosCount = videos.length

  const [playbackRate, setPlaybackRate] = useState(1)
  const [allPlaying, setAllPlaying] = useState(true)
  const [playerRefs, setPlayerRefs] = useState([])
  const [playerDurations, setPlayerDurations] = useState({})
  const [playings, setPlayings] = useState([])
  const [pips, setPips] = useState([]) // Picture in picture for each player

  const sideVideoRef = useRef(undefined)
  const [sideVideo, setSideVideo] = useState(publicVideos[0])
  const [sideVideoDuration, setSideVideoDuration] = useState(0)
  const [sideVideoPlayback, setSideVideoPlayback] = useState(1)
  const [sideVideoPlaying, setSideVideoPlaying] = useState(false)
  const [sideVideoPip, setSideVideoPip] = useState(false)

  useEffect(() => {
    setPlayerRefs(playerRefs => (
      Array(videosCount).fill().map((_, i) => playerRefs[i] || createRef())
    ))
    setPlayings(Array(videosCount).fill().map(() => true))
    setPips(Array(videosCount).fill().map(() => false))
  }, [videosCount])


  const handleAllSeekChange = e => {
    const seekTo = parseFloat(e.target.value)
    if (seekTo) {
      setPlayings(Array(videosCount).fill().map(() => false))
      playerRefs.forEach( playerRef => playerRef.current.seekTo(seekTo))
    }
  }

  const handleSeekChange = (playerRef, i) => e => {
    const seekTo = parseFloat(e.target.value)
    if (seekTo) {
      playerRef.current.seekTo(seekTo)
      setPlayerDurations({
        ...playerDurations,
        [i]: seekTo,
      })
    }
  }

  const handleSideSeekChange = e => {
    const seekTo = parseFloat(e.target.value)
    if (seekTo) {
      sideVideoRef.current.seekTo(seekTo)
      setSideVideoDuration(seekTo)
    }
  }

  return (
    <div className="flex flex-col h-screen min-h-screen">
      {/* <header>{title}</header> */}

      <main className="flex flex-1 overflow-y-auto">

        {/* Sidebar */}

        <div className="h-screen top-0 sticky p-4 bg-white w-1/4">
          <div className="flex flex-col content-center justify-center items-center">
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

        {/* Main Body */}

        <div className="p-8 flex flex-wrap">
          { videos.map( (videoUrl, i) => {
            return (
              <div className="flex flex-col w-1/3 content-center justify-center items-center"
                key={i}
              >
                {/* flex flex-col p-2 m-4 w-1/6 h-1/4 content-center justify-center items-center rounded shadow-md */}
                <ReactPlayer
                  className="rounded-md overflow-hidden"
                  ref={playerRefs[i]}
                  url={videoUrl} 
                  playing={playings[i]}
                  pip={pips[i]}
                  volume={0}
                  muted={true}
                  playbackRate={playbackRate}
                  loop={true}
                  progressInterval={200}
                  onProgress={({ played }) => setPlayerDurations({
                    ...playerDurations,
                    [i]: parseFloat((Math.ceil(played/.05)*.05).toFixed(2)),
                  })}
                  height=""
                  width=""
                />

                {/* Controls Panel */}
                <div className="flex flex-row content-center justify-center p-1 mt-4 bg-gray-100 rounded">
                  {/* Picture in Picture */}
                  { pips[i] &&
                    <input type='button'
                      className='border rounded p-0.5 mx-1 text-xs font-bold bg-indigo-700 text-white'
                      value='-'
                      tabIndex={(i*3)+1}
                      onClick={() => {
                        const newPips = pips.map((p,j) => j === i ? false : p)
                        setPips(newPips)
                      }}
                    />
                  }
                  { !pips[i] &&
                    <input type='button'
                      className='border rounded p-0.5 mx-1 text-xs font-bold bg-indigo-700 text-white'
                      value='+'
                      tabIndex={(i*3)+1}
                      onClick={() => {
                        const newPips = pips.map((p,j) => j === i ? true : p)
                        setPips(newPips)
                      }}
                    />
                  }

                  {/* Play / Pause */}
                  { playings[i] &&
                    <input type='button'
                      className='border w-10 rounded p-0.5 mx-1 text-xs bg-red-700 text-white'
                      value='pause'
                      tabIndex={(i*3)+2}
                      onClick={() => {
                        const newPlayings = playings.map((p,j) => j === i ? false : p)
                        setPlayings(newPlayings)
                      }}
                    />
                  }
                  { !playings[i] &&
                    <input type='button'
                      className='border w-10 rounded p-0.5 mx-1 text-xs bg-green-700 text-white'
                      value='play'
                      tabIndex={(i*3)+2}
                      onClick={() => {
                        const newPlayings = playings.map((p,j) => j === i ? true : p)
                        setPlayings(newPlayings)
                        setPlayerDurations({
                          ...playerDurations,
                          [i]: undefined,
                        })
                      }}
                    />
                  }
                  
                  {/* Seek */}
                  <input
                    type='range'
                    tabIndex={(i*3)+3}
                    value={playerDurations[i]}
                    min={0}
                    max={1}
                    step='0.05'
                    onChange={handleSeekChange(playerRefs[i], i)}
                    onFocus={ e => {
                      console.log("focus!")
                      e.stopPropagation()
                      e.preventDefault()
                    }}
                  />

                  <div className="bg-white rounded p-0.5 mx-1 text-xs">
                    <span> { playerDurations[i] ? playerDurations[i].toFixed(2) : "0.00" }/1.0</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* All Video Controls Footer */}
      <footer className="flex-none bg-blue-100">
        <div className="p-4 w-full flex flex-row content-center justify-center items-center">
          { allPlaying &&
            <input type='button'
              className="border w-10 rounded p-0.5 mx-1 text-xs bg-red-700 text-white"
              onClick={() => {
                setAllPlaying(false)
                setPlayings(Array(videosCount).fill().map(() => false))
              }}
              value="Pause"
            />
          }
          { !allPlaying &&
            <input type='button'
              className="border w-10 rounded p-0.5 mx-1 text-xs bg-green-700 text-white"
              onClick={() => {
                setAllPlaying(true)
                setPlayings(Array(videosCount).fill().map(() => true))
              }}
              value="Play"
            />
          }

          <input
            type='range'
            min={0}
            max={0.999999}
            step='0.1'
            onMouseUp={handleAllSeekChange}
            onKeyDown={handleAllSeekChange}
          />

          <div className="flex flex-row content-center justify-center items-center p-4">
            <input type='button'
              className="border w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-md"
              onClick={() => setPlaybackRate(0.1)}
              value=".1x"
            />
            <input type='button'
              className="border w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-md"
              onClick={() => setPlaybackRate(0.25)}
              value=".25x"
            />
            <input type='button'
              className="border w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-md"
              onClick={() => setPlaybackRate(0.5)}
              value=".5x"
            />
            <input type='button'
              className="border w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-md"
              onClick={() => setPlaybackRate(1)}
              value="1x"
            />
            <input type='button'
              className="border w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-md"
              onClick={() => setPlaybackRate(1.5)}
              value="1.5x"
            />
          </div>
        </div>
      </footer>
    </div>
  )
}

const mapStateToProps = (state) => state

export default connect(mapStateToProps, undefined)(Album)