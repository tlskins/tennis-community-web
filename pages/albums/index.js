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
import AlbumAndCommentsPreview from "../../components/AlbumAndCommentsPreview"
import Sidebar from "../../components/Sidebar"
import {
  LoadMyAlbums,
  LoadFriendsAlbums,
  LoadPublicAlbums,
  DeleteAlbum,
  FlagAlbum,
} from "../../behavior/coordinators/albums"
import { SearchFriends } from "../../behavior/coordinators/friends"
import flag from "../../public/flag.svg"
import { GrSearch, GrFormClose } from "react-icons/gr"

import {
  DateContainer,
  DatePickerContainer,
  LinkButton,
  SearchBox,
  SearchBoxContainer,
} from "../../styles/styled-components"


const SWING_FRAMES = 60
const albumsPerRow = 4

const filterAlbums = (albums, search, rgx, start, end) => {
  let filtered = albums.filter( alb => search ? rgx.test(alb.name) : true)
  filtered = filtered.filter( alb => start ? Moment(alb.createdAt).isAfter(Moment(start)) : true)
  return filtered.filter( alb => end ? Moment(alb.createdAt).isBefore(Moment(end)) : true)
}

const AlbumsIndex = ({
  myAlbums,
  friendsAlbums,
  publicAlbums,
  user,
  usersCache,

  deleteAlbum,
  flagAlbum,
  loadMyAlbums,
  loadFriendsAlbums,
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
  const [currentComments, setCurrentComments] = useState([])

  const [hoveredAlbum, setHoveredAlbum] = useState(undefined)
  const [toDeleteAlbum, setToDeleteAlbum] = useState(undefined)

  const [page, setPage] = useState(0)
  const [albumType, setAlbumType] = useState("personal")
  const [search, setSearch] = useState("")
  const [startDate, setStartDate] = useState(undefined)
  const [endDate, setEndDate] = useState(undefined)

  var sourceAlbums
  switch(albumType) {
  case "personal": sourceAlbums = myAlbums
    break
  case "friends": sourceAlbums = friendsAlbums
    break
  case "public": sourceAlbums = publicAlbums
    break
  default: sourceAlbums = myAlbums
  }

  const searchRgx = new RegExp(search, "gi")
  const filteredAlbums = filterAlbums(sourceAlbums, search, searchRgx, startDate, endDate)
  const activeAlbums = filteredAlbums.slice(page * albumsPerRow, (page+1) * albumsPerRow).filter( a => !!a )

  useEffect(() => {
    if (user) {
      loadMyAlbums()
      loadFriendsAlbums()
      loadPublicAlbums()
    }
  }, [])

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
  }, [myAlbums, friendsAlbums, publicAlbums, page])

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

  const onSearch = e => {
    setSearch(e.target.value)
    setPage(0)
  }

  const onFlagAlbum = album => () => {
    toggleFlashMessage({
      id: album.id,
      message: `Flag Album: "${album.name}"?`,
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
    <div className="flex flex-col h-screen min-h-screen">
      { (user && user.id) &&
        <Notifications />
      }

      <main className="flex flex-1 overflow-y-auto">

        {/* Begin Sidebar */}

        <Sidebar>
          <LinkButton>
            <Link href="/albums/new">Create New Album</Link>
          </LinkButton>
          <div style={{ height: "30px", width: "100%" }}/>
          <SearchBoxContainer>
            <SearchBox
              placeholder="Search Albums"
              value={search}
              onChange={onSearch}
            />
            <GrSearch/>
          </SearchBoxContainer>

          <DateContainer>
            <p className="date-label">Upload Date (Start)</p>
            <DatePickerContainer>
              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
              />
              { startDate &&
                <GrFormClose onClick={() => setStartDate(undefined)}/>
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
                  <GrFormClose onClick={() => setEndDate(undefined)}/>
              }
            </DatePickerContainer>
          </DateContainer>

          <div style={{ height: "20px", width: "100%" }}/>

          <div className="content-center justify-center items-center">
            <p className="text-white tracking-wide uppercase text-sm underline mb-2 text-center">Album Type</p>
            <div className="flex flex-col content-center justify-center items-start px-8">
              <div>
                <input type="radio" id="personal" name="albumType" value="personal" className="mr-2" onChange={() => setAlbumType("personal")} checked={albumType === "personal"}/>
                <label htmlFor="personal"
                  className="text-white tracking-wide uppercase text-sm"
                >
                personal
                </label>
              </div>

              <div>
                <input type="radio" id="shared" name="albumType" value="shared" className="mr-2" onChange={() => setAlbumType("shared")} checked={albumType === "shared"}/>
                <label htmlFor="shared"
                  className="text-white tracking-wide uppercase text-sm"
                >
                shared
                </label>
              </div>

              <div>
                <input type="radio" id="friends" name="albumType" value="friends" className="mr-2" onChange={() => setAlbumType("friends")} checked={albumType === "friends"}/>
                <label htmlFor="friends"
                  className="text-white tracking-wide uppercase text-sm"
                >
                friends
                </label>
              </div>

              <div>
                <input type="radio" id="public" name="albumType" value="public" className="mr-2" onChange={() => setAlbumType("public")} checked={albumType === "public"}/>
                <label htmlFor="public"
                  className="text-white tracking-wide uppercase text-sm"
                >
                public
                </label>
              </div>
            </div>
          </div>
        </Sidebar>

        {/* End Sidebar */}

        {/* Begin Album Videos */}

        <div className="p-4 flex flex-col w-full bg-gray-100 h-full">

          {/* Start My Albums */}

          { (user && user.id) &&
            <div className="flex flex-col rounded bg-white px-2 py-4 shadow-md mb-2 w-full h-full">
              <div className="flex flex-row content-center justify-center items-center mb-4">
                { page > 0 &&
                  <button
                    onClick={() => setPage(page-1)}
                    className="p-0.5 mx-1"
                  >
                    &lt;
                  </button>
                }
                <h2 className="font-medium underline mx-2 text-center">
                  Page { page+1 }
                </h2>
                { (page < (activeAlbums.length / albumsPerRow)-1) &&
                  <button
                    onClick={() => setPage(page+1)}
                    className="-0.5 mx-1"
                  >
                    &gt;
                  </button>
                }
              </div>

              <div className="flex flex-col content-center justify-center items-center">
                { activeAlbums.length === 0 &&
                  <div className="w-full py-2 px-12 content-center justify-center items-center">
                    <h2 className="font-semibold text-center">None</h2>
                  </div>
                }
                <div className="grid grid-cols-2 gap-4 w-full py-4 px-40">
                  { activeAlbums.map( (album, i) => {
                    return (
                      <div key={i}
                        className="flex flex-col relative content-center justify-center items-center hover:bg-blue-100 rounded-md mb-6 p-2"
                        onMouseOver={() => setHoveredAlbum(album.id)}
                        onMouseLeave={() => {
                          setHoveredAlbum(undefined)
                          setToDeleteAlbum(undefined)
                        }}
                      >
                        { (hoveredAlbum === album.id && !toDeleteAlbum) &&
                        <button className="absolute top-2 right-4 underline text-sm text-blue-400 cursor-pointer"
                          onClick={() => {
                            setHoveredAlbum(undefined)
                            setToDeleteAlbum(album.id)
                          }}
                        >
                          Delete
                        </button>
                        }
                        { toDeleteAlbum === album.id &&
                        <button className="absolute top-2 right-4 underline text-sm text-blue-400 cursor-pointer"
                          onClick={() => {
                            setToDeleteAlbum(undefined)
                          }}
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

                        <p className="font-semibold text-blue-700 underline cursor-pointer"
                          onClick={() => router.push(`/albums/${album.id}`)}
                        >
                          { album.name }
                        </p>
                        <p>
                          <span className="font-semibold text-xs"> Created: </span>
                          <span className="text-xs">{ Moment(album.createdAt).format("LLL") }</span>
                        </p>

                        <AlbumAndCommentsPreview
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
                    )
                  })}
                </div>
              </div>
            </div>
          }
        </div>
        {/* End Album Videos */}
      </main>

    </div>
  )
}

const mapStateToProps = (state) => {
  console.log("mapStateToProps", state)
  return {
    myAlbums: state.albums.myAlbums,
    friendsAlbums: state.albums.friendsAlbums,
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
    loadPublicAlbums: LoadPublicAlbums(dispatch),
    searchFriends: SearchFriends(dispatch),
    toggleFlashMessage: args => dispatch(newNotification(args)),
  }
}

AlbumsIndex.propTypes = {
  myAlbums: PropTypes.arrayOf(PropTypes.object),
  friendsAlbums: PropTypes.arrayOf(PropTypes.object),
  publicAlbums: PropTypes.arrayOf(PropTypes.object),
  user: PropTypes.object,
  usersCache: PropTypes.object,

  deleteAlbum: PropTypes.func,
  flagAlbum: PropTypes.func,
  loadMyAlbums: PropTypes.func,
  loadFriendsAlbums: PropTypes.func,
  loadPublicAlbums: PropTypes.func,
  searchFriends: PropTypes.func,
  toggleFlashMessage: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(AlbumsIndex)
