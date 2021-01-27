import React, { useState } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import { useRouter } from "next/router"

import { CreateUser, SignIn, SignOut } from "../behavior/coordinators/users"
import { newNotification } from "../state/ui/action"
import bg from "../styles/images/homepage-bg.jpg"
import {
  CTAButton,
  Header,
  HeaderTitle,
  HeaderTitleContainer,
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
      <Header bg={ bg }>
        <HeaderTitleContainer>
          <HeaderTitle>Upload videos of you playing tennis from your phone & get feedback from your coach or the community!</HeaderTitle>
          <CTAButton>Get Started</CTAButton>
        </HeaderTitleContainer>
      </Header>
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
