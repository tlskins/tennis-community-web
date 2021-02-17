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
const myAlbumsPerPageOther = 4
const myAlbumsPerPage1 = 3
const sharedAlbumsPerPage = 3
let timer

const Home = ({
  reduxMyAlbums,
  reduxFriendsAlbums,
  reduxSharedAlbums,
  reduxPublicAlbums,
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
}) => {
  const router = useRouter()

  const [showHowTo, setShowHowTo] = useState(false)
  const [hoverUploadButton, setHoverUploadButton] = useState(false)

  const [playerRefs, setPlayerRefs] = useState([])
  const [playerFrames, setPlayerFrames] = useState({})
  const [playings, setPlayings] = useState([])
  const [pips, setPips] = useState([])
  const [currentSwings, setCurrentSwings] = useState([])
  const [currentComments, setCurrentComments] = useState([])

  const [myAlbumsPage, setMyAlbumsPage] = useState(0)
  const [sharedAlbumsPage, setSharedAlbumsPage] = useState(0)
  const [myAlbums, setMyAlbums] = useState(null)
  const [sharedAlbums, setSharedAlbums] = useState(null)
  const [albumType, setAlbumType] = useState("shared") // friends - shared - public

  const [friendsSearch, setFriendsSearch] = useState("")
  const [foundUsers, setFoundUsers] = useState([])

  const myAlbumsPerPage = myAlbumsPage === 0 ? myAlbumsPerPage1 : myAlbumsPerPageOther
  const myActiveAlbums = (myAlbums || []).slice(myAlbumsPage * myAlbumsPerPage, (myAlbumsPage+1) * myAlbumsPerPage).filter( a => !!a ) || []
  const sharedActiveAlbums = (sharedAlbums || []).slice(sharedAlbumsPage * sharedAlbumsPerPage, (sharedAlbumsPage+1) * sharedAlbumsPerPage).filter( a => !!a ) || []

  useEffect(() => {
    if (!user || !user?.id) {
      router.push("/")
    }
  }, [user])

  // load albums by relevance then presence
  useEffect( async () => {
    loadMyAlbums()
    const shared = await loadSharedAlbums()
    if (shared && shared.length > 0) return

    const friends = await loadFriendsAlbums()
    if (friends && friends.length > 0) {
      setAlbumType("friends")
      return
    }

    loadPublicAlbums()
    setAlbumType("public")
  }, [])

  useEffect(async () => {
    if (reduxMyAlbums) setMyAlbums([...reduxMyAlbums])
    if (albumType === "friends") setSharedAlbums([...reduxFriendsAlbums])
    if (albumType === "shared") setSharedAlbums([...reduxSharedAlbums])
    if (albumType === "public") setSharedAlbums([...reduxPublicAlbums])
  }, [albumType, reduxMyAlbums, reduxFriendsAlbums, reduxSharedAlbums, reduxPublicAlbums])

  useEffect(async () => {
    if (user) {
      switch(albumType) {
      case "friends": loadFriendsAlbums()
        break
      case "shared": loadSharedAlbums()
        break
      case "public": loadPublicAlbums()
        break
      default: break
      }
    }
  }, [user, albumType])

  useEffect(() => {
    const activeAlbums = [...myActiveAlbums, ...sharedActiveAlbums]
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
          <div className="block relative">
            {/* My Albums */}
            <div className="flex flex-col lg:w-2/3 lg:mr-4">
              <div className="pt-6 pb-20 px-10 bg-white rounded shadow-lg static mb-6">
                <div className="w-full">
                  <img src={hoverUploadButton ? uploadBlue : uploadYellow}
                    className="w-10 h-8 relative cursor-pointer"
                    onMouseEnter={() => setHoverUploadButton(true)}
                    onMouseLeave={() => setHoverUploadButton(false)}
                    onClick={() => setShowHowTo(!showHowTo)}
                  />
                  <h2 className="font-bold text-lg text-center mb-2">
                    My Albums
                  </h2>

                  <div className="block pt-6 p-4 bg-white rounded shadow-lg static">

                    { (myActiveAlbums.length === 0 && myAlbums === []) &&
                      <div className="px-20 mt-4">
                        <p className="text-center bg-gray-100 text-gray-700 tracking-wide rounded-lg w-full px-20">no albums</p>
                      </div>
                    }
                    { (myActiveAlbums.length === 0 && myAlbums === null) &&
                      <div className="px-20 mt-4">
                        <p className="text-center bg-yellow-300 text-gray-700 tracking-wide rounded-lg w-full px-20">Loading...</p>
                      </div>
                    }

                    {/* <div className="flex flex-row lg:flex-wrap lg:content-center lg:justify-center lg:items-center overflow-x-scroll lg:overflow-auto"> */}
                    <div className="flex flex-row lg:grid lg:grid-cols-2 lg:gap-2 lg:content-center lg:justify-center lg:items-center overflow-x-scroll lg:overflow-x-auto">
                      
                      { myAlbumsPage === 0 &&
                        <div className={`flex m-2 w-11/12 content-center justify-center items-center bg-blue-300 rounded-xl shadow-lg p-8 ${myActiveAlbums.length % 2 === 0 && "col-span-2"}`}
                          style={{"min-width": "80%"}}
                        >
                          <button
                            className="bg-gray-800 text-yellow-300 p-5 rounded font-bold text-lg uppercase shadow-lg text-center hover:bg-yellow-300 hover:text-gray-800"
                            onClick={() => router.push("/albums/new")}
                          >
                          New Album
                          </button>
                        </div>
                      }

                      { myActiveAlbums.map((album, i) => 
                        <div key={i}
                          className="m-2 w-11/12"
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
                            className="rounded w-full text-sm tracking-wider font-bold bg-yellow-300 shadow-md cursor-pointer"
                            value={`Previous Page (${myAlbumsPage})`}
                            onClick={() => setMyAlbumsPage(myAlbumsPage-1)}
                          />
                        </div>
                    }

                    { myActiveAlbums.length === myAlbumsPerPage &&
                      <div className="w-full content-center justify-center items-center">
                        <input type="button"
                          className="rounded w-full text-sm tracking-wider font-bold bg-yellow-300 shadow-md cursor-pointer"
                          value={`Next Page (${myAlbumsPage+2})`}
                          onClick={() => setMyAlbumsPage(myAlbumsPage+1)}
                        />
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Shared Albums */}
            <div className="flex flex-col lg:absolute lg:w-1/3 h-full pb-4 lg:pb-0 lg:px-4 right-0 top-0">
              <div className="bg-white rounded shadow-lg static p-4 h-full">
                <h2 className="font-bold text-lg text-center tracking-wider mb-1 w-full">
                Shared Albums
                </h2>

                <div className="flex flex-row content-center justify-center items-center mb-3">
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

                { (sharedActiveAlbums.length === 0 && sharedAlbums === []) &&
                <div className="px-20 mt-4">
                  <p className="text-center bg-gray-100 text-gray-700 tracking-wide rounded-lg w-full px-20">no albums</p>
                </div>
                }
                { (sharedActiveAlbums.length === 0 && sharedAlbums === null) &&
                <div className="px-20 mt-4">
                  <p className="text-center bg-yellow-300 text-gray-700 tracking-wide rounded-lg w-full px-20">Loading...</p>
                </div>
                }

                <div className="flex flex-row lg:flex-col overflow-x-scroll lg:overflow-x-auto">              
                  { sharedActiveAlbums.map((album, i) => 
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

                { sharedAlbumsPage > 0 &&
                <div className="w-full content-center justify-center items-center mb-1">
                  <input type="button"
                    className="rounded w-full text-sm tracking-wider font-bold bg-yellow-300 shadow-md cursor-pointer"
                    value={`Previous Page (${sharedAlbumsPage})`}
                    onClick={() => setSharedAlbumsPage(sharedAlbumsPage-1)}
                  />
                </div>
                }

                { sharedActiveAlbums.length === sharedAlbumsPerPage &&
                <div className="w-full content-center justify-center items-center">
                  <input type="button"
                    className="rounded w-full text-sm tracking-wider font-bold bg-yellow-300 shadow-md cursor-pointer"
                    value={`Next Page (${sharedAlbumsPage+2})`}
                    onClick={() => setSharedAlbumsPage(sharedAlbumsPage+1)}
                  />
                </div>
                }
              </div>
            </div>
          
            {/* Videos & Friends */}
            <div className="flex flex-col lg:w-2/3 lg:mr-4">

              {/* Friends */}
              <div className="lg:flex flex-row bg-white rounded shadow-lg p-4 lg:h-96">
                <div className="p-4 lg:mr-4 lg:w-1/3 content-center justify-center items-center bg-gray-100 rounded shadow-lg overflow-y-auto">
                  <div className="content-center justify-center items-center w-full relative">
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
                          <button onClick={onSendFriendRequest({ id, userName })}>
                            Request
                          </button>
                        }
                      </UserResultBox>
                    )
                  })}
                </div>

                {/* Friends */}
                <div className="p-4 lg:mr-4 lg:w-1/3 content-center justify-center items-center bg-gray-100 rounded shadow-lg overflow-y-auto">
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
                <div className="p-4 mb-4 lg:mb-0 lg:w-1/3 content-center justify-center items-center bg-gray-100 rounded shadow-lg overflow-y-auto">
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
            
              {/* Video Resources */}
              <div className="lg:flex flex-row bg-white rounded shadow-lg p-4 mt-4">

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
    reduxMyAlbums: state.albums.myAlbums,
    reduxFriendsAlbums: state.albums.friendsAlbums,
    reduxSharedAlbums: state.albums.sharedAlbums,
    reduxPublicAlbums: state.albums.publicAlbums,
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
  
Home.propTypes = {
  reduxMyAlbums: PropTypes.arrayOf(PropTypes.object),
  reduxFriendsAlbums: PropTypes.arrayOf(PropTypes.object),
  reduxSharedAlbums: PropTypes.arrayOf(PropTypes.object),
  reduxPublicAlbums: PropTypes.arrayOf(PropTypes.object),
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

export default connect(mapStateToProps, mapDispatchToProps)(Home)