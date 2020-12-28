import { useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { addCount } from '../store/count/action'
import { wrapper } from '../store/store'
import { serverRenderClock, startClock } from '../store/tick/action'
import { CreateUser, SignIn } from '../behavior/coordinators/users'

const Index = () => {
  const [isNewUser, setIsNewUser] = useState(true)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

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
                onClick={() => CreateUser({
                  firstName,
                  lastName,
                  email,
                  password,
                })}
              />
            </div>
          }

        </div>
      </main>
    </div>
  )
}

export const getStaticProps = wrapper.getStaticProps(async ({ store }) => {
  store.dispatch(serverRenderClock(true))
  store.dispatch(addCount())
})

const mapDispatchToProps = (dispatch) => {
  return {
    addCount: bindActionCreators(addCount, dispatch),
    startClock: bindActionCreators(startClock, dispatch),
  }
}

export default connect(null, mapDispatchToProps)(Index)