import React, { useState } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import Moment from "moment"
import { useRouter } from "next/router"

import { UpdateUserProfile, SignOut } from "../behavior/coordinators/users"
import { newNotification } from "../state/ui/action"
import { getUserIcons } from "../behavior/users"


import {
  SignInForm,
} from "../styles/styled-components"


const ProfileForm = ({
  user,

  newFlashMessage,
  signOut,
  updateUserProfile,
}) => {
  const router = useRouter()

  const [email,] = useState(user?.email)
  const [userName, setUserName] = useState(user?.userName)
  const [firstName, setFirstName] = useState(user?.firstName)
  const [lastName, setLastName] = useState(user?.lastName)
  const [iconNumber, setIconNumber] = useState(user?.iconNumber)

  const onSignOut = async () => {
    await signOut()
    window.localStorage.setItem("authToken", "")
    router.push("/")
  }

  const onUpdateUserProfile = async () => {
    const success = updateUserProfile({
      userName,
      firstName,
      lastName,
      iconNumber,
    })
    if (success) {
      newFlashMessage({ message: "Profile successfully updated"})
    }
  }

  return (
    <div>
      <SignInForm>
        { user &&
        <div className="p-8">
          <button onClick={onSignOut}>
            Sign Out
          </button>
        </div>
        }
        <h2>
          Profile
        </h2>
        <p className="text-center text-xs underline">Member since { Moment(user?.createdAt).format("LLL") }</p>
        <div>
          <div className="flex flex-col content-center justify-center items-center my-5">
            {/* <div className="rounded-xl py-4 px-6 bg-gray-100 border border-gray-200 shadow">
                    <img src={getUserIcon({ ...user, iconNumber })} className="w-20 h-20"/>
                  </div> */}
            <div className="flex flex-row mt-4 mb-2">
              { getUserIcons(user).map((icon, i) => {
                return(
                  <div key={i}
                    className={`hover:bg-blue-200 rounded-xl p-3 mx-2 cursor-pointer ${icon.number === (iconNumber || 1) && "border border-gray-400"}`}
                  >
                    <img src={icon.image}
                      className="w-8 h-8"
                      onClick={() => setIconNumber(icon.number)}
                    />
                  </div>
                )
              })}
            </div>
            <p className="text-xs tracking-wider text-gray-700">Choose your avatar icon</p>
          </div>

          {/* Standard Profile */}
          <div className="flex flex-row content-center justify-center items-center mb-10">
            <div className="flex flex-col content-center justify-center items-end">

              <div className="flex flex-row content-center justify-center items-center">
                <p className="text-right text-sm align-center w-28 px-2 text-gray-600 uppercase whitespace-no-wrap font-semibold">
                        Email
                </p>
                <div className="rounded-md px-2 py-1 w-40">
                  <input type="text"
                    className="w-40 px-1 rounded-md whitespace-no-wrap bg-transparent"
                    value={email}
                    disabled={true}
                  />
                </div>
              </div>

              <div className="flex flex-row content-center justify-center items-center">
                <p className="text-right text-sm align-center w-28 px-2 text-gray-600 uppercase whitespace-no-wrap font-semibold">
                        User Name
                </p>
                <div className="flex flex-row rounded-md px-2 py-1 w-40">
                  <p className="mr-0.5">@</p>
                  <input type="text"
                    className="w-36 px-1 rounded-md bg-gray-200 border border-gray-400 shadow-md"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-row content-center justify-center items-center">
                <p className="text-right text-sm align-center w-28 px-2 text-gray-600 uppercase whitespace-no-wrap font-semibold">
                        First Name
                </p>
                <div className="flex flex-row rounded-md px-2 py-1 w-40">
                  <input type="text"
                    className="w-40 px-1 rounded-md bg-gray-200 border border-gray-400 shadow-md"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-row content-center justify-center items-center">
                <p className="text-right text-sm align-center w-28 px-2 text-gray-600 uppercase whitespace-no-wrap font-semibold">
                  Last Name
                </p>
                <div className="flex flex-row rounded-md px-2 py-1 w-40">
                  <input type="text"
                    className="w-40 px-1 rounded-md bg-gray-200 border border-gray-400 shadow-md"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                  />
                </div>

              </div>
            </div>
          </div>
        </div>

        <button onClick={onUpdateUserProfile}>
          Save Profile
        </button>
          
      </SignInForm>
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
    signOut: SignOut(dispatch),
    newFlashMessage: args => dispatch(newNotification(args)),
    updateUserProfile: UpdateUserProfile(dispatch),
  }
}


ProfileForm.propTypes = {
  user: PropTypes.object,

  signOut: PropTypes.func,
  newFlashMessage: PropTypes.func,
  updateUserProfile: PropTypes.func,
}


export default connect(mapStateToProps, mapDispatchToProps)(ProfileForm)
