import React, { useEffect, useState, createRef, Fragment } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import Moment from "moment-timezone"
import { useRouter } from "next/router"
import { GrSearch } from "react-icons/gr"

import Notifications from "../components/Notifications"
import HowToUpload from "../components/HowToUpload"
import AlbumAndCommentsPreview from "../components/AlbumAndCommentsPreview"
import VideoResources from "../components/VideoResources"
import ProComparison from "../components/ProComparison"
import { LoadUser, UpdateUserProfile } from "../behavior/coordinators/users"
import { 
  SearchFriends,
  SendFriendRequest,
  AcceptFriendRequest,
  Unfriend,
} from "../behavior/coordinators/friends"
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
import {
  SearchBox,
  SearchBoxContainer,
  UserResultBox,
} from "../styles/styled-components"

const SWING_FRAMES = 60
const albumsPerColumn = 3
let timer

const Profile = ({
  myAlbums,
  friendsAlbums,
  sharedAlbums,
  publicAlbums,
  user,
  usersCache,
  
  acceptFriendRequest,
  loadMyAlbums,
  loadFriendsAlbums,
  loadPublicAlbums,
  loadSharedAlbums,
  loadUser,
  newFlashMessage,
  searchFriends,
  sendFriendRequest,
  unfriend,
  updateUserProfile,
}) => {
  const router = useRouter()

  const [showHowTo, setShowHowTo] = useState(false)
  const [hoverUploadButton, setHoverUploadButton] = useState(false)
  const [pressingSave, setPressingSave] = useState(false)
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false)
  const [isMyAlbumsLoaded, setIsMyAlbumsLoaded] = useState(false)

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
  const [albumType, setAlbumType] = useState("owner") // owner - friends - shared - public

  const [friendsSearch, setFriendsSearch] = useState("")
  const [foundUsers, setFoundUsers] = useState([])

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

  useEffect(async () => {
    if (user) {
      switch(albumType) {
      case "owner":
        if (myAlbums.length === 0) {
          setIsLoadingAlbums(true)
          await loadMyAlbums()
          setIsMyAlbumsLoaded(true)
          setIsLoadingAlbums(false)
        }
        break
      case "friends":
        if (friendsAlbums.length === 0) {
          setIsLoadingAlbums(true)
          await loadFriendsAlbums()
          setIsLoadingAlbums(false)
        }
        break
      case "shared":
        if (sharedAlbums.length === 0) {
          setIsLoadingAlbums(true)
          await loadSharedAlbums()
          setIsLoadingAlbums(false)
        }
        break
      case "public":
        if (publicAlbums.length === 0) {
          setIsLoadingAlbums(true)
          loadPublicAlbums()
          setIsLoadingAlbums(false)
        }
        break
      default: break
      }
    }
  }, [user, albumType, myAlbums, friendsAlbums, sharedAlbums, publicAlbums])

  useEffect(() => {
    if (isMyAlbumsLoaded) {
      const emptyMyAlbums = myAlbums.length === 0
      setShowHowTo(emptyMyAlbums)
      if (emptyMyAlbums) {
        loadPublicAlbums()
        setAlbumType("public")
      }
    }
  }, [myAlbums, isMyAlbumsLoaded])

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
  }, [currentComments])

  useEffect(() => {
    if (user?.friendRequests.length > 0 || user?.friendIds.length > 0) {
      let ids = user.friendRequests.map( r => r.fromUserId === user.id ? r.toUserId : r.fromUserId)
      ids = ids.filter( id => !usersCache[id])
      searchFriends({ ids: [ ...ids, ...user.friendIds] })
    }
  }, [user?.friendRequests, user?.friendIds])

  const executeAfterTimeout = (func, timeout) => {
    if ( timer ) {
      clearTimeout( timer )
    }
    timer = undefined
    timer = setTimeout(() => {
      func()
    }, timeout )
  }

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

  const onSearchUsers = async e => {
    const search = e.target.value
    setFriendsSearch(search)
    executeAfterTimeout(async () => {
      if (!search) {
        setFoundUsers([])
      } else if (search.length > 2) {
        const friends = await searchFriends({ search })
        setFoundUsers(friends)
      }
    }, 700)
  }

  const onSendFriendRequest = ({ id, userName }) => async () => {
    if (await sendFriendRequest({ id })) {
      newFlashMessage({ message: `Friend request sent to ${userName}` })
      loadUser()
    }
  }

  const onAcceptFriendRequest = (requestId, accept) => async () => {
    if (await acceptFriendRequest({ requestId, accept })) {
      newFlashMessage({ message: "Friend request accepted" })
    }
  }

  const onUnfriend = (friendId, friendName) => async () => {
    if (await unfriend({ friendId })) {
      loadUser()
      newFlashMessage({ message: `Unfriended ${friendName}` })
    }
  }

  if (!user) {
    return(<Fragment/>)
  }

  return (
    <div>
      { (user && user.id) &&
        <Notifications />
      }
      <main className="overflow-y-scroll bg-gray-200 static">

        {/* Begin Main */}

        <div className="p-4 block lg:flex flex-col">

          {/* How to upload first album */}
          { showHowTo &&
            <HowToUpload
              isFirst={myAlbums.length > 0}
              isUploadFile={true}
            />
          }

          {/* Main */}
          <div className="block lg:flex flex-row">
            <div className="flex flex-col lg:w-2/3 lg:mr-4">
              {/* Profile */}
              <div className="pt-6 pb-20 px-10 bg-white rounded shadow-lg static mb-6">
                <div className="w-full">
                  <img src={hoverUploadButton ? uploadBlue : uploadYellow}
                    className="w-10 h-8 relative cursor-pointer"
                    onMouseEnter={() => setHoverUploadButton(true)}
                    onMouseLeave={() => setHoverUploadButton(false)}
                    onClick={() => setShowHowTo(!showHowTo)}
                  />
                  <h2 className="font-bold text-lg text-center mb-2">
                    Profile
                  </h2>
                  <p className="text-center text-xs underline">Member since { Moment(user?.createdAt).format("LLL") }</p>
                </div>

                <div className="flex flex-col content-center justify-center items-center my-5">
                  {/* <div className="rounded-xl py-4 px-6 bg-gray-100 border border-gray-200 shadow">
                    <img src={getUserIcon({ ...user, iconNumber })} className="w-20 h-20"/>
                  </div> */}
                  <div className="flex flex-row mt-4 mb-2">
                    { getUserIcons(user).map((icon, i) => {
                      return(
                        <div key={i}
                          className={`hover:bg-blue-200 rounded-xl p-3 mx-2 cursor-pointer ${icon.number === (user.iconNumber || 1) && "border border-gray-400"}`}
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

                {/* Expanded Profile */}
                {/* <p className="align-center px-2 py-1 rounded-md tracking-wide text-sm text-gray-700 text-center">
                  This profile data helps us connect you with other tennis players and relevant topics
                </p>

                <div className="flex flex-col content-center justify-center items-center py-4">
                  <div className="flex flex-col content-center justify-center items-center">

                    <div className="flex flex-row w-full content-center justify-center items-center">
                      <p className="text-right align-center w-28 px-2 py-1 rounded-md font-bold tracking-wide">
                        Public?
                      </p>
                      <input type="checkbox"
                        className="shadow-md"
                        checked={isPublic}
                        onChange={() => setIsPublic(!isPublic)}
                      />
                    </div>

                    <div className="flex flex-row content-center justify-center items-center">
                      <p className="text-right align-center w-28 px-2 py-1 float-right rounded-md font-bold tracking-wide">
                        Birth Year
                      </p>
                      <div className="flex flex-row rounded-md px-2 py-1 w-40">
                        <input type="text"
                          className="w-36 px-1 rounded-md bg-gray-200 border border-gray-400 shadow-md"
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
                    </div>

                    <div className="flex flex-row content-center justify-center items-center">
                      <p className="text-right align-center w-28 px-2 py-1 float-right rounded-md font-bold tracking-wide">
                        Gender
                      </p>
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
                    </div>

                    <div className="flex flex-row content-center justify-center items-center">
                      <p className="text-right align-center w-28 px-2 py-1 float-right rounded-md font-bold tracking-wide">
                        USTA Level
                      </p>
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
                </div> */}
          
                <div className="flex flex-col w-full content-center justify-center items-center mt-12 mb-4">
                  <input type="button"
                    onMouseDown={() => setPressingSave(true)}
                    onMouseUp={() => setPressingSave(false)}
                    className={`w-22 px-2 py-3 rounded-lg ${saveButtonStyle} border border-gray-400 shadow-md uppercase tracking-wide font-semibold cursor-pointer`}
                    value="SAVE PROFILE"
                    onClick={onUpdateUserProfile}
                  />
                </div>
              </div>

              {/* Video Resources */}
              <div className="lg:flex flex-row bg-white rounded shadow-lg p-4 mb-4">

                <div className="py-1 px-4 lg:mr-4 mb-4 lg:mb-0 lg:w-1/3 content-center justify-center items-center bg-gray-100 rounded shadow-lg">
                  <h2 className="font-bold text-lg text-center mb-2">
                  Pro Swings
                  </h2>
                  <ProComparison />
                </div>
                
                <div className="p-1 flex flex-col lg:w-2/3 content-center justify-center items-center bg-gray-100 rounded shadow-lg">
                  <h2 className="font-bold text-lg text-center mb-2">
                  Tutorials
                  </h2>
                  <VideoResources
                    defaultVideoGroup="Forehands"
                    defaultVideo="Forehand Form Basics"
                  />
                </div>
                
              </div>

              {/* Friends */}
              <div className="lg:flex flex-row bg-white rounded shadow-lg p-4 lg:h-96">
                {/* Friends Search */}
                <div className="p-4 lg:mr-4 lg:w-1/3 content-center justify-center items-center bg-gray-100 rounded shadow-lg overflow-y-scroll">
                  <div className="content-center justify-center items-center w-full">
                    <SearchBoxContainer>
                      <SearchBox
                        placeholder="Search Users"
                        value={friendsSearch}
                        onChange={onSearchUsers}
                      />
                      <GrSearch/>
                    </SearchBoxContainer>
                  </div>
                  
                  { foundUsers.map(({ id, userName, firstName, lastName }, i) => {
                    const isFriend = user.friendIds.includes(id)
                    const isRequested = user.friendRequests.find( req => req.toUserId === id || req.fromUserId === id )
                    return(
                      <UserResultBox key={i}>
                        <p className="username">@{ userName }</p>
                        <p className="fullname">{ firstName } {lastName}</p>
                        { (!isFriend && !isRequested && id !== user.id) &&
                      <button
                        onClick={onSendFriendRequest({ id, userName })}
                      >
                        Request
                      </button>
                        }
                      </UserResultBox>
                    )
                  })}
                </div>

                {/* Friends */}
                <div className="p-4 lg:mr-4 lg:w-1/3 content-center justify-center items-center bg-gray-100 rounded shadow-lg overflow-y-scroll">
                  <div className="content-center justify-center items-center mb-2">
                    <h2 className="underline font-semibold text-center">
                    Friends
                    </h2>
                  </div>
                  <div className="flex flex-col content-center justify-center items-center">
                    { user?.friendIds.length === 0 &&
                    <h2>None</h2>
                    }
                    { user?.friendIds.map(friendId => {
                      const cache = usersCache[friendId]
                      return(
                        <div key={friendId}
                          className="flex flex-row rounded-lg my-1 p-2 bg-yellow-300 shadow-md content-center justify-center items-center w-full"
                        >
                          <div className="flex flex-row">
                            <span className="underline text-blue-400 mr-2 text-xs text-xs tracking-wider font-semibold">
                              { cache ? cache.userName : "..." } ({ cache ? `${cache.firstName} ${cache.lastName}` : "..." })
                            </span>
                            <button className="rounded mx-1 px-1 py-0.5 underline bg-red-400 cursor-pointer text-xs tracking-wide font-semibold"
                              onClick={onUnfriend( friendId, cache?.userName)}
                            >
                            unfriend
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Requests */}
                <div className="p-4 mb-4 lg:mb-0 lg:w-1/3 content-center justify-center items-center bg-gray-100 rounded shadow-lg overflow-y-scroll">
                  <div className="content-center justify-center items-center mb-2">
                    <h2 className="underline font-semibold text-center">
                    Requests
                    </h2>
                  </div>
                  <div className="flex flex-col content-center justify-center items-center">
                    { user?.friendRequests.length === 0 &&
                    <h2>None</h2>
                    }
                    { user?.friendRequests.map(req => {
                      if (req.fromUserId === user.id) {
                        const cache = usersCache[req.toUserId]
                        return(
                          <div key={req.id}
                            className="rounded my-1 p-2 bg-gray-200 shadow-md w-full"
                          >
                            <div className="flex flex-row content-center justify-center items-center">
                              <p className="text-xs tracking-wider font-semibold mr-2">
                              Pending to
                              </p>
                              <span className="underline text-blue-400 cursor-pointer text-xs tracking-wide font-semibold">
                                { cache ? `${cache.userName} (${cache.firstName} ${cache.lastName})` : "..." }
                              </span>
                            </div>
                          </div>
                        )
                      }
                      const cache = usersCache[req.fromUserId]
                      return(
                        <div key={req.id}
                          className="flex flex-col rounded-lg my-1 p-2 bg-yellow-200 w-full shadow-md w-full"
                        >
                          <div className="flex flex-row content-center justify-center items-center mb-1">
                            <p className="text-xs tracking-wider font-semibold mr-2">
                            Pending from
                            </p>
                            <span className="underline text-blue-400 cursor-pointer text-xs tracking-wide font-semibold">
                              { cache ? cache.userName : "..." }
                            </span>
                          </div>
                          <div className="flex flex-row content-center justify-center items-center">
                            <button className="rounded mx-1 px-1 py-0.5 underline bg-green-300 cursor-pointer text-xs tracking-wide font-semibold"
                              onClick={onAcceptFriendRequest(req.id, true)}
                            >
                            Accept
                            </button>
                            <button className="rounded mx-1 px-1 py-0.5 underline bg-red-300 cursor-pointer text-xs tracking-wide font-semibold"
                              onClick={onAcceptFriendRequest(req.id, false)}
                            >
                            Reject
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Albums */}
            <div className="flex flex-col lg:w-1/3 pt-6 p-4 bg-white rounded shadow-lg static">
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

              { (activeAlbums.length === 0 && !isLoadingAlbums) &&
                <div className="px-20 mt-4">
                  <p className="text-center bg-gray-100 text-gray-700 tracking-wide rounded-lg w-full px-20">no albums</p>
                </div>
              }
              { (activeAlbums.length === 0 && isLoadingAlbums) &&
                <div className="px-20 mt-4">
                  <p className="text-center bg-yellow-300 text-gray-700 tracking-wide rounded-lg w-full px-20">Loading...</p>
                </div>
              }

              <div className="flex flex-row lg:flex-col overflow-x-scroll">
                { activeAlbums.map((album, i) => 
                  <div key={i}
                    className="mx-1 lg:mx-0 w-11/12 lg:w-full"
                  >
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
                  </div>  
                )}
              </div>

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
    sendFriendRequest: SendFriendRequest(dispatch),
    acceptFriendRequest: AcceptFriendRequest(dispatch),
    loadUser: LoadUser(dispatch),
    unfriend: Unfriend(dispatch),
  }
}
  
Profile.propTypes = {
  myAlbums: PropTypes.arrayOf(PropTypes.object),
  friendsAlbums: PropTypes.arrayOf(PropTypes.object),
  sharedAlbums: PropTypes.arrayOf(PropTypes.object),
  publicAlbums: PropTypes.arrayOf(PropTypes.object),
  user: PropTypes.object,
  usersCache: PropTypes.object,

  acceptFriendRequest: PropTypes.func,
  loadUser: PropTypes.func,
  searchFriends: PropTypes.func,
  sendFriendRequest: PropTypes.func,
  unfriend: PropTypes.func,
  loadMyAlbums: PropTypes.func,
  loadFriendsAlbums: PropTypes.func,
  loadSharedAlbums: PropTypes.func,
  loadPublicAlbums: PropTypes.func,
  newFlashMessage: PropTypes.func,
  updateUserProfile: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile)