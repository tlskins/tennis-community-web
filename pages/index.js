import React, { useState } from "react"
import { connect } from "react-redux"
import { CreateUser, SignIn } from "../behavior/coordinators/users"
import PropTypes from "prop-types"

const Index = ({ createUser, signIn }) => {
  const [isNewUser, setIsNewUser] = useState(true)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const onToggleForm = () => {
    clearForm()
    setIsNewUser(!isNewUser)
  }

  const clearForm = () => {
    setFirstName("")
    setLastName("")
    setEmail("")
    setPassword("")
  }

  const onSignIn = async () => {
    const success = await signIn({
      email,
      password,
    })
    if (success) {
      clearForm()
    }
  }

  return (
    <div className="flex flex-col h-screen min-h-screen">
      <main className="flex flex-1 overflow-y-auto">
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
                onClick={() => createUser({
                  firstName,
                  lastName,
                  email,
                  password,
                })}
              />
              <a className="text-white cursor-pointer"
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
              <a className="text-white cursor-pointer"
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

// export const getStaticProps = wrapper.getStaticProps(async ({ store }) => {
//   store.dispatch(serverRenderClock(true))
//   store.dispatch(addCount())
// })

const mapDispatchToProps = (dispatch) => {
  return {
    createUser: CreateUser(dispatch),
    signIn: SignIn(dispatch),
  }
}

Index.propTypes = {
  createUser: PropTypes.func,
  signIn: PropTypes.func,
}

export default connect(null, mapDispatchToProps)(Index)