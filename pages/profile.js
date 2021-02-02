import React, { useEffect, useState, Fragment } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import Moment from "moment-timezone"
import { useRouter } from "next/router"

import Notifications from "../components/Notifications"
import SwingUploader from "../components/SwingUploader"
import { UpdateUserProfile } from "../behavior/coordinators/users"
import { getUserIcons, getUserIcon } from "../behavior/users"
import { LoadAlbums, DeleteAlbum } from "../behavior/coordinators/albums"
import uploadYellow from "../public/upload-yellow.svg"
import uploadBlue from "../public/upload-blue.svg"

const Profile = ({
  albums,
  user,
  
  loadAlbums,
  updateUserProfile,
}) => {
  const router = useRouter()

  useEffect(() => {
    if (!user || !user.id) {
      router.push("/")
    }
  }, [user])

  if (!user) {
    return(<Fragment/>)
  }

  useEffect(() => {
    loadAlbums()
  }, [])

  const [showHowTo, setShowHowTo] = useState(albums?.myAlbums?.length === 0)
  const [hoverUpload, setHoverUpload] = useState(false)
  const [hoverUploadButton, setHoverUploadButton] = useState(false)
  const [email, setEmail] = useState(user.email)
  const [userName, setUserName] = useState(user.userName)
  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName)
  const [iconNumber, setIconNumber] = useState(user.iconNumber)
  const [isPublic, setIsPublic] = useState(user.isPublic)
  const [birthYear, setBirthYear] = useState(user.birthYear)
  const [gender, setGender] = useState(user.gender)
  const [ustaLevel, setUstaLevel] = useState(user.ustaLevel)

  useEffect(() => {
    if (albums?.myAlbums?.length === 0) {
      setShowHowTo(true)
    }
  }, [albums?.myAlbums])

  return (
    <div className="flex flex-col h-screen min-h-screen">
      { (user && user.id) &&
        <Notifications />
      }
      <main className="flex flex-1 overflow-y-auto bg-gray-100">

        {/* Begin Sidebar */}

        <div className="h-screen top-0 sticky p-4 bg-white w-1/5 overflow-y-scroll border-r border-gray-400">
          <div className="flex flex-col content-center justify-center items-center text-sm">

            {/* Search Users Sidebar */}
            <Fragment>
              <h2 className="text-blue-400 underline mb-2">
                Sidebar
              </h2>
              <div className="mb-2 flex flex-col">
              </div>
            </Fragment>
          </div>
        </div>

        {/* End Sidebar */}

        {/* Begin Main */}

        <div className="p-4 flex flex-col w-4/5">

          {/* How to upload first album */}
          { showHowTo &&
            <div className="p-4 flex flex-row bg-yellow-300 rounded shadow-md mb-3">
              <div className="flex flex-col">
                <h2 className="font-bold text-lg text-center tracking-wider mb-6 w-full">
                    Upload your first album!
                </h2>

                <div className="flex flex-row">
                  <img src={hoverUpload ? uploadBlue : uploadYellow}
                    className="w-80 h-72 mr-10"
                    onMouseEnter={() => setHoverUpload(true)}
                    onMouseLeave={() => setHoverUpload(false)}
                  />
                  <div className="flex-flex-row w-full content-center justify-center items-center">
                    <ol className="list-decimal">
                      <li className="mb-5">
                        <span className="font-semibold">Record yourself playing tennis</span>
                        <div className="pl-6">
                          <ul className="list-disc">
                            <li>Using a mobile phone, or camera, record yourself playing a match, rallying, or hitting against the wall.</li>
                            <li>Aim your phone so that you get a good profile view of yourself. This gives you a better angle of your body for swing analysis.</li>
                            <li>Prop your phone up to get a good angle.</li>
                          </ul>
                        </div>
                      </li>

                      <li className="mb-5">
                        <span className="font-semibold">Upload your video</span>
                        <div className="pl-6">
                          <ul className="list-disc">
                            <li>The upload will take about 10 minutes for the AI to export all the swings into an Album.</li>
                          </ul>
                          <div className="w-96 mt-2">
                            <SwingUploader />
                          </div>
                        </div>
                      </li>

                      <li className="mb-5">
                        <span className="font-semibold">Analyze & comment on your albums</span>
                        <div className="pl-6">
                          <ul className="list-disc">
                            <li>
                            After the upload has finished processing, find your newly created Album here, or on the
                              <a href="/albums" className="text-blue-700 underline ml-1">albums</a> page
                            </li>
                          </ul>
                        </div>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          }

          <div className="grid grid-cols-3 gap-6 content-center justify-center items-center">
                
            {/* Profile */}
            <div className="flex flex-col col-span-2 pt-6 pb-20 px-10 bg-white rounded shadow-lg static">
              <h2 className="font-bold text-lg text-center tracking-wider mb-1 w-full">
                Profile
              </h2>
              <img src={hoverUploadButton ? uploadBlue : uploadYellow}
                className="w-10 h-8 absolute cursor-pointer"
                onMouseEnter={() => {
                  setHoverUpload(true)
                  setHoverUploadButton(true)
                }}
                onMouseLeave={() => {
                  setHoverUpload(false)
                  setHoverUploadButton(false)
                }}
                onClick={() => setShowHowTo(!showHowTo)}
              />
              <p className="text-center text-xs tracking-widest underline">Member since { Moment(user.createdAt).format("LLL") }</p>

              <div className="flex flex-col content-center justify-center items-center my-5">
                <img src={getUserIcon({ ...user, iconNumber })} className="w-20 h-20"/>
                <div className="flex flex-row mt-4">
                  { getUserIcons(user).map((icon, i) => {
                    return(
                      <div key={i}
                        className="hover:bg-blue-200 rounded-xl p-3 mx-2 cursor-pointer"
                      >
                        <img src={icon.image}
                          className="w-8 h-8"
                          onClick={() => setIconNumber(icon.number)}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col content-center justify-center items-end">
                  <p className="text-right align-center w-28 px-2 py-1 float-right rounded-md font-bold tracking-wide">Email</p>
                  <p className="text-right align-center w-28 px-2 py-1 float-right rounded-md font-bold tracking-wide">User Name</p>
                  <p className="text-right align-center w-28 px-2 py-1 float-right rounded-md font-bold tracking-wide">First Name</p>
                  <p className="text-right align-center w-28 px-2 py-1 float-right rounded-md font-bold tracking-wide mb-4">Last Name</p>

                  <p className="text-right align-center w-28 px-2 py-1 float-right rounded-md font-bold tracking-wide">Public?</p>
                  <p className="text-right align-center w-28 px-2 py-1 float-right rounded-md font-bold tracking-wide">Birth Year</p>
                  <p className="text-right align-center w-28 px-2 py-1 float-right rounded-md font-bold tracking-wide">Gender</p>
                  <p className="text-right align-center w-28 px-2 py-1 float-right rounded-md font-bold tracking-wide">USTA Level</p>
                </div>

                <div className="flex flex-col">
                  <div className="flex flex-row rounded-md px-2 py-1 w-40">
                    <input type="text"
                      className="w-40 px-1 rounded-md bg-gray-200 border border-gray-400 shadow-md"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-row rounded-md px-2 py-1 w-40">
                    <p className="mr-0.5">@</p>
                    <input type="text"
                      className="w-36 px-1 rounded-md bg-gray-200 border border-gray-400 shadow-md"
                      value={userName}
                      onChange={e => setUserName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-row rounded-md px-2 py-1 w-40">
                    <input type="text"
                      className="w-40 px-1 rounded-md bg-gray-200 border border-gray-400 shadow-md"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-row rounded-md px-2 py-1 w-40">
                    <input type="text"
                      className="w-40 px-1 rounded-md bg-gray-200 border border-gray-400 shadow-md"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                    />
                  </div>
                
                  <div className="flex flex-row px-2 py-3 w-10 h-10 content-center justify-center">
                    <input type="checkbox"
                      className="shadow-md"
                      checked={isPublic}
                      onChange={() => setIsPublic(!isPublic)}
                    />
                  </div>
                  <div className="flex flex-row rounded-md px-2 py-1 w-40">
                    <input type="text"
                      className="w-40 px-1 rounded-md bg-gray-200 border border-gray-400 shadow-md"
                      value={birthYear || ""}
                      onChange={e => {
                        let val = parseInt(e.target.value)
                        if (!val) val = undefined
                        setBirthYear(val)
                      }}
                    />
                    { birthYear &&
                      <input type="button"
                        className="w-6 h-6 px-1.5 ml-1 shadow-md rounded-xl bg-black text-yellow-300 text-xs font-bold cursor-pointer"
                        value="X"
                        min="1900"
                        maxLength="4"
                        onClick={() => setBirthYear(null)}
                      />
                    }
                  </div>
                  <div className="flex flex-row rounded-md px-2 py-1 w-44">
                    <select onSelect={e => setGender(e.target.value)}
                      value={gender}
                      className="w-44 px-1 rounded-md bg-gray-200 border border-gray-400 shadow-md"
                    >
                      <option value={undefined}>-</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="flex flex-row rounded-md px-2 py-1 w-44">
                    <select onSelect={e => setUstaLevel(e.target.value)}
                      value={ustaLevel}
                      className="w-44 px-1 rounded-md bg-gray-200 border border-gray-400 shadow-md"
                    >
                      <option value={undefined}>-</option>
                      <option value={2.5}>2.5</option>
                      <option value={3.0}>3.0</option>
                      <option value={3.5}>3.5</option>
                      <option value={4.0}>4.0</option>
                      <option value={4.5}>4.5</option>
                      <option value={5.0}>5.0</option>
                      <option value={5.5}>5.5</option>
                      <option value={6.0}>6.0</option>
                      <option value={6.5}>6.5</option>
                      <option value={7.0}>7.0</option>
                    </select>
                  </div>
                
                </div>
              </div>
            </div>

            {/* Recent Albums */}
            <div className="flex flex-col">

            </div>
          </div>
        </div>
        {/* End Main */}
      </main>
    </div>
  )
}

const mapStateToProps = (state) => {
  console.log("mapStateToProps", state)
  return {
    albums: state.albums,
    user: state.user,
    usersCache: state.usersCache,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    loadAlbums: LoadAlbums(dispatch),
    updateUserProfile: UpdateUserProfile(dispatch),
  }
}
  
Profile.propTypes = {
  albums: PropTypes.object,
  user: PropTypes.object,
  usersCache: PropTypes.object,

  loadAlbums: PropTypes.func,
  updateUserProfile: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile)