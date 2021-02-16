import React, { useState, useEffect } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import Link from "next/link"
import { useRouter } from "next/router"
import Moment from "moment"

import { ConfirmUser, LoadConfirmation } from "../behavior/coordinators/users"
import { getUserIcon } from "../behavior/users"
import { newNotification, setLoginFormVisible } from "../state/ui/action"
import LoginForm from "./LoginForm"
import ProfileForm from "./ProfileForm"
import Modal from "./Modal"

import {
  LinkClass,
  LinksContainer,
  NavigationBar,
} from "../styles/styled-components"


const NavBar = ({
  confirmation,
  user,
  
  confirmUser,
  displayAlert,
  loadConfirmation,
  setShowLoginForm,
  showLoginForm,
}) => {
  const router = useRouter()
  const { confirmation: confirmationID } = router.query

  const [showProfileForm, setShowProfileForm] = useState(false)

  useEffect(() => {
    if (confirmationID) {
      loadConfirmation(confirmationID)
    }
  }, [confirmationID])

  useEffect(async () => {
    if (confirmation && !confirmation.email) {
      displayAlert({
        id: Moment().toString(),
        bgColor: "bg-yellow-700",
        message: "Confirming user..."
      })
      if (await confirmUser(confirmation.id)) {
        displayAlert({
          id: Moment().toString(),
          message: "User confirmed!"
        })
        router.push("/profile")
      }
    }
  }, [confirmation])


  useEffect(() => {
    setShowProfileForm(showLoginForm)
  }, [showLoginForm])

  return(
    <NavigationBar>
      <Link href="/">
        <p className="inline-block whitespace-nowrap text-yellow-300 cursor-pointer">Hive Tennis</p>
      </Link>
      { !user || !user.id ?
        <LinksContainer>
          <div className="static">
            <a href="#" onClick={() => setShowLoginForm(confirmation?.email ? "INVITE" : "SIGN_IN")}
              className="text-yellow-300"
            >
              { confirmation?.email ? "Accept Invitation" : "Sign In" }
            </a>
            { showLoginForm &&
              <Modal width="400" hideModal={ () => setShowLoginForm("")}>
                <LoginForm/>
              </Modal>
            }
          </div>
        </LinksContainer>
        :
        <LinksContainer>
          <LinkClass active={ router.pathname === "/profile" }>
            <Link href="/profile">Profile</Link>
          </LinkClass>
          <LinkClass active={ router.pathname === "/albums" }>
            <Link href="/albums">Albums</Link>
          </LinkClass>
          { user.isAdmin &&
            <LinkClass active={ router.pathname === "/admin" }>
              <Link href="/admin">Admin</Link>
            </LinkClass>
          }
          <img src={getUserIcon(user)}
            className="w-8 h-8 mx-3 rounded-full cursor-pointer bg-white bg-opacity-25"
            onClick={() => setShowProfileForm(!showProfileForm)}
          />
          { showProfileForm &&
            <Modal width="400" hideModal={ () => setShowProfileForm(false)}>
              <ProfileForm/>
            </Modal>
          }
        </LinksContainer>
      }
    </NavigationBar>
  )
}

const mapStateToProps = (state) => {
  return {
    confirmation: state.confirmation,
    showLoginForm: state.navBar.showLoginForm,
    user: state.user,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    confirmUser: ConfirmUser(dispatch),
    displayAlert: args => dispatch(newNotification(args)),
    loadConfirmation: LoadConfirmation(dispatch),
    setShowLoginForm: formType => dispatch(setLoginFormVisible(formType))
  }
}

NavBar.propTypes = {
  confirmation: PropTypes.object,
  showLoginForm: PropTypes.string,
  user: PropTypes.object,

  confirmUser: PropTypes.func,
  displayAlert: PropTypes.func,
  loadConfirmation: PropTypes.func,
  setShowLoginForm: PropTypes.func,
}


export default connect(mapStateToProps, mapDispatchToProps)(NavBar)
