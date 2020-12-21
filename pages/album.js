import Link from 'next/link'
import { useEffect, useState, createRef } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { addCount } from '../store/count/action'
import { wrapper } from '../store/store'
import { serverRenderClock, startClock } from '../store/tick/action'
import Clock from '../components/Clock'
import AddCount from '../components/AddCount'
import ReactPlayer from 'react-player'

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


const Album = ({ startClock, tick }) => {
  const title = "Albums"
  const videosCount = videos.length;

  const [playbackRate, setPlaybackRate] = useState(1)
  const [allPlaying, setAllPlaying] = useState(true)
  const [playerRefs, setPlayerRefs] = useState([]);
  const [playerDurations, setPlayerDurations] = useState({})
  const [playings, setPlayings] = useState([])
  const [pips, setPips] = useState([]) // Picture in picture for each player

  useEffect(() => {
    setPlayerRefs(playerRefs => (
      Array(videosCount).fill().map((_, i) => playerRefs[i] || createRef())
    ));
    setPlayings(Array(videosCount).fill().map(() => true))
    setPips(Array(videosCount).fill().map(() => false))
  }, [videosCount]);


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
      console.log(seekTo)
      setPlayerDurations({
        ...playerDurations,
        [i]: seekTo,
      })
    }
  }

  return (
    <div className="p-12">
      <h1 className="m-12">{title}</h1>

      <div className="my-6 p-4 w-full flex flex-col items-center">
        { allPlaying &&
            <input type='button'
            className="border rounded p-2 m-2"
            onClick={() => {
              setAllPlaying(false)
              setPlayings(Array(videosCount).fill().map(() => false))
            }}
            value="Pause"
          />
        }
        { !allPlaying &&
          <input type='button'
            className="border rounded p-2 m-2"
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

        <div className="flex flex-col items-center p-4">
          <h2 className="w-1/2 text-center">
            Speed
          </h2>
          <input type="text"
            className="w-1/2 text-center rounded"
            placeholder="1"
            onChange={e => {
              const rate = parseFloat(e.target.value)
              if (rate) {
                setPlaybackRate(rate)
              }
            }}
          />
        </div>
      </div>
      
      <div className="p-8 flex flex-wrap">
        { videos.map( (videoUrl, i) => {
          return (
            <div className="flex flex-col p-2 m-4 w-1/6 h-1/4 content-center justify-center items-center rounded shadow-md">
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
                    className='border rounded p-0.5 mx-1 text-xs bg-blue-400'
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
                    className='border rounded p-0.5 mx-1 text-xs bg-blue-400'
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
                    className='border w-10 bg-gray-200 rounded p-0.5 mx-1 text-xs bg-red-700 text-white'
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
                    className='border w-10 bg-gray-200 rounded p-0.5 mx-1 text-xs bg-green-700 text-white'
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
                    console.log('focus!')
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                />

                <div className="bg-white rounded p-0.5 mx-1 text-xs">
                  <span> { playerDurations[i] ? playerDurations[i].toFixed(2) : '0.00' }/1.0</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <nav>
        <Link href="/">
          <a>Home</a>
        </Link>
      </nav>
    </div>
  )
}

export const getServerSideProps = wrapper.getServerSideProps(
  async ({ store }) => {
    store.dispatch(serverRenderClock(true))
    store.dispatch(addCount())
  }
)

const mapStateToProps = (state) => state

const mapDispatchToProps = (dispatch) => {
  return {
    addCount: bindActionCreators(addCount, dispatch),
    startClock: bindActionCreators(startClock, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Album)