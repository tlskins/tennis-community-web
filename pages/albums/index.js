import React, { useEffect, useState, createRef, Fragment } from "react"
import { connect } from "react-redux"
import ReactPlayer from "react-player"
import PropTypes from "prop-types"
import Moment from "moment"
import { useRouter } from "next/router"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

import Notifications from "../../components/Notifications"
import { LoadAlbums } from "../../behavior/coordinators/albums"

const SWING_FRAMES = 45
const albumsPerRow = 3

const filterAlbums = (albums, search, rgx, start, end) => {
  let filtered = albums.filter( alb => search ? rgx.test(alb.name) : true)
  filtered = filtered.filter( alb => start ? Moment(alb.createdAt).isAfter(Moment(start)) : true)
  return filtered.filter( alb => end ? Moment(alb.createdAt).isBefore(Moment(end)) : true)
}

const AlbumsIndex = ({
  albums,

  loadAlbums,
}) => {
  const router = useRouter()
  const [playerRefs, setPlayerRefs] = useState([])
  const [playerFrames, setPlayerFrames] = useState({})
  const [playings, setPlayings] = useState([])
  const [pips, setPips] = useState([]) // Picture in picture for each player

  const [myAlbumsPage, setMyAlbumsPage] = useState(0)
  const [friendsAlbumsPage, setFriendsAlbumsPage] = useState(0)
  const [publicAlbumsPage, setPublicAlbumsPage] = useState(0)
  const [search, setSearch] = useState("")
  const [startDate, setStartDate] = useState(undefined)
  const [endDate, setEndDate] = useState(undefined)

  const searchRgx = new RegExp(search, "gi")
  const myFilteredAlbums = filterAlbums(albums.myAlbums, search, searchRgx, startDate, endDate)
  const friendsFilteredAlbums = filterAlbums(albums.friendsAlbums, search, searchRgx, startDate, endDate)
  const publicFilteredAlbums = filterAlbums(albums.publicAlbums, search, searchRgx, startDate, endDate)

  const myActiveAlbums = myFilteredAlbums.slice(myAlbumsPage * albumsPerRow, (myAlbumsPage+1) * albumsPerRow).filter( a => !!a )
  const friendsActiveAlbums = friendsFilteredAlbums.slice(friendsAlbumsPage * albumsPerRow, (friendsAlbumsPage+1) * albumsPerRow).filter( a => !!a )
  const publicActiveAlbums = publicFilteredAlbums.slice(publicAlbumsPage * albumsPerRow, (publicAlbumsPage+1) * albumsPerRow).filter( a => !!a )

  useEffect(() => {
    loadAlbums()
  }, [])

  useEffect(() => {
    const activeAlbums = [...myActiveAlbums, ...friendsActiveAlbums, ...publicActiveAlbums]
    setPlayerRefs(ref => activeAlbums.map((_, i) => ref[i] || createRef()))
    setPlayings(activeAlbums.map(() => false))
    setPips(activeAlbums.map(() => false))
  }, [albums.myAlbums, myAlbumsPage, albums.friendsAlbums, friendsAlbumsPage, albums.publicAlbums, publicAlbumsPage])

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

  const renderVideo = ({ albumId, swing, i, ref, playing, pip, duration }) => {
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
          <input type='button'
            className='border rounded py-0.5 px-1 mx-1 text-xs font-bold bg-indigo-700 text-white cursor-pointer'
            value='view'
            onClick={() => router.push(`/albums/${albumId}`)}
          />

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

          <div className="bg-white rounded p-0.5 mx-1 text-xs">
            <span> { duration ? duration : "0" }/{SWING_FRAMES}</span>
          </div>
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

  return (
    <div className="flex flex-col h-screen min-h-screen">
      {/* <header>{title}</header> */}
      <Notifications />

      <main className="flex flex-1 overflow-y-auto">

        {/* Begin Sidebar */}

        <div className="h-screen top-0 sticky p-4 bg-white w-1/5 overflow-y-scroll">
          <div className="flex flex-col content-center justify-center items-center text-sm">

            <h2 className="text-blue-400 underline">
                Search Albums
            </h2>
            <div className="mb-2 flex flex-col">
              <input type="text"
                placeholder="search"
                className="rounded border border-black m-1 p-1"
                value={search}
                onChange={onSearch}
              />
            </div>
            <div className="flex flex-row">
              <div className="flex flex-col mx-1">
                <div className="flex flex-row m-0.5">
                  <p className="text-center">
                  Start
                  </p>
                  { startDate &&
                    <input type='button'
                      className="border w-6 rounded-full mx-1 text-xs bg-red-300"
                      onClick={() => setStartDate(undefined)}
                      value="x"
                    />
                  }
                </div>
                <DatePicker
                  className="rounded border border-black p-0.5 w-20 text-xs"
                  selected={startDate}
                  onChange={date => setStartDate(date)}
                />
              </div>
              <div className="flex flex-col mx-1">
                <div className="flex flex-row m-0.5">
                  <p className="text-center">
                    End
                  </p>
                  { endDate &&
                    <input type='button'
                      className="border w-6 rounded-full mx-1 text-xs bg-red-300"
                      onClick={() => setEndDate(undefined)}
                      value="x"
                    />
                  }
                </div>
                <DatePicker
                  className="rounded border border-black p-0.5 w-20 text-xs"
                  selected={endDate}
                  onChange={date => setEndDate(date)}
                />
              </div>
            </div>
            
          </div>
        </div>

        {/* End Sidebar */}

        {/* Begin Album Videos */}

        <div className="p-4 flex flex-col w-4/5">

          {/* Start My Albums */}

          <div className="flex flex-col">
            <div className="flex flex-row">
              <h2>My Albums</h2>
              <div className="p-4 flex flex-wrap w-4/5">
                { myAlbumsPage > 0 &&
                <button
                  onClick={() => setMyAlbumsPage(myAlbumsPage-1)}
                  className="border border-black rounder p-0.5 mx-1"
                >
                  &lt;
                </button>
                }
                { (myAlbumsPage < (albums.myAlbums.length / albumsPerRow)-1) &&
                <button
                  onClick={() => setMyAlbumsPage(myAlbumsPage+1)}
                  className="border border-black rounder p-0.5 mx-1"
                >
                  &gt;
                </button>
                }
              </div>
            </div>
            <div className="flex flex-row">
              { myActiveAlbums.length === 0 &&
                <div className="py-2 px-12">
                  <h2 className="font-semibold">None</h2>
                </div>
              }
              { myActiveAlbums.map( (album, i) => {
                return (
                  <div key={i}
                    className="flex flex-col relative w-1/3 content-center justify-center items-center hover:bg-green-200 rounded-md p-2"
                  >
                    <p><span className="font-semibold">{ album.name }</span></p>
                    <p>
                      <span className="font-semibold text-xs"> Created: </span> 
                      <span className="text-xs">{ Moment(album.createdAt).format("LLL") }</span>
                    </p>
                    { 
                      renderVideo({
                        albumId: album.id,
                        swing: album.swingVideos[0],
                        i,
                        ref: playerRefs[i],
                        playing: playings[i],
                        pip: pips[i],
                        duration: playerFrames[i]
                      })
                    }
                  </div>
                )
              })}
            </div>
          </div>

          {/* Start Friends Albums */}

          <div className="flex flex-col">
            <div className="flex flex-row">
              <h2>Friends Albums</h2>
              <div className="p-4 flex w-4/5">
                { friendsAlbumsPage > 0 &&
                <button
                  onClick={() => setFriendsAlbumsPage(friendsAlbumsPage-1)}
                  className="border border-black rounder p-0.5 mx-1"
                >
                  &lt;
                </button>
                }
                { (friendsAlbumsPage < (albums.friendsAlbums.length / albumsPerRow)-1) &&
                <button
                  onClick={() => setMyAlbumsPage(friendsAlbumsPage+1)}
                  className="border border-black rounder p-0.5 mx-1"
                >
                  &gt;
                </button>
                }
              </div>
            </div>
            <div className="flex flex-row">
              { friendsActiveAlbums.length === 0 &&
                <div className="py-2 px-12">
                  <h2 className="font-semibold">None</h2>
                </div>
              }
              { friendsActiveAlbums.map( (album, i) => {
                const idx = i + myActiveAlbums.length
                return (
                  <div key={i}
                    className="flex flex-col relative w-1/3 content-center justify-center items-center hover:bg-gray-200"
                  >
                    <p><span className="font-semibold">{ album.name }</span></p>
                    <p>
                      <span className="font-semibold text-xs"> Created: </span> 
                      <span className="text-xs">{ Moment(album.createdAt).format("LLL") }</span>
                    </p>
                    { 
                      renderVideo({
                        albumId: album.id,
                        swing: album.swingVideos[0],
                        i: idx,
                        ref: playerRefs[idx],
                        playing: playings[idx],
                        pip: pips[idx],
                        duration: playerFrames[idx]
                      })
                    }
                  </div>
                )
              })}
            </div>
          </div>

          {/* Start Public Albums */}

          <div className="flex flex-col">
            <div className="flex flex-row">
              <div className="flex flex-col">
                <h2>Public Albums</h2>
                <div className="p-4 flex w-4/5">
                  { publicAlbumsPage > 0 &&
                    <button
                      onClick={() => setPublicAlbumsPage(publicAlbumsPage-1)}
                      className="border border-black rounder p-0.5 mx-1"
                    >
                      &lt;
                    </button>
                  }
                  { (publicAlbumsPage < (albums.publicAlbums.length / albumsPerRow)-1) &&
                    <button
                      onClick={() => setMyAlbumsPage(publicAlbumsPage+1)}
                      className="border border-black rounder p-0.5 mx-1"
                    >
                      &gt;
                    </button>
                  }
                </div>
              </div>
            </div>
            <div className="flex flex-row">
              { publicActiveAlbums.length === 0 &&
                <div className="py-2 px-12">
                  <h2 className="font-semibold">None</h2>
                </div>
              }
              { publicActiveAlbums.map( (album, i) => {
                const idx = i + (myActiveAlbums.length) + (friendsActiveAlbums.length)
                return (
                  <div key={i}
                    className="flex flex-col relative w-1/3 content-center justify-center items-center hover:bg-gray-200"
                  >
                    <p><span className="font-semibold">{ album.name }</span></p>
                    <p>
                      <span className="font-semibold text-xs"> Created: </span> 
                      <span className="text-xs">{ Moment(album.createdAt).format("LLL") }</span>
                    </p>
                    { 
                      renderVideo({
                        albumId: album.id,
                        swing: album.swingVideos[0],
                        i: idx,
                        ref: playerRefs[idx],
                        playing: playings[idx],
                        pip: pips[idx],
                        duration: playerFrames[idx]
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
    albums: state.albums,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    loadAlbums: LoadAlbums(dispatch),
  }
}
  
AlbumsIndex.propTypes = {
  albums: PropTypes.object,
  user: PropTypes.object,

  loadAlbums: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(AlbumsIndex)