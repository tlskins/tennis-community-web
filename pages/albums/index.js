import React, { useEffect, useState, createRef, useRef, Fragment } from "react"
import { connect } from "react-redux"
import ReactPlayer from "react-player"
import PropTypes from "prop-types"

import Notifications from "../../components/Notifications"
import { LoadAlbums } from "../../behavior/coordinators/albums"

const albumsPerRow = 3

const AlbumsIndex = ({
  albums,

  loadAlbums,
}) => {
  const [playerRefs, setPlayerRefs] = useState([])
  const [playerDurations, setPlayerDurations] = useState({})
  const [playings, setPlayings] = useState([])
  const [pips, setPips] = useState([]) // Picture in picture for each player

  const [myAlbumsPage, setMyAlbumsPage] = useState(0)
  const [friendsAlbumsPage, setFriendsAlbumsPage] = useState(0)
  const [publicAlbumsPage, setPublicAlbumsPage] = useState(0)

  const myActiveAlbums = albums.myAlbums.slice(myAlbumsPage * albumsPerRow, (myAlbumsPage+1) * albumsPerRow).filter( a => !!a )
  console.log("myalbums", myActiveAlbums)
  const friendsActiveAlbums = albums.friendsAlbums.slice(friendsAlbumsPage * albumsPerRow, (friendsAlbumsPage+1) * albumsPerRow).filter( a => !!a )
  const publicActiveAlbums = albums.publicAlbums.slice(publicAlbumsPage * albumsPerRow, (publicAlbumsPage+1) * albumsPerRow).filter( a => !!a )

  useEffect(() => {
    console.log("loading ablums...")
    loadAlbums()
  }, [])

  useEffect(() => {
    console.log("setting players...")
    const activeAlbums = [...myActiveAlbums, ...friendsActiveAlbums, ...publicActiveAlbums]
    setPlayerRefs(ref => activeAlbums.map((_, i) => ref[i] || createRef()))
    setPlayings(activeAlbums.map(() => false))
    setPips(activeAlbums.map(() => false))
  }, [albums.myAlbums, myAlbumsPage, albums.friendsAlbums, friendsAlbumsPage, albums.publicAlbums, publicAlbumsPage])

  const handleSeekChange = (playerRef, i) => e => {
    const seekTo = parseFloat(e.target.value)
    if (seekTo) {
      playerRef.current.seekTo(seekTo)
      setPlayerDurations({
        ...playerDurations,
        [i]: seekTo,
      })
    }
  }

  const renderVideo = ({ swing, i, ref, playing, pip, duration }) => {
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
          onProgress={({ played }) => setPlayerDurations({
            ...playerDurations,
            [i]: parseFloat((Math.ceil(played/.05)*.05).toFixed(2)),
          })}
          height="226px"
          width="285px"
        />

        {/* Controls Panel */}
        <div className="flex flex-row content-center justify-center p-1 mt-4 bg-gray-100 rounded">
          <p>
            { swing.clip }.{ swing.swing }
          </p>

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
                setPlayerDurations({
                  ...playerDurations,
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
            max={1}
            step='0.05'
            onChange={handleSeekChange(ref, i)}
            onFocus={ e => {
              console.log("focus!")
              e.stopPropagation()
              e.preventDefault()
            }}
          />

          <div className="bg-white rounded p-0.5 mx-1 text-xs">
            <span> { duration ? duration.toFixed(2) : "0.00" }/1.0</span>
          </div>
        </div>
      </Fragment>
    )
  }


  return (
    <div className="flex flex-col h-screen min-h-screen">
      {/* <header>{title}</header> */}
      <Notifications />

      <main className="flex flex-1 overflow-y-auto">

        {/* Begin Sidebar */}

        <div className="h-screen top-0 sticky p-4 bg-white w-1/5 overflow-y-scroll">
          <div className="flex flex-col content-center justify-center items-center text-sm">

            {/* Pro Comparison Sidebar */}
            <p>Search / Filter Sidebar</p>
            
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
              { myActiveAlbums.map( (album, i) => {
                return (
                  <div key={i}
                    className="flex flex-col relative w-1/3 content-center justify-center items-center hover:bg-gray-200"
                  >
                    <p>{ album.name }</p>
                    { 
                      renderVideo({
                        swing: album.swingVideos[0],
                        i,
                        ref: playerRefs[i],
                        playing: playings[i],
                        pip: pips[i],
                        duration: playerDurations[i]
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
              { friendsActiveAlbums.map( (album, i) => {
                const idx = i + myActiveAlbums.length
                return (
                  <div key={i}
                    className="flex flex-col relative w-1/3 content-center justify-center items-center hover:bg-gray-200"
                  >
                    <p>{ album.name }</p>
                    { 
                      renderVideo({
                        swing: album.swingVideos[0],
                        i: idx,
                        ref: playerRefs[idx],
                        playing: playings[idx],
                        pip: pips[idx],
                        duration: playerDurations[idx]
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
              { publicActiveAlbums.map( (album, i) => {
                const idx = i + (myActiveAlbums.length) + (friendsActiveAlbums.length)
                return (
                  <div key={i}
                    className="flex flex-col relative w-1/3 content-center justify-center items-center hover:bg-gray-200"
                  >
                    <p>{ album.name }</p>
                    { 
                      renderVideo({
                        swing: album.swingVideos[0],
                        i: idx,
                        ref: playerRefs[idx],
                        playing: playings[idx],
                        pip: pips[idx],
                        duration: playerDurations[idx]
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