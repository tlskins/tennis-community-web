import Link from 'next/link'
import { useEffect, useState, useRef, createRef } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { addCount } from '../store/count/action'
import { wrapper } from '../store/store'
import { serverRenderClock, startClock } from '../store/tick/action'
import Clock from '../components/Clock'
import AddCount from '../components/AddCount'
import ReactPlayer from 'react-player'

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
  const [playbackRate, setPlaybackRate] = useState(1)
  const [allPlaying, setAllPlaying] = useState(true)
  const videosCount = videos.length;
  const [playerRefs, setPlayerRefs] = useState([]);
  const [playings, setPlayings] = useState([])

  useEffect(() => {
    // add or remove refs
    setPlayerRefs(playerRefs => (
      Array(videosCount).fill().map((_, i) => playerRefs[i] || createRef())
    ));

    setPlayings(Array(videosCount).fill().map(() => true))
  }, [videosCount]);


  const handleAllSeekChange = e => {
    const seekTo = parseFloat(e.target.value)
    if (seekTo) {
      setPlayings(Array(videosCount).fill().map(() => false))
      playerRefs.forEach( playerRef => playerRef.current.seekTo(seekTo))
    }
  }

  const handleSeekChange = playerRef => e => {
    const seekTo = parseFloat(e.target.value)
    if (seekTo) {
      playerRef.current.seekTo(seekTo)
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

        <div className="flex flex-col align-center content-center justify-center p-4">
          <h2>Speed</h2>
          <input type="text"
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
            <div className="m-2 w-1/4 flex flex-col items-center">
              <ReactPlayer
                ref={playerRefs[i]}
                url={videoUrl} 
                playing={playings[i]}
                volume={0}
                muted={true}
                playbackRate={playbackRate}
                loop={true}
                height="180px"
                width="320px"
              />
              <div className="flex flex-row content-center justify-center p-1 my-1">
                { playings[i] &&
                  <input type='button'
                    className='border rounded p-0.5 mx-1'
                    value='pause'
                    onClick={() => {
                      const newPlayings = playings.map((p,j) => j === i ? false : p)
                      setPlayings(newPlayings)
                    }}
                  />
                }
                { !playings[i] &&
                  <input type='button'
                    className='border rounded p-0.5 mx-1'
                    value='play'
                    onClick={() => {
                      const newPlayings = playings.map((p,j) => j === i ? true : p)
                      setPlayings(newPlayings)
                    }}
                  />
                }
                
                <input type='range'
                  min={0}
                  max={0.999999}
                  step='0.1'
                  onMouseUp={handleSeekChange(playerRefs[i])}
                  onKeyDown={handleSeekChange(playerRefs[i])}
                />
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