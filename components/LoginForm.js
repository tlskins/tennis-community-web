import React, { useState, useEffect } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import { useRouter } from "next/router"

import { AcceptInvite, CreateUser, SignIn, SignOut } from "../behavior/coordinators/users"
import { newNotification } from "../state/ui/action"


import {
  SignInForm,
  SignInInputContainer,
} from "../styles/styled-components"


const LoginForm = ({
  confirmation,
  user,

  acceptInvite,
  createUser,
  displayAlert,
  signIn,
  signOut,
  showNewUser,
  showInviteForm,
}) => {
  const router = useRouter()
  const [formType, setFormType] = useState("SIGN_IN") // SIGN_IN - REGISTER - INVITE
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userName, setUserName] = useState("")

  useEffect(() => {
    if (showNewUser) {
      setFormType("REGISTER")
    }
  }, [showNewUser])

  useEffect(() => {
    if (showInviteForm) {
      setFormType("INVITE")
    }
  }, [showInviteForm])
  
  useEffect(async () => {
    if (confirmation?.email) {
      setFormType("INVITE")
      setFirstName(confirmation.firstName)
      setLastName(confirmation.lastName)
      setEmail(confirmation.email)
    }
  }, [confirmation])

  const clearForm = () => {
    setFirstName("")
    setLastName("")
    setEmail("")
    setPassword("")
    setUserName("")
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
      setFormType("SIGN_IN")
    }
  }

  const onAcceptInvite = async () => {
    const success = await acceptInvite({
      id: confirmation.id,
      firstName,
      lastName,
      password,
      userName,
    })
    if (success) {
      clearForm()
      displayAlert({ message: `New user "${userName}" successfully created!`})
      router.push(`/${confirmation.url}`)
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
      { formType === "REGISTER" &&
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
              onClick={() => setFormType("SIGN_IN")}
            >
              Sign In
            </a>
          </p>
          { confirmation &&
            <p>Complete new user
              <a
                href="#"
                className="link"
                onClick={() => setFormType("INVITE")}
              >
                Invitation
              </a>
            </p>
          }
        </SignInForm>
      }

      { formType === "SIGN_IN" &&
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
              onClick={() => setFormType("REGISTER")}
            >
              Create Account
            </a>
          </p>
          { confirmation &&
            <p>Complete new user
              <a
                href="#"
                className="link"
                onClick={() => setFormType("INVITE")}
              >
                Invitation
              </a>
            </p>
          }
        </SignInForm>
      }

      { formType === "INVITE" &&
        <SignInForm>
          <h2>
            Accept Invitation
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
              disabled={true}
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
            onClick={onAcceptInvite}
          >
            Complete Registration
          </button>
          <p>Already have an account?
            <a
              href="#"
              className="link"
              onClick={() => setFormType("SIGN_IN")}
            >
              Sign In
            </a>
          </p>
        </SignInForm>
      }
    </div>
  )
}


const mapStateToProps = (state) => {
  return {
    confirmation: state.confirmation,
    user: state.user,
    showNewUser: state.navBar.showNewUser,
    showInviteForm: state.navBar.showInviteForm,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    acceptInvite: AcceptInvite(dispatch),
    createUser: CreateUser(dispatch),
    signIn: SignIn(dispatch),
    signOut: SignOut(dispatch),
    displayAlert: args => dispatch(newNotification(args))
  }
}


LoginForm.propTypes = {
  confirmation: PropTypes.object,
  showNewUser: PropTypes.bool,
  showInviteForm: PropTypes.bool,
  user: PropTypes.object,

  acceptInvite: PropTypes.func,
  createUser: PropTypes.func,
  confirmUser: PropTypes.func,
  displayAlert: PropTypes.func,
  signIn: PropTypes.func,
  signOut: PropTypes.func,
}


export default connect(mapStateToProps, mapDispatchToProps)(LoginForm)
