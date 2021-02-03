import React, { useState, useEffect } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import { useRouter } from "next/router"

import { CreateUser, SignIn, SignOut } from "../behavior/coordinators/users"
import { newNotification } from "../state/ui/action"


import {
  SignInForm,
  SignInInputContainer,
} from "../styles/styled-components"


const LoginForm = ({
  createUser,
  displayAlert,
  signIn,
  signOut,

  showNewUser,
  user,
}) => {
  const router = useRouter()
  const [isNewUser, setIsNewUser] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userName, setUserName] = useState("")

  useEffect(() => {
    if (showNewUser) {
      setIsNewUser(true)
    }
  }, [showNewUser])

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
      displayAlert({ message: `Confirmation email sent to ${email}`})
      setIsNewUser(false)
    }
  }

  const onSignIn = async () => {
    const success = await signIn({ email, password })
    if (success) {
      clearForm()
      router.push("/profile")
    }
  }

  return (
    <div>
      { user &&
        <div className="p-8">
          <button onClick={signOut}>
            Sign Out
          </button>
        </div>
      }
      { isNewUser &&
        <SignInForm>
          <h2>
            Sign Up
          </h2>
          <SignInInputContainer>
            <label htmlFor="username">User Name</label>
            <input type="text"
              id="username"
              value={userName}
              onChange={e => setUserName(e.target.value)}
            />
          </SignInInputContainer>
          <SignInInputContainer>
            <label htmlFor="email">Email</label>
            <input type="text"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </SignInInputContainer>
          <SignInInputContainer>
            <label htmlFor="firstname">First Name</label>
            <input type="text"
              id="firstname"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
            />
          </SignInInputContainer>
          <SignInInputContainer>
            <label htmlFor="lastname">Last Name</label>
            <input type="text"
              id="lastname"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
            />
          </SignInInputContainer>
          <SignInInputContainer>
            <label htmlFor="password">Password</label>
            <input type="text"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </SignInInputContainer>
          <button
            onClick={onCreateUser}
          >
            Sign Up
          </button>
          <p>Already have an account?
            <a
              href="#"
              className="link"
              onClick={onToggleForm}
            >
              Sign In
            </a>
          </p>
        </SignInForm>
      }

      { !isNewUser &&
        <SignInForm>
          <h2>
            Sign In
          </h2>
          <SignInInputContainer>
            <label htmlFor="email">Email</label>
            <input type="text"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </SignInInputContainer>
          <SignInInputContainer>
            <label htmlFor="password">Password</label>
            <input type="text"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </SignInInputContainer>
          <button
            onClick={onSignIn}
          >
            Sign In
          </button>
          <p>Don't have an account?
            <a
              href="#"
              className="link"
              onClick={onToggleForm}
            >
              Create Account
            </a>
          </p>
        </SignInForm>
      }
    </div>
  )
}


const mapStateToProps = (state) => {
  return {
    user: state.user,
    showNewUser: state.navBar.showNewUser,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    createUser: CreateUser(dispatch),
    signIn: SignIn(dispatch),
    signOut: SignOut(dispatch),
    displayAlert: args => dispatch(newNotification(args))
  }
}


LoginForm.propTypes = {
  showNewUser: PropTypes.bool,
  user: PropTypes.object,

  createUser: PropTypes.func,
  displayAlert: PropTypes.func,
  signIn: PropTypes.func,
  signOut: PropTypes.func,
}


export default connect(mapStateToProps, mapDispatchToProps)(LoginForm)
