import React, { useState, useEffect } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import Link from "next/link"
import { useRouter } from "next/router"

import { SignOut, LoadConfirmation } from "../behavior/coordinators/users"
import { getUserIcon } from "../behavior/users"
import LoginForm from "./LoginForm"
import Modal from "./Modal"

import {
  LinkClass,
  LinksContainer,
  NavigationBar,
} from "../styles/styled-components"


const NavBar = ({
  confirmation,
  user,
  
  loadConfirmation,
  showNewUser,
  showInviteForm,
  signOut,
}) => {
  const router = useRouter()
  const { confirmation: confirmationID } = router.query

  useEffect(() => {
    if (confirmationID) {
      loadConfirmation(confirmationID)
    }
  }, [confirmationID])

  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (showNewUser || showInviteForm) {
      setShowModal(true)
    }
  }, [showNewUser, showInviteForm])

  const onSignOut = async () => {
    await signOut()
    window.localStorage.setItem("authToken", "")
    router.push("/")
  }

  return(
    <NavigationBar>
      <Link href="/">
        <a className="logo" href="#">Hive Tennis</a>
      </Link>
      { !user || !user.id ?
        <LinksContainer>
          <div className="static">
            <a href="#" onClick={() => setShowModal(!showModal)}>{ confirmation?.email ? "Accept Invitation" : "Sign In" }</a>
            { showModal &&
              <Modal width="400" hideModal={ () => setShowModal(false)}>
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
          <LinkClass active={ router.pathname === "/friends" }>
            <Link href="/friends">Friends</Link>
          </LinkClass>
          { user.isAdmin &&
            <LinkClass active={ router.pathname === "/admin" }>
              <Link href="/admin">Admin</Link>
            </LinkClass>
          }
          <LinkClass>
            <a href="#" onClick={ onSignOut }>Sign Out</a>
          </LinkClass>
        </LinksContainer>
      }
    </NavigationBar>
  )
}

const mapStateToProps = (state) => {
  return {
    confirmation: state.confirmation,
    showNewUser: state.navBar.showNewUser,
    showInviteForm: state.navBar.showInviteForm,
    user: state.user,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    loadConfirmation: LoadConfirmation(dispatch),
    signOut: SignOut(dispatch),
  }
}

NavBar.propTypes = {
  confirmation: PropTypes.object,
  showNewUser: PropTypes.bool,
  showInviteForm: PropTypes.bool,
  user: PropTypes.object,

  loadConfirmation: PropTypes.func,
  signOut: PropTypes.func,
}


export default connect(mapStateToProps, mapDispatchToProps)(NavBar)
