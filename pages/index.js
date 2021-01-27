import React from "react"

import bg from "../public/homepage-bg.jpg"
import mobileBg from "../public/homepage-mobile.jpg"
import footerBg from "../public/footer.jpg"
import footerBgMobile from "../public/footer-mobile.jpg"
import camera from "../public/camera-icon.svg"
import racket from "../public/racket-icon.svg"
import speech from "../public/speech-icon.svg"
import colors from "../styles/colors.js"

import {
  CTAButton,
  Header,
  HeaderTitle,
  HeaderTitleContainer,
  IconContainer,
  IconSection,
  Section,
  VideoSection,
  VideoWrapper,
  VideoInnerWrapper,
  CommunityVideos,
  Footer,
  FooterInner,
} from "../styles/styled-components"


const Index = () => {
  return (
    <div>
      <Header bg={ bg } mobileBg={ mobileBg }>
        <HeaderTitleContainer>
          <HeaderTitle>Upload videos of you playing tennis from your phone & get feedback from your coach or the community!</HeaderTitle>
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
      <Section bg={ colors.gray800 }>
        <VideoSection>
          <h2>See How It Works</h2>
          <VideoWrapper>
            <VideoInnerWrapper>
              <iframe width="560" height="315" src="https://www.youtube.com/embed/CGRzfUccmNE" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </VideoInnerWrapper>
          </VideoWrapper>
        </VideoSection>
      </Section>
      <Section>
        <CommunityVideos>
          <h2>Latest Community Uploads</h2>
        </CommunityVideos>
      </Section>
      <Footer bg={ footerBg } mobileBg={ footerBgMobile }>
        <FooterInner>
          <p className="footer-title">Have questions or feedback?</p>
          <p className="footer-subtitle">Reach us at <a href="mailto: queenbee@hivetennis.com">queenbee@hivetennis.com</a></p>
        </FooterInner>
      </Footer>
    </div>
  )
}


export default Index
