import React, { useState, useEffect, createRef } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import { useRouter } from "next/router"
import Head from "next/head"
import Moment from "moment"

import { LoadPublicAlbums } from "../behavior/coordinators/albums"
import { setLoginFormVisible } from "../state/ui/action"
import SwingPlayer from "../components/SwingPlayer"

import bg from "../public/homepage-bg.jpg"
import mobileBg from "../public/homepage-mobile.jpg"
import footerBg from "../public/footer.jpg"
import footerBgMobile from "../public/footer-mobile.jpg"
import camera from "../public/camera-icon.svg"
import racket from "../public/racket-icon.svg"
import speech from "../public/speech-icon.svg"

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

const Index = ({ publicAlbums, loadPublicAlbums, user, onShowNewUser }) => {
  const router = useRouter()

  const [playerRefs, setPlayerRefs] = useState([])
  const [playerFrames, setPlayerFrames] = useState({})
  const [playings, setPlayings] = useState([])
  const [pips, setPips] = useState([])

  useEffect(() => {
    loadPublicAlbums({ homeApproved: true, limit: 3 })
  }, [])

  useEffect(() => {
    if (publicAlbums.length > 0) {
      setPlayerRefs(ref => publicAlbums.map((_, i) => ref[i] || createRef()))
      setPlayings(publicAlbums.map(() => true))
      setPips(publicAlbums.map(() => false))
    }
  }, [publicAlbums])

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

  const onGetStarted = () => {
    user ? router.push("/home") : onShowNewUser()
  }

  return (
    <>
      <Head>
        {/* <!-- HTML Meta Tags --> */}
        <title>Hive Tennis</title>
        <meta name="description" content="Automatically cut swings from your tennis videos! HiveTennis is a platform to quickly cut, analyze, and get feedback on your tennis!" key="desc"/>

        {/* <!-- Facebook Meta Tags --> */}
        <meta property="og:url" content="https://tennis-community-web.vercel.app/" key="ogurl" name="ogurl"/>

        <meta property="og:type" content="website" key="ogtype" name="ogtype"/>
        <meta property="og:title" content="Hive Tennis" key="ogtitle" name="ogtitle"/>
        <meta property="og:description" content="Automatically cut swings from your tennis videos! HiveTennis is a platform to quickly cut, analyze, and get feedback on your tennis!" key="ogdesc" name="ogdesc"/>
        <meta property="og:image" content="https://d198sck6ekbnwc.cloudfront.net/homepage-bg.jpg" key="ogimg" name="ogimg"/>

        {/* <!-- Twitter Meta Tags --> */}
        <meta name="twitter:card" content="summary_large_image" key="twitter_card"/>
        <meta property="twitter:domain" content="tennis-community-web.vercel.app" key="twitter_dom" name="twitter_dom"/>
        <meta property="twitter:url" content="https://tennis-community-web.vercel.app/" key="twitter_url" name="twitter_url"/>
        <meta name="twitter:title" content="Hive Tennis" key="twitter_title"/>
        <meta name="twitter:description" content="Automatically cut swings from your tennis videos! HiveTennis is a platform to quickly cut, analyze, and get feedback on your tennis!" key="twitter_desc"/>
        <meta name="twitter:image" content="https://d198sck6ekbnwc.cloudfront.net/homepage-bg.jpg" key="twitter_img"/>

        {/* <!-- Meta Tags Generated via https://www.opengraph.xyz --> */}
      </Head>
      <Header bg={ bg } mobileBg={ mobileBg }>
        <HeaderTitleContainer>
          <HeaderTitle>We automatically cut every swing from your tennis videos</HeaderTitle>
          <HeaderTitle>You analyze & get feedback from the community</HeaderTitle>
          <CTAButton onClick={onGetStarted}>
            Get Started
          </CTAButton>
        </HeaderTitleContainer>
      </Header>
      <Section>
        <IconSection>
          <IconContainer>
            <img src={ racket }/>
            <h3>Record Tennis Playing</h3>
            <p>Record videos of yourself playing tennis with your mobile phone</p>
          </IconContainer>
          <IconContainer>
            <img src={ camera }/>
            <h3>Upload Videos</h3>
            <p>Upload videos and automatically have all swings exported with our AI into an Album</p>
          </IconContainer>
          <IconContainer>
            <img src={ racket }/>
            <h3>Analyze Swings</h3>
            <p>Use our Swing Analysis platform to slow down & analyze your swings frame by frame against the pros</p>
          </IconContainer>
          <IconContainer>
            <img src={ speech }/>
            <h3>Get Feedback</h3>
            <p>Share your Albums with friends, coaches, or the community to get frame by frame feedback on your swings</p>
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

              <div className="lg:flex flex-row lg:w-full lg:justify-between lg:mx-1">
                { publicAlbums.map( (album, idx) => {
                  return (
                    <div key={idx}
                      className="p-2 mx-4 w-72 flex flex-col content-center justify-center items-center hover:bg-green-200 rounded-md"
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
                      <SwingPlayer
                        albumId={album.id}
                        showAlbumUsage={false}
                        swing={album.swingVideos[0]}
                        swingFrames={SWING_FRAMES}
                        i={idx}
                        playbackRate={1}
                        pips={pips}
                        playings={playings}
                        playerFrames={playerFrames}
                        playerRefs={playerRefs}
                        playerWidth="320px"
                        playerHeight="230px"
                        handleSeekChange={handleSeekChange}
                        setPips={setPips}
                        setPlayings={setPlayings}
                        setPlayerFrames={setPlayerFrames}
                      />
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
          <p className="footer-subtitle">Reach us at <a href="mailto: queenbee@hivetennis.com">queenbee@hivetennis.com</a></p>
        </FooterInner>
      </Footer>
    </>
  )
}


const mapStateToProps = (state) => {
  return {
    user: state.user,
    publicAlbums: state.albums.publicAlbums,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    loadPublicAlbums: LoadPublicAlbums(dispatch),
    onShowNewUser: () => dispatch(setLoginFormVisible("REGISTER")),
  }
}
  
Index.propTypes = {
  user: PropTypes.object,
  publicAlbums: PropTypes.arrayOf(PropTypes.object),

  loadPublicAlbums: PropTypes.func,
  onShowNewUser: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(Index)