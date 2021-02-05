import React, { useEffect, useState, createRef, Fragment } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import Moment from "moment-timezone"
import { useRouter } from "next/router"

import Notifications from "../components/Notifications"
import HowToUpload from "../components/HowToUpload"
import AlbumAndCommentsPreview from "../components/AlbumAndCommentsPreview"
import VideoResources from "../components/VideoResources"
import ProComparison from "../components/ProComparison"
import { UpdateUserProfile } from "../behavior/coordinators/users"
import { SearchFriends } from "../behavior/coordinators/friends"
import { getUserIcons, getUserIcon } from "../behavior/users"
import {
  LoadMyAlbums,
  LoadFriendsAlbums,
  LoadSharedAlbums,
  LoadPublicAlbums,
} from "../behavior/coordinators/albums"
import { newNotification } from "../state/ui/action"
import uploadYellow from "../public/upload-yellow.svg"
import uploadBlue from "../public/upload-blue.svg"

const SWING_FRAMES = 60
const albumsPerColumn = 3

const Profile = ({
  myAlbums,
  friendsAlbums,
  sharedAlbums,
  publicAlbums,
  user,
  usersCache,
  
  loadMyAlbums,
  newFlashMessage,
  searchFriends,
  updateUserProfile,
}) => {
  const router = useRouter()

  const [showHowTo, setShowHowTo] = useState(false)
  const [hoverUploadButton, setHoverUploadButton] = useState(false)
  const [pressingSave, setPressingSave] = useState(false)

  const [email,] = useState(user?.email)
  const [userName, setUserName] = useState(user?.userName)
  const [firstName, setFirstName] = useState(user?.firstName)
  const [lastName, setLastName] = useState(user?.lastName)
  const [iconNumber, setIconNumber] = useState(user?.iconNumber)
  const [isPublic, setIsPublic] = useState(user?.isPublic)
  const [birthYear, setBirthYear] = useState(user?.birthYear)
  const [gender, setGender] = useState(user?.gender)
  const [ustaLevel, setUstaLevel] = useState(user?.ustaLevel)

  const [playerRefs, setPlayerRefs] = useState([])
  const [playerFrames, setPlayerFrames] = useState({})
  const [playings, setPlayings] = useState([])
  const [pips, setPips] = useState([])
  const [currentSwings, setCurrentSwings] = useState([])
  const [currentComments, setCurrentComments] = useState([])

  const [myAlbumsPage, setMyAlbumsPage] = useState(0)
  const [albumType, setAlbumType] = useState("owner")

  let sourceAlbums
  switch(albumType) {
  case "owner": sourceAlbums = myAlbums
    break
  case "friends": sourceAlbums = friendsAlbums
    break
  case "shared": sourceAlbums = sharedAlbums
    break
  case "public": sourceAlbums = publicAlbums
    break
  default: sourceAlbums = myAlbums
  }
  const activeAlbums = sourceAlbums.slice(myAlbumsPage * albumsPerColumn, (myAlbumsPage+1) * albumsPerColumn).filter( a => !!a ) || []
  const saveButtonStyle = pressingSave ? "bg-yellow-300 text-black" : "bg-black text-yellow-300"

  useEffect(() => {
    if (!user || !user?.id) {
      router.push("/")
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadMyAlbums()
    }
  }, [user])

  useEffect(() => {
    setShowHowTo(myAlbums.length === 0)
  }, [myAlbums])

  useEffect(() => {
    setPlayerRefs(ref => activeAlbums.map((_, i) => ref[i] || createRef()))
    setPlayings(activeAlbums.map(() => false))
    setPips(activeAlbums.map(() => false))
    setCurrentSwings(activeAlbums.map(() => 0))
    setCurrentComments(activeAlbums.map(album => {
      let comments = [...(album.comments || []), ...(album.swingVideos.map(swing => (swing.comments || [])).flat())]
      comments = comments.filter( comment => comment.userId !== user?.id )
      comments = comments.sort( (a,b) => Moment(a.createdAt).isAfter(Moment(b.createdAt)) ? -1 : 1)
      return comments.slice(0,3).filter( c => !!c )
    }))
  }, [myAlbums, myAlbumsPage, user])

  useEffect(() => {
    if (currentComments.length > 0) {
      const commentersSet = new Set([])
      currentComments.forEach( comments => {
        comments.forEach( comment => {
          if (!usersCache[comment.userId]) commentersSet.add(comment.userId)
        })
      })
      const ids = Array.from(commentersSet)
      if (ids.length > 0) searchFriends({ ids })
    }
  }, [currentComments, usersCache])

  const onHandleSeekChange = (playerRef, i) => e => {
    const frame = parseFloat(e.target.value)
    if (frame != null) {
      const seekTo = frame === SWING_FRAMES ? 0.9999 : parseFloat((frame/SWING_FRAMES).toFixed(4))
      playerRef.current.seekTo(seekTo)
      setPlayerFrames({
        ...playerFrames,
        [i]: frame,
      })
    }
  }

  const onSetCurrentSwings = i => swingIdx => () => {
    setCurrentSwings([
      ...currentSwings.slice(0, i),
      swingIdx,
      ...currentSwings.slice(i+1, currentSwings.length),
    ])
  }

  const onTogglePlay = i => isPlaying => () => {
    const newPlayings = playings.map((p,j) => j === i ? isPlaying : p)
    setPlayings(newPlayings)
  }

  const onTogglePip = i => isPip => () => {
    const newPips = pips.map((p,j) => j === i ? isPip : p)
    setPips(newPips)
  }

  const onPlayerProgress = i => played => {
    const frame = Math.round(played*SWING_FRAMES)
    setPlayerFrames({
      ...playerFrames,
      [i]: frame,
    })
  }

  const onUpdateUserProfile = async () => {
    const success = updateUserProfile({
      userName,
      firstName,
      lastName,
      iconNumber,
      isPublic,
      birthYear,
      gender,
      ustaLevel,
    })
    if (success) {
      newFlashMessage({ message: "Profile successfully updated"})
    }
  }

  if (!user) {
    return(<Fragment/>)
  }

  return (
    <div className="flex flex-col h-screen min-h-screen">
      { (user && user.id) &&
        <Notifications />
      }
      <main className="flex flex-1 overflow-y-auto bg-gray-100">

        {/* Begin Main */}

        <div className="p-4 flex flex-col w-full">

          {/* How to upload first album */}
          { showHowTo &&
            <HowToUpload isFirst={myAlbums.length > 0} />
          }

          <div className="grid grid-cols-3 gap-6">
                
            {/* Main */}
            <div className="flex flex-col col-span-2">
              {/* Profile */}
              <div className="pt-6 pb-20 px-10 bg-white rounded shadow-lg static mb-6">
                <div className="w-full">
                  <h2 className="font-bold text-lg text-center tracking-wider mb-1">
                  Profile
                  </h2>
                  <p className="text-center text-xs tracking-widest underline">Member since { Moment(user?.createdAt).format("LLL") }</p>
                  <img src={hoverUploadButton ? uploadBlue : uploadYellow}
                    className="w-10 h-8 relative -top-8 cursor-pointer"
                    onMouseEnter={() => setHoverUploadButton(true)}
                    onMouseLeave={() => setHoverUploadButton(false)}
                    onClick={() => setShowHowTo(!showHowTo)}
                  />
                </div>

                <div className="flex flex-col content-center justify-center items-center my-5">
                  <div className="rounded-xl py-4 px-6 bg-gray-100 border border-gray-200 shadow">
                    <img src={getUserIcon({ ...user, iconNumber })} className="w-20 h-20"/>
                  </div>
                  <div className="flex flex-row mt-4 mb-1">
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
                  <p className="text-xs tracking-wider text-gray-700">Choose your avatar icon</p>
                </div>

                {/* Standard Profile */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="flex flex-col content-center justify-center items-end">
                    <p className="text-right align-center w-28 px-2 py-1 float-right rounded-md font-bold tracking-wide">Email</p>
                    <p className="text-right align-center w-28 px-2 py-1 float-right rounded-md font-bold tracking-wide">User Name</p>
                    <p className="text-right align-center w-28 px-2 py-1 float-right rounded-md font-bold tracking-wide">First Name</p>
                    <p className="text-right align-center w-28 px-2 py-1 float-right rounded-md font-bold tracking-wide mb-4">Last Name</p>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex flex-row rounded-md px-2 py-1 w-40">
                      <input type="text"
                        className="w-40 px-1 rounded-md"
                        value={email}
                        disabled={true}
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

                {/* Expanded Profile */}
                <p className="align-center px-2 py-1 rounded-md tracking-wide text-sm text-gray-700 text-center">
                  This profile data helps us connect you with other tennis players and relevant topics
                </p>
                <div className="grid grid-cols-2 gap-4 rounded-lg shadow-md border border-gray-400 py-4">
                  <div className="flex flex-col content-center justify-center items-end">
                    <p className="text-right align-center w-28 px-2 py-1 float-right rounded-md font-bold tracking-wide">Public?</p>
                    <p className="text-right align-center w-28 px-2 py-1 float-right rounded-md font-bold tracking-wide">Birth Year</p>
                    <p className="text-right align-center w-28 px-2 py-1 float-right rounded-md font-bold tracking-wide">Gender</p>
                    <p className="text-right align-center w-28 px-2 py-1 float-right rounded-md font-bold tracking-wide">USTA Level</p>
                  </div>

                  <div className="flex flex-col">
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
                      <select onChange={e => setGender(e.target.value)}
                        value={gender}
                        className="w-44 px-1 rounded-md bg-gray-200 border border-gray-400 shadow-md"
                      >
                        <option value={undefined}>-</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div className="flex flex-row rounded-md px-2 py-1 w-44">
                      <select onChange={e => setUstaLevel(parseFloat(e.target.value))}
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
            
                <div className="flex flex-col w-full content-center justify-center items-center mt-12 mb-4">
                  <input type="button"
                    onMouseDown={() => setPressingSave(true)}
                    onMouseUp={() => setPressingSave(false)}
                    className={`w-22 px-2 py-3 rounded-lg ${saveButtonStyle} border border-gray-400 shadow-md tracking-widest font-semibold cursor-pointer`}
                    value="SAVE PROFILE"
                    onClick={onUpdateUserProfile}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-8 bg-white rounded shadow-lg p-4">
                {/* Video Resources */}
                <div className="p-4 content-center justify-center items-center bg-gray-100 border-2 border-gray-200 rounded-lg shadow-md">
                  <h2 className="font-bold text-lg text-center tracking-wider w-full">
                    Pro Swings
                  </h2>
                  <ProComparison />
                </div>
                <div className="flex flex-col col-span-2 content-center justify-center items-center bg-gray-100 border-2 border-gray-200 rounded-lg shadow-md">
                  <h2 className="font-bold text-lg text-center tracking-wider w-full">
                    Tutorials
                  </h2>
                  <VideoResources
                    defaultVideoGroup="Forehands"
                    defaultVideo="Forehand Form Basics"
                  />
                </div>
              </div>
            </div>

            {/* Recent Albums */}
            <div className="flex flex-col pt-6 pb-20 px-4 h-full bg-white rounded shadow-lg">
              <h2 className="font-bold text-lg text-center tracking-wider mb-1 w-full">
                Recent Albums
              </h2>

              <div className="flex flex-row content-center justify-center items-center mb-3">
                <div className={`m-1 py-0.5 px-1 rounded-lg ${albumType === "owner" && "bg-gray-300 shadow-md"}`}>
                  <input type="button"
                    value="owner"
                    onClick={() => setAlbumType("owner")}
                    className="px-2 m-1 rounded-lg bg-yellow-300 border border-gray-400 shadow-md font-semibold text-xs tracking-wide cursor-pointer"
                  />
                </div>

                <div className={`m-1 py-0.5 px-1 rounded-lg ${albumType === "shared" && "bg-gray-300 shadow-md"}`}>
                  <input type="button"
                    value="shared"
                    onClick={() => setAlbumType("shared")}
                    className="px-2 m-1 rounded-lg bg-red-300 border border-gray-400 shadow-md font-semibold text-xs tracking-wide cursor-pointer"
                  />
                </div>

                <div className={`m-1 py-0.5 px-1 rounded-lg ${albumType === "friends" && "bg-gray-300 shadow-md"}`}>
                  <input type="button"
                    value="friends"
                    onClick={() => setAlbumType("friends")}
                    className="px-2 m-1 rounded-lg bg-green-300 border border-gray-400 shadow-md font-semibold text-xs tracking-wide cursor-pointer"
                  />
                </div>

                <div className={`m-1 py-0.5 px-1 rounded-lg ${albumType === "public" && "bg-gray-300 shadow-md"}`}>
                  <input type="button"
                    value="public"
                    onClick={() => setAlbumType("public")}
                    className="px-2 m-1 rounded-lg bg-blue-300 border border-gray-400 shadow-md font-semibold text-xs tracking-wide cursor-pointer"
                  />
                </div>
              </div>

              { activeAlbums.length === 0 &&
                <div className="px-20 mt-4">
                  <p className="text-center bg-gray-100 text-gray-700 tracking-wide rounded-lg w-full px-20">no albums</p>
                </div>
              }

              { activeAlbums.map((album, i) => 
                <AlbumAndCommentsPreview
                  key={i}
                  album={album}
                  comments={currentComments[i] || []}
                  duration={playerFrames[i]}
                  pip={pips[i]}
                  playing={playings[i]}
                  playerRef={playerRefs[i]}
                  swingIdx={currentSwings[i]}
                  swingFrames={SWING_FRAMES}
                  user={user}

                  onSetSwingIndex={onSetCurrentSwings(i)}
                  onHandleSeekChange={onHandleSeekChange(playerRefs[i], i)}
                  onTogglePlay={onTogglePlay(i)}
                  onTogglePip={onTogglePip(i)}
                  onPlayerProgress={onPlayerProgress(i)}
                />
              )}

              { myAlbumsPage > 0 &&
                <div className="w-full content-center justify-center items-center mb-1">
                  <input type="button"
                    className="rounded border-2 border-gray-400 w-full text-sm tracking-wider font-bold bg-yellow-300 shadow-md cursor-pointer"
                    value={`Previous Page (${myAlbumsPage})`}
                    onClick={() => setMyAlbumsPage(myAlbumsPage-1)}
                  />
                </div>
              }

              { activeAlbums.length === albumsPerColumn &&
                <div className="w-full content-center justify-center items-center">
                  <input type="button"
                    className="rounded border-2 border-gray-400 w-full text-sm tracking-wider font-bold bg-yellow-300 shadow-md cursor-pointer"
                    value={`Next Page (${myAlbumsPage+2})`}
                    onClick={() => setMyAlbumsPage(myAlbumsPage+1)}
                  />
                </div>
              }
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
    myAlbums: state.albums.myAlbums,
    friendsAlbums: state.albums.friendsAlbums,
    sharedAlbums: state.albums.sharedAlbums,
    publicAlbums: state.albums.publicAlbums,
    user: state.user,
    usersCache: state.usersCache,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    loadMyAlbums: LoadMyAlbums(dispatch),
    loadFriendsAlbums: LoadFriendsAlbums(dispatch),
    loadSharedAlbums: LoadSharedAlbums(dispatch),
    loadPublicAlbums: LoadPublicAlbums(dispatch),
    newFlashMessage: args => dispatch(newNotification(args)),
    searchFriends: SearchFriends(dispatch),
    updateUserProfile: UpdateUserProfile(dispatch),
  }
}
  
Profile.propTypes = {
  myAlbums: PropTypes.arrayOf(PropTypes.object),
  friendsAlbums: PropTypes.arrayOf(PropTypes.object),
  sharedAlbums: PropTypes.arrayOf(PropTypes.object),
  publicAlbums: PropTypes.arrayOf(PropTypes.object),
  user: PropTypes.object,
  usersCache: PropTypes.object,

  loadMyAlbums: PropTypes.func,
  loadFriendsAlbums: PropTypes.func,
  loadSharedAlbums: PropTypes.func,
  loadPublicAlbums: PropTypes.func,
  newFlashMessage: PropTypes.func,
  searchFriends: PropTypes.func,
  updateUserProfile: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile)