import React, { useEffect, useState, createRef } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import Moment from "moment"
import Link from "next/link"
import { useRouter } from "next/router"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

import { newNotification } from "../../state/ui/action"
import Notifications from "../../components/Notifications"
import AlbumAndComments from "../../components/AlbumAndComments"
import Sidebar from "../../components/Sidebar"
import {
  LoadMyAlbums,
  LoadFriendsAlbums,
  LoadSharedAlbums,
  LoadPublicAlbums,
  DeleteAlbum,
  FlagAlbum,
} from "../../behavior/coordinators/albums"
import { SearchFriends } from "../../behavior/coordinators/friends"
import flag from "../../public/flag.svg"
import { GrSearch } from "react-icons/gr"
import { FaWindowClose } from "react-icons/fa"
import { IconContext } from "react-icons"

import {
  DateContainer,
  DatePickerContainer,
  LinkButton,
  SearchBox,
  SearchBoxContainer,
} from "../../styles/styled-components"


const SWING_FRAMES = 60
const ALBUMS_PER_COL = 3

const filterAlbums = (albums, search, rgx, start, end) => {
  let filtered = albums.filter( alb => search ? rgx.test(alb.name) : true)
  filtered = filtered.filter( alb => start ? Moment(alb.createdAt).isAfter(Moment(start)) : true)
  filtered = filtered.filter( alb => end ? Moment(alb.createdAt).isBefore(Moment(end)) : true)
  return filtered.filter( alb => !!alb )
}

const AlbumsIndex = ({
  myAlbums,
  friendsAlbums,
  sharedAlbums,
  publicAlbums,
  user,
  usersCache,

  deleteAlbum,
  flagAlbum,
  loadMyAlbums,
  loadFriendsAlbums,
  loadSharedAlbums,
  loadPublicAlbums,
  searchFriends,
  toggleFlashMessage,
}) => {
  const router = useRouter()

  const [playerRefs, setPlayerRefs] = useState([])
  const [playerFrames, setPlayerFrames] = useState({})
  const [playings, setPlayings] = useState([])
  const [pips, setPips] = useState([])
  const [currentSwings, setCurrentSwings] = useState([])

  const [toDeleteAlbum, setToDeleteAlbum] = useState(undefined)

  const [page, setPage] = useState(0)
  const [albumType, setAlbumType] = useState("owner")
  const [search, setSearch] = useState("")
  const [startDate, setStartDate] = useState(undefined)
  const [endDate, setEndDate] = useState(undefined)
  const [isMyAlbumsLoaded, setIsMyAlbumsLoaded] = useState(false)

  var sourceAlbums
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

  const searchRgx = new RegExp(search, "gi")
  const filteredAlbums = filterAlbums(sourceAlbums, search, searchRgx, startDate, endDate)
  const activeAlbums = filteredAlbums.slice(page * ALBUMS_PER_COL, (page+1) * ALBUMS_PER_COL).filter( a => !!a )

  useEffect(async () => {
    if (user) {
      switch(albumType) {
      case "owner":
        if (myAlbums.length === 0) {
          await loadMyAlbums()
          setIsMyAlbumsLoaded(true)
        }
        break
      case "friends":
        if (friendsAlbums.length === 0) loadFriendsAlbums()
        break
      case "shared":
        if (sharedAlbums.length === 0) loadSharedAlbums()
        break
      case "public":
        if (publicAlbums.length === 0) loadPublicAlbums()
        break
      default: break
      }
    } else {
      setIsMyAlbumsLoaded(true)
    }
  }, [user, albumType, myAlbums, friendsAlbums, sharedAlbums, publicAlbums])

  useEffect(() => {
    if (isMyAlbumsLoaded) {
      if (myAlbums.length === 0) {
        loadPublicAlbums()
        setAlbumType("public")
      }
    }
  }, [myAlbums, isMyAlbumsLoaded])

  useEffect(() => {
    // set video players
    setPlayerRefs(ref => activeAlbums.map((_, i) => ref[i] || createRef()))
    setPlayings(activeAlbums.map(() => true))
    setPips(activeAlbums.map(() => false))
    setCurrentSwings(activeAlbums.map(() => 0))

    // load users cache
    if (activeAlbums.length > 0) {
      const commentersSet = new Set([])
      activeAlbums.forEach( album => {
        (album.comments || []).forEach( comment => {
          if (!usersCache[comment.userId]) commentersSet.add(comment.userId)
        })
        album.swingVideos.forEach( swing => {
          (swing.comments || []).forEach( comment => {
            if (!usersCache[comment.userId]) commentersSet.add(comment.userId)
          })
        })
      })
      const ids = Array.from(commentersSet)
      if (ids.length > 0) searchFriends({ ids })
    }
  }, [myAlbums, friendsAlbums, publicAlbums, page])

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

  const onSearch = e => {
    setSearch(e.target.value)
    setPage(0)
  }

  const onFlagAlbum = album => () => {
    toggleFlashMessage({
      id: album.id,
      message: `Flag Album: "${album.name}" as inappropriate?`,
      buttons: [
        {
          buttonText: "Confirm",
          callback: async () => {
            const success = await flagAlbum({
              albumCreatedAt: album.createdAt,
              albumUserId: album.userId,
              albumId: album.id,
              albumName: album.name,
            })
            if (success) {
              toggleFlashMessage({
                id: Moment().toString(),
                message: "Album Flagged!"
              })
            }
          },
        }
      ]
    })
  }

  return (
    <div>
      { (user && user.id) &&
        <Notifications />
      }

      <main className="overflow-y-scroll">
        <div className="lg:flex lg:flex-row min-h-screen">
          <Sidebar>
            <LinkButton>
              <Link href="/albums/new">Create New Album</Link>
            </LinkButton>
            <div style={{ height: "30px", width: "100%" }}/>

            {/* Album Filters */}
            <div className="flex flex-wrap mb-3 content-center justify-center items-center">
              <div className={`m-1 px-0.5 rounded-lg ${albumType === "owner" && "bg-gray-300"}`}>
                <input type="button"
                  value="owner"
                  onClick={() => setAlbumType("owner")}
                  className={`px-2 m-1 rounded-lg ${albumType === "owner" ? "bg-black text-yellow-300 underline" : "bg-yellow-300"} shadow-md border border-gray-400 font-semibold text-xs tracking-wide cursor-pointer`}
                />
              </div>

              <div className={`m-1 px-0.5 rounded-lg ${albumType === "shared" && "bg-gray-300"}`}>
                <input type="button"
                  value="shared"
                  onClick={() => setAlbumType("shared")}
                  className={`px-2 m-1 rounded-lg ${albumType === "shared" ? "bg-black text-yellow-300 underline" : "bg-red-300"} shadow-md border border-gray-400 font-semibold text-xs tracking-wide cursor-pointer`}
                />
              </div>

              <div className={`m-1 px-0.5 rounded-lg ${albumType === "friends" && "bg-gray-300"}`}>
                <input type="button"
                  value="friends"
                  onClick={() => setAlbumType("friends")}
                  className={`px-2 m-1 rounded-lg ${albumType === "friends" ? "bg-black text-yellow-300 underline" : "bg-green-300"} shadow-md border border-gray-400 font-semibold text-xs tracking-wide cursor-pointer`}
                />
              </div>

              <div className={`m-1 px-0.5 rounded-lg ${albumType === "public" && "bg-gray-300"}`}>
                <input type="button"
                  value="public"
                  onClick={() => setAlbumType("public")}
                  className={`px-2 m-1 rounded-lg ${albumType === "public" ? "bg-black text-yellow-300 underline" : "bg-blue-300"} shadow-md border border-gray-400 font-semibold text-xs tracking-wide cursor-pointer`}
                />
              </div>
            </div>

            {/* Page Nav */}
            <div className="flex flex-row content-center justify-center items-center p-2 mb-2">
              { page > 0 &&
                  <button
                    onClick={() => setPage(page-1)}
                    className="p-0.5 mx-1 cursor-pointer text-white tracking-wide"
                  >
                    &lt;
                  </button>
              }

              <h2 className="font-medium mx-2 text-center text-white tracking-wide uppercase">
                Page { page+1 }
              </h2>

              { (page < (filteredAlbums.length / ALBUMS_PER_COL)-1) &&
                  <button
                    onClick={() => setPage(page+1)}
                    className="-0.5 mx-1 cursor-pointer text-white tracking-wide"
                  >
                    &gt;
                  </button>
              }
            </div>

            <div className="content-center justify-center items-center">
              <div className="content-center justify-center items-center w-full">
                <SearchBoxContainer>
                  <SearchBox
                    placeholder="Search Albums"
                    value={search}
                    onChange={onSearch}
                  />
                  <GrSearch/>
                </SearchBoxContainer>
              </div>

              
              <DateContainer>
                <p className="date-label">Upload Date (Start)</p>
                <DatePickerContainer>
                  <DatePicker
                    selected={startDate}
                    onChange={date => setStartDate(date)}
                  />
                  { startDate &&
                    <IconContext.Provider value={{ color: "white" }}>
                      <div>
                        <FaWindowClose onClick={() => setStartDate(undefined)}/>
                      </div>
                    </IconContext.Provider>
                  }
                </DatePickerContainer>
              </DateContainer>

              <div style={{ height: "20px", width: "100%" }}/>

              <DateContainer>
                <p className="date-label">Upload Date (End)</p>
                <DatePickerContainer>
                  <DatePicker
                    selected={endDate}
                    onChange={date => setEndDate(date)}
                  />
                  { endDate &&
                    <IconContext.Provider value={{ color: "white" }}>
                      <div>
                        <FaWindowClose onClick={() => setEndDate(undefined)}/>
                      </div>
                    </IconContext.Provider>
                
                  }
                </DatePickerContainer>
              </DateContainer>
            </div>
          </Sidebar>

          {/* Begin Album Videos */}
          <div className="flex flex-col p-4 bg-gray-200 lg:w-3/4">
            <div className="flex flex-col rounded bg-white px-2 py-4 shadow-md mb-2 content-center justify-center items-center">              
              <div className="flex flex-wrap py-4 content-center justify-center items-center">
                { activeAlbums.length === 0 &&
                    <div className="flex flex-col w-full relative content-center justify-center items-center rounded-md p-2">
                      <h2 className="font-semibold text-center">None</h2>
                    </div>
                }
                <div className="w-full flex flex-col content-center justify-center items-center">
                  { page > 0 &&
                  <button
                    onClick={() => setPage(page-1)}
                    className="rounded border-2 border-gray-400 w-full lg:w-1/3 text-sm tracking-wider font-bold bg-yellow-300 shadow-md cursor-pointer mb-2"
                  >
                    Last Page ({ page })
                  </button>
                  }
                </div>
                { activeAlbums.map( (album, i) => {
                  return (
                    <div key={i}
                      className="flex flex-col lg:w-7/12 relative content-center justify-center items-center hover:bg-blue-100 rounded mb-6 p-2"
                    >
                      { (album.userId === user?.id && !toDeleteAlbum) &&
                        <button className="absolute top-2 right-4 underline text-sm text-blue-400 cursor-pointer"
                          onClick={() => setToDeleteAlbum(album.id)}
                        >
                          Delete
                        </button>
                      }
                      { toDeleteAlbum === album.id &&
                        <button className="absolute top-2 right-4 underline text-sm text-blue-400 cursor-pointer"
                          onClick={() => setToDeleteAlbum(undefined)}
                        >
                          Cancel?
                        </button>
                      }
                      { toDeleteAlbum === album.id &&
                        <button className="absolute top-6 right-4 underline text-sm text-blue-400 cursor-pointer"
                          onClick={() => {
                            setToDeleteAlbum(undefined)
                            deleteAlbum(album.id)
                          }}
                        >
                          Confirm?
                        </button>
                      }

                      <div className="flex flex row">
                        <p className="font-semibold text-blue-700 underline cursor-pointer"
                          onClick={() => router.push(`/albums/${album.id}`)}
                        >
                          { album.name }
                        </p>

                        { (user && album.userId != user.id) &&
                          <div className="ml-2 mr-1 p-0.5 rounded-xl bg-white hover:bg-blue-300">
                            <img src={flag}
                              className="w-4 h-4 cursor-pointer"
                              onClick={onFlagAlbum(album)}
                            />
                          </div>
                        }
                      </div>

                      <p className="text-xs">
                        <span className="font-semibold text-xs"> Created: </span> { Moment(album.createdAt).format("lll") }
                      </p>

                      <p className="text-xs">
                        <span className="font-semibold text-xs"> Updated: </span> { Moment(album.updatedAt).format("lll") }
                      </p>

                      <AlbumAndComments
                        album={album}
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
                  )
                })}
                <div className="w-full flex flex-col content-center justify-center items-center">
                  { (page < (filteredAlbums.length / ALBUMS_PER_COL)-1) &&
                  <button
                    onClick={() => setPage(page+1)}
                    className="rounded border-2 border-gray-400 w-full lg:w-1/3 text-sm tracking-wider font-bold bg-yellow-300 shadow-md cursor-pointer mt-2"
                  >
                    Next Page ({ page+2 })
                  </button>
                  }
                </div>
              </div>
            </div>
          </div>
          {/* End Album Videos */}
        </div>
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
    deleteAlbum: DeleteAlbum(dispatch),
    flagAlbum: FlagAlbum(dispatch),
    loadMyAlbums: LoadMyAlbums(dispatch),
    loadFriendsAlbums: LoadFriendsAlbums(dispatch),
    loadSharedAlbums: LoadSharedAlbums(dispatch),
    loadPublicAlbums: LoadPublicAlbums(dispatch),
    searchFriends: SearchFriends(dispatch),
    toggleFlashMessage: args => dispatch(newNotification(args)),
  }
}

AlbumsIndex.propTypes = {
  myAlbums: PropTypes.arrayOf(PropTypes.object),
  sharedAlbums: PropTypes.arrayOf(PropTypes.object),
  friendsAlbums: PropTypes.arrayOf(PropTypes.object),
  publicAlbums: PropTypes.arrayOf(PropTypes.object),
  user: PropTypes.object,
  usersCache: PropTypes.object,

  deleteAlbum: PropTypes.func,
  flagAlbum: PropTypes.func,
  loadMyAlbums: PropTypes.func,
  loadSharedAlbums: PropTypes.func,
  loadFriendsAlbums: PropTypes.func,
  loadPublicAlbums: PropTypes.func,
  searchFriends: PropTypes.func,
  toggleFlashMessage: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(AlbumsIndex)
