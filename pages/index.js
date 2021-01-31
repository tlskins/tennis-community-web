import React, { useState, useEffect, Fragment, createRef } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import ReactPlayer from "react-player"
import { useRouter } from "next/router"
import Moment from "moment"

import { LoadAlbums } from "../behavior/coordinators/albums"

import bg from "../public/homepage-bg.jpg"
import mobileBg from "../public/homepage-mobile.jpg"
import footerBg from "../public/footer.jpg"
import footerBgMobile from "../public/footer-mobile.jpg"
import camera from "../public/camera-icon.svg"
import racket from "../public/racket-icon.svg"
import speech from "../public/speech-icon.svg"
import speechBubble from "../public/speech-bubble.svg"
// import colors from "../styles/colors.js"

import {
  CTAButton,
  Header,
  HeaderTitle,
  HeaderTitleContainer,
  IconContainer,
  IconSection,
  Section,
  // VideoSection,
  // VideoWrapper,
  // VideoInnerWrapper,
  CommunityVideos,
  Footer,
  FooterInner,
} from "../styles/styled-components"

const SWING_FRAMES = 60
const albumsPerRow = 3

const Index = ({ albums, loadAlbums }) => {

  console.log("env", process.env.VERCEL_GITHUB_COMMIT_REF, process.env.VERCEL_GIT_COMMIT_REF, process.env.VERCEL_ENV, process.env.ENV_TYPE)
  const router = useRouter()

  const [playerRefs, setPlayerRefs] = useState([])
  const [playerFrames, setPlayerFrames] = useState({})
  const [playings, setPlayings] = useState([])
  const [pips, setPips] = useState([]) // Picture in picture for each player
  const publicActiveAlbums = albums.publicAlbums.slice(0, albumsPerRow).filter( a => !!a )

  useEffect(() => {
    loadAlbums(true)
  }, [])

  useEffect(() => {
    const activeAlbums = [...publicActiveAlbums]
    setPlayerRefs(ref => activeAlbums.map((_, i) => ref[i] || createRef()))
    setPlayings(activeAlbums.map(() => true))
    setPips(activeAlbums.map(() => false))
  }, [albums.publicAlbums])

  const handleSeekChange = (playerRef, i) => e => {
    const frame = parseFloat(e.target.value)
    if (frame != null) {
      const seekTo = frame === SWING_FRAMES ? 0.9999 : parseFloat((frame/SWING_FRAMES).toFixed(4))
      playerRef.current.seekTo(seekTo)
      setPlayerFrames({
        ...playerFrames,
        [i]: frame,
      })
    }
  }

  const renderVideo = ({ swing, i, ref, playing, pip, duration, comments }) => {
    if (!swing) {
      return null
    }
    return(
      <Fragment>
        <ReactPlayer
          className="rounded-md overflow-hidden"
          ref={ref}
          url={swing.videoURL} 
          playing={playing}
          pip={pip}
          volume={0}
          muted={true}
          loop={true}
          progressInterval={200}
          onProgress={({ played }) => {
            const frame = Math.round(played*SWING_FRAMES)
            setPlayerFrames({
              ...playerFrames,
              [i]: frame,
            })
          }}
          height="226px"
          width="285px"
        />

        {/* Controls Panel */}
        <div className="flex flex-row content-center justify-center p-1 mt-4 bg-gray-100 rounded">

          {/* Picture in Picture */}
          { pip &&
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
          { !pip &&
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
          { playing &&
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
          { !playing &&
            <input type='button'
              className='border w-10 rounded p-0.5 mx-1 text-xs bg-green-700 text-white'
              value='play'
              tabIndex={(i*3)+2}
              onClick={() => {
                const newPlayings = playings.map((p,j) => j === i ? true : p)
                setPlayings(newPlayings)
                setPlayerFrames({
                  ...playerFrames,
                  [i]: undefined,
                })
              }}
            />
          }
          
          {/* Seek */}
          <input
            type='range'
            tabIndex={(i*3)+3}
            value={duration}
            min={0}
            max={SWING_FRAMES}
            step='1'
            onChange={handleSeekChange(ref, i)}
            onFocus={ e => {
              console.log("focus!")
              e.stopPropagation()
              e.preventDefault()
            }}
          />

          <div className="bg-white rounded p-0.5 mx-1 text-xs w-10">
            <p className="text-center"> { duration ? duration : "0" }/{SWING_FRAMES}</p>
          </div>

          <div className="flex flex-row bg-white rounded mx-1 text-xs py-0.5 w-8">
            <p className="mr-1 text-center">{ comments }</p>
            <img src={speechBubble} className="w-5 h-5"/>
          </div>
        </div>
      </Fragment>
    )
  }

  return (
    <div>
      <Header bg={ bg } mobileBg={ mobileBg }>
        <HeaderTitleContainer>
          <HeaderTitle>Upload videos from your phone & get feedback from your coach or the community!</HeaderTitle>
          <CTAButton>Get Started</CTAButton>
        </HeaderTitleContainer>
      </Header>
      <Section>
        <IconSection>
          <IconContainer>
            <img src={ camera }/>
            <h3>Upload Videos</h3>
            <p>Upload videos of yourself playing tennis and automatically have all swings exported with our AI.</p>
          </IconContainer>
          <IconContainer>
            <img src={ racket }/>
            <h3>Analyze Swings</h3>
            <p>Watch your swings on our state of the art video analysis platform and compare your swings frame by frame with the pros.</p>
          </IconContainer>
          <IconContainer>
            <img src={ speech }/>
            <h3>Get Feedback</h3>
            <p>Share your swings with friends, coaches, or the community to get frame by frame feedback on your swings.</p>
          </IconContainer>
        </IconSection>
      </Section>
      {/* <Section bg={ colors.gray800 }>
        <VideoSection>
          <h2>See How It Works</h2>
          <VideoWrapper>
            <VideoInnerWrapper>
              <iframe width="560" height="315" src="https://www.youtube.com/embed/CGRzfUccmNE" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            </VideoInnerWrapper>
          </VideoWrapper>
        </VideoSection>
      </Section> */}
      <div className="w-full border border-t border-gray-300">
        <Section>
          <CommunityVideos>
            <div className="flex flex-col">
              <h2 className="underline cursor-pointer text-blue-600"
                onClick={() => router.push("/albums")}
              >
              Latest Community Uploads
              </h2>
              <div className="flex flex-row">
                { publicActiveAlbums.map( (album, idx) => {
                  return (
                    <div key={idx}
                      className="flex flex-col content-center justify-center items-center hover:bg-green-200 rounded-md p-2 mr-2"
                    >
                      <p className="font-semibold text-blue-700 underline cursor-pointer"
                        onClick={() => router.push(`/albums/${album.id}`)}
                      >
                        { album.name }
                      </p>
                      <p>
                        <span className="font-semibold text-xs"> Created: </span> 
                        <span className="text-xs">{ Moment(album.createdAt).format("LLL") }</span>
                      </p>
                      { 
                        renderVideo({
                          swing: album.swingVideos[0],
                          i: idx,
                          ref: playerRefs[idx],
                          playing: playings[idx],
                          pip: pips[idx],
                          duration: playerFrames[idx],
                          comments: (album.comments?.length || 0) + album.swingVideos.reduce((acc, swing) => acc + (swing.comments?.length || 0), 0),
                        })
                      }
                    </div>
                  )
                })}
              </div>
            </div>          
          </CommunityVideos>
        </Section>
      </div>
      <Footer bg={ footerBg } mobileBg={ footerBgMobile }>
        <FooterInner>
          <p className="footer-title">Have questions or feedback?</p>
          <p className="footer-subtitle">Reach us at <a href="mailto: hivetennis@gmail.com">hivetennis@gmail.com</a></p>
        </FooterInner>
      </Footer>
    </div>
  )
}


const mapStateToProps = (state) => {
  console.log("mapStateToProps", state)
  return {
    albums: state.albums,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    loadAlbums: LoadAlbums(dispatch),
  }
}
  
Index.propTypes = {
  albums: PropTypes.object,

  loadAlbums: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(Index)