import Link from 'next/link'
import React, { useEffect, useState, useRef, createRef } from 'react'
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
  const [playing, setPlaying] = useState(true)
  // const [seeking, setSeeking] = useState(false)
  // const [played, setPlayed] = useState(0.0)

  const videosCount = videos.length;
  const [playerRefs, setPlayerRefs] = React.useState([]);

  React.useEffect(() => {
    // add or remove refs
    setPlayerRefs(playerRefs => (
      Array(videosCount).fill().map((_, i) => playerRefs[i] || createRef())
    ));
  }, [videosCount]);


  const handleAllSeekChange = e => {
    const seekTo = parseFloat(e.target.value)
    if (seekTo) {
      setPlaying(false)
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
        <input
          type='range'
          min={0}
          max={0.999999}
          step='0.1'
          onMouseUp={handleAllSeekChange}
          onKeyDown={handleAllSeekChange}
        />

        { playing &&
            <input type='button'
            className="border rounded p-2 m-2"
            onClick={() => setPlaying(false)}
            value="Pause"
          />
        }
        { !playing &&
          <input type='button'
            className="border rounded p-2 m-2"
            onClick={() => setPlaying(true)}
            value="Play"
          />
        }

        <div>
          <h2>Playback Rate</h2>
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
                playing={playing}
                volume={0}
                muted={true}
                playbackRate={playbackRate}
                loop={true}
                height="180px"
                width="320px"
              />
              <div className="flex flex-row content-center justify-center p-1 my-1">
                <input type='button'
                  className='border rounded p-0.5 mx-1'
                  value='play'
                  onClick={() => playerRefs[i].current.playing = true}
                />
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