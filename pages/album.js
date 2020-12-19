import Link from 'next/link'
import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { addCount } from '../store/count/action'
import { wrapper } from '../store/store'
import { serverRenderClock, startClock } from '../store/tick/action'
import Clock from '../components/Clock'
import AddCount from '../components/AddCount'
import ReactPlayer from 'react-player'

const videos = [
  // "https://tennis-swings.s3.amazonaws.com/1_5sec.mp4",
  // "https://tennis-swings.s3.amazonaws.com/2sec.mp4",
  // "https://tennis-swings.s3.amazonaws.com/timuserid/2020_12_18_1152_59/tim_ground_profile_wide_540p_clip_2_swing_5.mp4",
  // "https://tennis-swings.s3.amazonaws.com/1_5sec_v2.mp4"
  "https://tennis-swings.s3.amazonaws.com/timuserid/2020_12_18_1152_59/tim_ground_profile_wide_1min_540p_clip_1_swing_1.mp4",
  "https://tennis-swings.s3.amazonaws.com/timuserid/2020_12_18_1152_59/tim_ground_profile_wide_1min_540p_clip_1_swing_2.mp4",
  "https://tennis-swings.s3.amazonaws.com/timuserid/2020_12_18_1152_59/tim_ground_profile_wide_1min_540p_clip_1_swing_3.mp4",
  "https://tennis-swings.s3.amazonaws.com/timuserid/2020_12_18_1152_59/tim_ground_profile_wide_1min_540p_clip_1_swing_4.mp4",
  "https://tennis-swings.s3.amazonaws.com/timuserid/2020_12_18_1152_59/tim_ground_profile_wide_1min_540p_clip_1_swing_5.mp4",
  "https://tennis-swings.s3.amazonaws.com/timuserid/2020_12_18_1152_59/tim_ground_profile_wide_1min_540p_clip_1_swing_6.mp4",
  "https://tennis-swings.s3.amazonaws.com/timuserid/2020_12_18_1152_59/tim_ground_profile_wide_1min_540p_clip_1_swing_7.mp4",
  "https://tennis-swings.s3.amazonaws.com/timuserid/2020_12_18_1152_59/tim_ground_profile_wide_1min_540p_clip_2_swing_1.mp4",
  "https://tennis-swings.s3.amazonaws.com/timuserid/2020_12_18_1152_59/tim_ground_profile_wide_1min_540p_clip_2_swing_2.mp4",
  "https://tennis-swings.s3.amazonaws.com/timuserid/2020_12_18_1152_59/tim_ground_profile_wide_1min_540p_clip_2_swing_3.mp4",
  "https://tennis-swings.s3.amazonaws.com/timuserid/2020_12_18_1152_59/tim_ground_profile_wide_1min_540p_clip_2_swing_4.mp4"
]


const Album = ({ startClock, tick }) => {
  const title = "Albums"
  
  // useEffect(() => {
  //   const timer = startClock()

  //   return () => {
  //     clearInterval(timer)
  //   }
  // }, [])

  console.log(videos.map( url => ReactPlayer.canPlay(url)))

  return (
    <div className="p-12">
      <h1 className="m-12">{title}</h1>

      <div className="p-8 flex flex-wrap content-center items-center justify-center">
        { videos.map( videoUrl => {
          return (
            <div className="m-2">
              <ReactPlayer
                url={videoUrl} 
                controls={true}
                playing={true}
                volume={0}
                muted={true}
                loop={true}
                height="180px"
                width="320px"
              />
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