import React, { useState } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import { useRouter } from "next/router"

import { CreateUser, SignIn, SignOut } from "../behavior/coordinators/users"
import { newNotification } from "../state/ui/action"
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

const Index = ({ createUser, signIn, signOut, user, displayAlert }) => {
  const router = useRouter()
  const [isNewUser, setIsNewUser] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userName, setUserName] = useState("")

  const clearForm = () => {
    setFirstName("")
    setLastName("")
    setEmail("")
    setPassword("")
    setUserName("")
  }

  const onToggleForm = () => {
    clearForm()
    setIsNewUser(!isNewUser)
  }

  const onCreateUser = async () => {
    const success = await createUser({
      firstName,
      lastName,
      email,
      password,
      userName,
    })
    if (success) {
      clearForm()
      displayAlert({ alertType: "success", message: `Confirmation email sent to ${email}`})
    }
  }

  const onSignIn = async () => {
    const success = await signIn({ email, password })
    if (success) {
      clearForm()
      router.push("/albums")
    }
  }

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
          <p className="footer-title">Have a question or feedback?</p>
          <p className="footer-subtitle">Reach us at <a href="mailto: queenbee@hivetennis.com">queenbee@hivetennis.com</a></p>
        </FooterInner>
      </Footer>
      {/*<main className="flex flex-1 overflow-y-auto content-center justify-center items-center">
        { user &&
          <div className="p-8">
            <button onClick={signOut}>
              Sign Out
            </button>
          </div>
        }

        <div className="p-12">
          { isNewUser &&
            <div className="flex flex-col">
              <h2 className="my-2 font-bold">
                New User
              </h2>
              <input type="text"
                className="border m-1 p-1 rounded"
                placeholder="user name"
                value={userName}
                onChange={e => setUserName(e.target.value)}
              />
              <input type="text"
                className="border m-1 p-1 rounded"
                placeholder="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <input type="text"
                className="border m-1 p-1 rounded"
                placeholder="first name"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
              />
              <input type="text"
                placeholder="last name"
                className="border m-1 p-1 rounded"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
              />
              <input type="text"
                placeholder="password"
                className="border m-1 p-1 rounded"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <input type="button"
                value="Submit"
                onClick={onCreateUser}
              />
              <a className="cursor-pointer underline text-blue-300"
                onClick={onToggleForm}
              >
                Sign In
              </a>
            </div>
          }

          { !isNewUser &&
            <div className="flex flex-col">
              <h2 className="my-2 font-bold">
                Sign In
              </h2>
              <input type="text"
                className="border m-1 p-1 rounded"
                placeholder="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <input type="text"
                placeholder="password"
                className="border m-1 p-1 rounded"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <input type="button"
                value="Submit"
                onClick={onSignIn}
              />
              <a className="cursor-pointer underline text-blue-300"
                onClick={onToggleForm}
              >
                New User
              </a>
            </div>
          }

        </div>
      </main>*/}
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    createUser: CreateUser(dispatch),
    signIn: SignIn(dispatch),
    signOut: SignOut(dispatch),
    displayAlert: ({ alertType, message }) => dispatch(newNotification({
      alertType,
      message,
    }))
  }
}

Index.propTypes = {
  user: PropTypes.object,

  createUser: PropTypes.func,
  displayAlert: PropTypes.func,
  signIn: PropTypes.func,
  signOut: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(Index)
