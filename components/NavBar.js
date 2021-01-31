import React, { useState } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import Link from "next/link"
import { useRouter } from "next/router"

import { SignOut } from "../behavior/coordinators/users"
import LoginForm from "./LoginForm"

import {
  DropdownLink,
  LinksContainer,
  NavigationBar,
} from "../styles/styled-components"


const NavBar = ({ user, signOut }) => {
  const router = useRouter()

  const [showLogin, setShowLogin] = useState(false)

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
            <a href="#" onClick={() => setShowLogin(!showLogin)}>Sign In</a>
            { showLogin &&
            <div className="absolute z-10 float-left mt-7 -mx-36">
              <LoginForm />
            </div>
            }
          </div>
        </LinksContainer>
        :
        <LinksContainer>
          <DropdownLink>
            <a href="#">Albums</a>
            <div className="dropdown-container">
              <Link href="/albums/new">Create New</Link>
              <Link href="/albums">View</Link>
            </div>
          </DropdownLink>
          <Link href="/friends">Friends</Link>
          { user.isAdmin &&
            <Link href="/admin">Admin</Link>
          }
          <a href="#" onClick={ onSignOut }>Sign Out</a>
        </LinksContainer>
      }
    </NavigationBar>
  )
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    signOut: SignOut(dispatch),
  }
}

NavBar.propTypes = {
  user: PropTypes.object,

  signOut: PropTypes.func,
}


export default connect(mapStateToProps, mapDispatchToProps)(NavBar)
