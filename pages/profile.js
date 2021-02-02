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

  const [hoverUpload, setHoverUpload] = useState(false)
  const [email, setEmail] = useState(user.email)
  const [userName, setUserName] = useState(user.userName)
  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName)
  const [iconNumber, setIconNumber] = useState(user.iconNumber)

  return (
    <div className="flex flex-col h-screen min-h-screen">
      { (user && user.id) &&
        <Notifications />
      }
      <main className="flex flex-1 overflow-y-auto">

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

        <div className="p-4 flex flex-col w-4/5 bg-gray-100">

          {/* How to upload first album */}
          { albums.myAlbums.length !== 0 &&
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
            <div className="flex flex-col col-span-2 py-6 px-10 bg-white rounded shadow-lg">
              <h2 className="font-bold text-lg text-center tracking-wider mb-1 w-full">
                Profile
              </h2>
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
                  <p className="text-right align-center w-28 px-2 py-1 float-right rounded-md font-bold tracking-wide">UserName</p>
                  <p className="text-right align-center w-28 px-2 py-1 float-right rounded-md font-bold tracking-wide">First Name</p>
                  <p className="text-right align-center w-28 px-2 py-1 float-right rounded-md font-bold tracking-wide">Last Name</p>
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