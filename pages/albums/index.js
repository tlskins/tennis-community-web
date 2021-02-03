import React, { useEffect, useState, createRef, Fragment } from "react"
import { connect } from "react-redux"
import ReactPlayer from "react-player"
import PropTypes from "prop-types"
import Moment from "moment"
import Link from "next/link"
import { useRouter } from "next/router"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

import { newNotification } from "../../state/ui/action"
import Notifications from "../../components/Notifications"
import Sidebar from "../../components/Sidebar"
import {
  LoadMyAlbums,
  LoadFriendsAlbums,
  LoadPublicAlbums,
  DeleteAlbum,
  FlagAlbum,
} from "../../behavior/coordinators/albums"
import speechBubble from "../../public/speech-bubble.svg"
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
const albumsPerRow = 3

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

  deleteAlbum,
  flagAlbum,
  loadMyAlbums,
  loadFriendsAlbums,
  loadPublicAlbums,
  toggleFlashMessage,
}) => {
  const router = useRouter()
  const [playerRefs, setPlayerRefs] = useState([])
  const [playerFrames, setPlayerFrames] = useState({})
  const [playings, setPlayings] = useState([])
  const [pips, setPips] = useState([])

  const [hoveredAlbum, setHoveredAlbum] = useState(undefined)
  const [toDeleteAlbum, setToDeleteAlbum] = useState(undefined)

  const [myAlbumsPage, setMyAlbumsPage] = useState(0)
  const [friendsAlbumsPage, setFriendsAlbumsPage] = useState(0)
  const [publicAlbumsPage, setPublicAlbumsPage] = useState(0)
  const [search, setSearch] = useState("")
  const [startDate, setStartDate] = useState(undefined)
  const [endDate, setEndDate] = useState(undefined)

  const searchRgx = new RegExp(search, "gi")
  const myFilteredAlbums = filterAlbums(myAlbums, search, searchRgx, startDate, endDate)
  const friendsFilteredAlbums = filterAlbums(friendsAlbums, search, searchRgx, startDate, endDate)
  const publicFilteredAlbums = filterAlbums(publicAlbums, search, searchRgx, startDate, endDate)

  const myActiveAlbums = myFilteredAlbums.slice(myAlbumsPage * albumsPerRow, (myAlbumsPage+1) * albumsPerRow).filter( a => !!a )
  const friendsActiveAlbums = friendsFilteredAlbums.slice(friendsAlbumsPage * albumsPerRow, (friendsAlbumsPage+1) * albumsPerRow).filter( a => !!a )
  const publicActiveAlbums = publicFilteredAlbums.slice(publicAlbumsPage * albumsPerRow, (publicAlbumsPage+1) * albumsPerRow).filter( a => !!a )

  useEffect(() => {
    if (user) {
      loadMyAlbums()
      loadFriendsAlbums()
      loadPublicAlbums()
    }
  }, [])

  useEffect(() => {
    const activeAlbums = [...myActiveAlbums, ...friendsActiveAlbums, ...publicActiveAlbums]
    setPlayerRefs(ref => activeAlbums.map((_, i) => ref[i] || createRef()))
    setPlayings(activeAlbums.map(() => false))
    setPips(activeAlbums.map(() => false))
  }, [myAlbums, myAlbumsPage, friendsAlbums, friendsAlbumsPage, publicAlbums, publicAlbumsPage])

  const handleSeekChange = (playerRef, i) => e => {
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

  const renderVideo = ({ album, swing, i, ref, playing, pip, duration, flaggable }) => {
    if (!swing) {
      return null
    }
    return(
      <Fragment>
        <ReactPlayer
          className="rounded-md overflow-hidden"
          ref={ref}
          url={swing.videoURL}
          playing={playing}
          pip={pip}
          volume={0}
          muted={true}
          loop={true}
          progressInterval={200}
          onProgress={({ played }) => {
            const frame = Math.round(played*SWING_FRAMES)
            setPlayerFrames({
              ...playerFrames,
              [i]: frame,
            })
          }}
          height="226px"
          width="285px"
        />

        {/* Controls Panel */}
        <div className="flex flex-row content-center justify-center p-1 mt-4 bg-gray-100 rounded">

          {/* Picture in Picture */}
          { pip &&
            <input type='button'
              className='border rounded p-0.5 mx-1 text-xs font-bold bg-indigo-700 text-white'
              value='-'
              tabIndex={(i*3)+1}
              onClick={() => {
                const newPips = pips.map((p,j) => j === i ? false : p)
                setPips(newPips)
              }}
            />
          }
          { !pip &&
            <input type='button'
              className='border rounded p-0.5 mx-1 text-xs font-bold bg-indigo-700 text-white'
              value='+'
              tabIndex={(i*3)+1}
              onClick={() => {
                const newPips = pips.map((p,j) => j === i ? true : p)
                setPips(newPips)
              }}
            />
          }

          {/* Play / Pause */}
          { playing &&
            <input type='button'
              className='border w-10 rounded p-0.5 mx-1 text-xs bg-red-700 text-white'
              value='pause'
              tabIndex={(i*3)+2}
              onClick={() => {
                const newPlayings = playings.map((p,j) => j === i ? false : p)
                setPlayings(newPlayings)
              }}
            />
          }
          { !playing &&
            <input type='button'
              className='border w-10 rounded p-0.5 mx-1 text-xs bg-green-700 text-white'
              value='play'
              tabIndex={(i*3)+2}
              onClick={() => {
                const newPlayings = playings.map((p,j) => j === i ? true : p)
                setPlayings(newPlayings)
                setPlayerFrames({
                  ...playerFrames,
                  [i]: undefined,
                })
              }}
            />
          }

          {/* Seek */}
          <input
            type='range'
            tabIndex={(i*3)+3}
            value={duration}
            min={0}
            max={SWING_FRAMES}
            step='1'
            onChange={handleSeekChange(ref, i)}
            onFocus={ e => {
              console.log("focus!")
              e.stopPropagation()
              e.preventDefault()
            }}
          />

          <div className="bg-white rounded p-0.5 mx-1 text-xs w-10">
            <p className="text-center"> { duration ? duration : "0" }/{SWING_FRAMES}</p>
          </div>

          <div className="flex flex-row bg-white rounded-lg mx-1 text-xs p-0.5 w-10">
            <p className="mr-0.5 text-center">{ (album.comments?.length || 0) + album.swingVideos.reduce((acc, swing) => acc + (swing.comments?.length || 0), 0) }</p>
            <img src={speechBubble} className="w-5 h-5"/>
          </div>

          { flaggable &&
            <div className="ml-2 mr-1 p-0.5 rounded-xl bg-white hover:bg-blue-100">
              <img src={flag}
                className="w-4 h-4 cursor-pointer"
                onClick={onFlagAlbum(album)}
              />
            </div>
          }

        </div>
      </Fragment>
    )
  }

  const onSearch = e => {
    setSearch(e.target.value)
    setMyAlbumsPage(0)
    setFriendsAlbumsPage(0)
    setPublicAlbumsPage(0)
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
        </Sidebar>

        {/* End Sidebar */}

        {/* Begin Album Videos */}

        <div className="p-4 flex flex-col w-full bg-gray-100">

          {/* Start My Albums */}

          { (user && user.id) &&
            <div className="flex flex-col rounded bg-white px-2 py-4 shadow-md mb-2 w-full">
              <div className="flex flex-row content-center justify-center items-center mb-2">
                { myAlbumsPage > 0 &&
                <button
                  onClick={() => setMyAlbumsPage(myAlbumsPage-1)}
                  className="p-0.5 mx-1"
                >
                  &lt;
                </button>
                }
                <h2 className="font-medium underline mx-2">My Albums</h2>
                { (myAlbumsPage < (myAlbums.length / albumsPerRow)-1) &&
                <button
                  onClick={() => setMyAlbumsPage(myAlbumsPage+1)}
                  className="-0.5 mx-1"
                >
                  &gt;
                </button>
                }
              </div>

              <div className="flex flex-row">
                { myActiveAlbums.length === 0 &&
                <div className="w-full py-2 px-12 content-center justify-center items-center">
                  <h2 className="font-semibold text-center">None</h2>
                </div>
                }
                { myActiveAlbums.map( (album, i) => {
                  return (
                    <div key={i}
                      className="flex flex-col relative w-1/3 content-center justify-center items-center hover:bg-green-200 rounded-md p-2"
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
                      {
                        renderVideo({
                          album,
                          swing: album.swingVideos[0],
                          i,
                          ref: playerRefs[i],
                          playing: playings[i],
                          pip: pips[i],
                          duration: playerFrames[i],
                        })
                      }
                    </div>
                  )
                })}
              </div>
            </div>
          }

          {/* Start Friends Albums */}

          { (user && user.id) &&
            <div className="flex flex-col rounded bg-white px-2 py-4 shadow-md my-2">
              <div className="flex flex-row content-center justify-center items-center mb-2">
                { friendsAlbumsPage > 0 &&
                <button
                  onClick={() => setFriendsAlbumsPage(friendsAlbumsPage-1)}
                  className="p-0.5 mx-1"
                >
                  &lt;
                </button>
                }
                <h2 className="font-medium underline mx-2">Friends Albums</h2>
                { (friendsAlbumsPage < (friendsAlbums.length / albumsPerRow)-1) &&
                <button
                  onClick={() => setMyAlbumsPage(friendsAlbumsPage+1)}
                  className="-0.5 mx-1"
                >
                  &gt;
                </button>
                }
              </div>

              <div className="flex flex-row">
                { friendsActiveAlbums.length === 0 &&
                <div className="w-full py-2 px-12 content-center justify-center items-center">
                  <h2 className="font-semibold text-center">None</h2>
                </div>
                }
                { friendsActiveAlbums.map( (album, i) => {
                  const idx = i + myActiveAlbums.length
                  return (
                    <div key={i}
                      className="flex flex-col relative w-1/3 content-center justify-center items-center hover:bg-green-200 rounded-md p-2"
                    >
                      <p className="font-semibold text-blue-700 underline cursor-pointer"
                        onClick={() => router.push(`/albums/${album.id}`)}
                      >
                        { album.name }
                      </p>
                      <p>
                        <span className="font-semibold text-xs"> Created: </span>
                        <span className="text-xs">{ Moment(album.createdAt).format("LLL") }</span>
                      </p>
                      {
                        renderVideo({
                          album,
                          swing: album.swingVideos[0],
                          i: idx,
                          ref: playerRefs[idx],
                          playing: playings[idx],
                          pip: pips[idx],
                          duration: playerFrames[idx],
                          flaggable: true,
                        })
                      }
                    </div>
                  )
                })}
              </div>
            </div>
          }

          {/* Start Public Albums */}

          <div className="flex flex-col rounded bg-white px-2 py-4 shadow-md mb-2">
            <div className="flex flex-row content-center justify-center items-center mb-2">
              { publicAlbumsPage > 0 &&
                  <button
                    onClick={() => setPublicAlbumsPage(publicAlbumsPage-1)}
                    className="p-0.5 mx-1"
                  >
                    &lt;
                  </button>
              }
              <h2 className="font-medium underline mx-2">Public Albums</h2>
              { (publicAlbumsPage < (publicAlbums.length / albumsPerRow)-1) &&
                  <button
                    onClick={() => setMyAlbumsPage(publicAlbumsPage+1)}
                    className="-0.5 mx-1"
                  >
                    &gt;
                  </button>
              }
            </div>

            <div className="flex flex-row">
              { publicActiveAlbums.length === 0 &&
                <div className="w-full py-2 px-12 content-center justify-center items-center">
                  <h2 className="font-semibold text-center">None</h2>
                </div>
              }
              { publicActiveAlbums.map( (album, i) => {
                const idx = i + (myActiveAlbums.length) + (friendsActiveAlbums.length)
                return (
                  <div key={i}
                    className="flex flex-col relative w-1/3 content-center justify-center items-center hover:bg-green-200 rounded-md p-2"
                  >
                    <p className="font-semibold text-blue-700 underline cursor-pointer"
                      onClick={() => router.push(`/albums/${album.id}`)}
                    >
                      { album.name }
                    </p>
                    <p>
                      <span className="font-semibold text-xs"> Created: </span>
                      <span className="text-xs">{ Moment(album.createdAt).format("LLL") }</span>
                    </p>
                    {
                      renderVideo({
                        album,
                        swing: album.swingVideos[0],
                        i: idx,
                        ref: playerRefs[idx],
                        playing: playings[idx],
                        pip: pips[idx],
                        duration: playerFrames[idx],
                        flaggable: true,
                      })
                    }
                  </div>
                )
              })}
            </div>
          </div>

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
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    deleteAlbum: DeleteAlbum(dispatch),
    flagAlbum: FlagAlbum(dispatch),
    loadMyAlbums: LoadMyAlbums(dispatch),
    loadFriendsAlbums: LoadFriendsAlbums(dispatch),
    loadPublicAlbums: LoadPublicAlbums(dispatch),
    toggleFlashMessage: args => dispatch(newNotification(args)),
  }
}

AlbumsIndex.propTypes = {
  myAlbums: PropTypes.arrayOf(PropTypes.object),
  friendsAlbums: PropTypes.arrayOf(PropTypes.object),
  publicAlbums: PropTypes.arrayOf(PropTypes.object),
  user: PropTypes.object,

  deleteAlbum: PropTypes.func,
  flagAlbum: PropTypes.func,
  loadMyAlbums: PropTypes.func,
  loadFriendsAlbums: PropTypes.func,
  loadPublicAlbums: PropTypes.func,
  toggleFlashMessage: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(AlbumsIndex)
