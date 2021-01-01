import React, { useState } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import Link from "next/link"
import { useRouter } from "next/router"

import { CreateUser, SignIn, SignOut } from "../behavior/coordinators/users"


const Index = ({ createUser, signIn, signOut, user }) => {
  const router = useRouter()
  const [isNewUser, setIsNewUser] = useState(true)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const clearForm = () => {
    setFirstName("")
    setLastName("")
    setEmail("")
    setPassword("")
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
    })
    if (success) {
      clearForm()
    }
  }

  const onSignIn = async () => {
    const success = await signIn({
      email,
      password,
    })
    if (success) {
      clearForm()
      router.push("/albums")
    }
  }

  return (
    <div className="flex flex-col h-screen min-h-screen">
      <main className="flex flex-1 overflow-y-auto">
        { user &&
          <div className="p-8">
            <Link href="/upload">
              <a>Upload</a>
            </Link>
          </div>
        }

        { user &&
          <div className="p-8">
            <button onClick={signOut}>
              Sign Out
            </button>
          </div>
        }
        
        <div className="p-8">
          { isNewUser &&
            <div className="flex flex-col">
              <h2 className="my-2 font-bold">
                New User
              </h2>
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
              <a className="cursor-pointer"
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
              <a className="cursor-pointer"
                onClick={onToggleForm}
              >
                New User
              </a>
            </div>
          }

        </div>
      </main>
    </div>
  )
}

const mapStateToProps = (state) => {
  console.log("mapstate", state)
  return {
    user: state.user,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    createUser: CreateUser(dispatch),
    signIn: SignIn(dispatch),
    signOut: SignOut(dispatch),
  }
}

Index.propTypes = {
  user: PropTypes.object,

  createUser: PropTypes.func,
  signIn: PropTypes.func,
  signOut: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(Index)