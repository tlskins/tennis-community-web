import React, { useEffect, useState, createRef, useRef, Fragment } from "react"
import { connect } from "react-redux"
import ReactPlayer from "react-player"
import PropTypes from "prop-types"
import { useRouter } from "next/router"

import Notifications from "../../components/Notifications"
import { GetRecentUploads } from "../../behavior/coordinators/uploads"
import { LoadAlbums, LoadAlbum, UpdateAlbum } from "../../behavior/coordinators/albums"
import { setAlbum } from "../../state/album/action"

const publicVideos = [
  {
    url: "https://tennis-swings.s3.amazonaws.com/public/federer_backhand.mp4",
    name: "Federer Backhand",
  },
  {
    url: "https://tennis-swings.s3.amazonaws.com/public/federer_forehand.mp4",
    name: "Federer Forehand",
  },
]

const swingVieMap = {
  "video": 9,
  "gif": 24,
  "jpg": 24,
}

let timer

const Album = ({
  album,
  recentUploads,
  getRecentUploads,
  loadAlbum,
  updateAlbum,
  updateAlbumRedux,
}) => {
  const router = useRouter()
  const albumId = router.query.id && router.query.id[0]

  const swingVideos = album?.swingVideos || []
  const videosCount = swingVideos.length
  const [albumView, setAlbumView] = useState("video")
  const [swingsPerPage, setSwingsPerPage] = useState(9)

  const [playbackRate, setPlaybackRate] = useState(1)
  const [allPlaying, setAllPlaying] = useState(true)
  const [playerRefs, setPlayerRefs] = useState([])
  const [playerDurations, setPlayerDurations] = useState({})
  const [playings, setPlayings] = useState([])
  const [pips, setPips] = useState([]) // Picture in picture for each player

  const [activeSideBar, setActiveSidebar] = useState("New Album")

  const [albumPage, setAlbumPage] = useState(0)
  const [hoveredSwing, setHoveredSwing] = useState(undefined)
  const [deleteSwing, setDeleteSwing] = useState(undefined)

  const sideVideoRef = useRef(undefined)
  const [sideVideo, setSideVideo] = useState(publicVideos[0].url)
  const [sideVideoDuration, setSideVideoDuration] = useState(0)
  const [sideVideoPlayback, setSideVideoPlayback] = useState(1)
  const [sideVideoPlaying, setSideVideoPlaying] = useState(false)
  const [sideVideoPip, setSideVideoPip] = useState(false)

  const pageVideos = swingVideos.slice(albumPage * swingsPerPage, (albumPage+1) * swingsPerPage)

  useEffect(() => {
    if (albumId) {
      loadAlbum(albumId)
    }
  }, [albumId])

  useEffect(() => {
    if (album?.id) {
      setPlayerRefs(ref => pageVideos.map((_, i) => ref[i] || createRef()))
      setPlayings(pageVideos.map(() => true))
      setPips(pageVideos.map(() => false))
    }
  }, [album?.id, albumPage])

  useEffect(() => {
    if (recentUploads === null) {
      getRecentUploads()
    }
  }, [recentUploads])

  const handleAllSeekChange = e => {
    const seekTo = parseFloat(e.target.value)
    if (seekTo) {
      setPlayings(swingVideos.map(() => false))
      playerRefs.forEach( playerRef => playerRef.current.seekTo(seekTo))
    }
  }

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

  const handleSideSeekChange = e => {
    const seekTo = parseFloat(e.target.value)
    if (seekTo) {
      sideVideoRef.current.seekTo(seekTo)
      setSideVideoDuration(seekTo)
    }
  }

  const onDeleteSwing = swingId => {
    updateAlbum({
      ...album,
      swingVideos: album.swingVideos.filter( swing => swing.id !== swingId ),
    })
  }

  const executeAfterTimeout = (func, timeout) => {
    if ( timer ) {
      clearTimeout( timer )
    }
    timer = undefined
    timer = setTimeout(() => {
      func()
    }, timeout )
  }

  const onUpdateAlbumName = e => {
    const updatedAlbum = { ...album, name: e.target.value }
    updateAlbumRedux(updatedAlbum)
    executeAfterTimeout(() => {
      updateAlbum(updatedAlbum)
    }, 700)
  }

  const renderVideo = ({ swing, i, ref, playing, pip, duration }) => {
    return(
      <Fragment>
        {/* flex flex-col p-2 m-4 w-1/6 h-1/4 content-center justify-center items-center rounded shadow-md */}
        <ReactPlayer
          className="rounded-md overflow-hidden"
          ref={ref}
          url={swing.videoURL} 
          playing={playing}
          pip={pip}
          volume={0}
          muted={true}
          playbackRate={playbackRate}
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
            <Fragment>
              <h2 className="text-blue-400 underline cursor-pointer"
                onClick={() => {
                  if (activeSideBar === "Pro Comparison") {
                    setActiveSidebar(undefined)
                  } else {
                    setActiveSidebar("Pro Comparison")
                  }
                }}
              >
                Pro Comparison
              </h2>
              <div className="mb-2">
                { activeSideBar === "Pro Comparison" &&
                <Fragment>
                  <select onChange={e => setSideVideo(e.target.value)}>
                    { publicVideos.map((vid, i) => {
                      return(
                        <option key={i} value={vid.url}>{ vid.name }</option>
                      )
                    })}
                  </select>

                  <ReactPlayer
                    className="rounded-md overflow-hidden"
                    ref={sideVideoRef}
                    url={sideVideo} 
                    playing={sideVideoPlaying}
                    pip={sideVideoPip}
                    volume={0}
                    muted={true}
                    playbackRate={sideVideoPlayback}
                    loop={true}
                    progressInterval={200}
                    onProgress={({ played }) => setSideVideoDuration(
                      parseFloat((Math.ceil(played/.05)*.05).toFixed(2))
                    )}
                    height=""
                    width=""
                  />

                  {/* Controls Panel */}
          
                  <div className="flex flex-row content-center justify-center items-center mt-4">
                    {/* Picture in Picture */}
                    { sideVideoPip &&
                      <input type='button'
                        className='border rounded p-0.5 mx-1 text-xs font-bold bg-indigo-700 text-white'
                        value='-'
                        onClick={() => setSideVideoPip(false)}
                      />
                    }
                    { !sideVideoPip &&
                      <input type='button'
                        className='border rounded p-0.5 mx-1 text-xs font-bold bg-indigo-700 text-white'
                        value='+'
                        onClick={() => setSideVideoPip(true)}
                      />
                    }

                    {/* Play / Pause */}
                    { sideVideoPlaying &&
                      <input type='button'
                        className='border w-10 rounded p-0.5 mx-1 text-xs bg-red-700 text-white'
                        value='pause'
                        onClick={() => setSideVideoPlaying(false)}
                      />
                    }
                    { !sideVideoPlaying &&
                      <input type='button'
                        className='border w-10 rounded p-0.5 mx-1 text-xs bg-green-700 text-white'
                        value='play'
                        onClick={() => setSideVideoPlaying(true)}
                      />
                    }
                  </div>

                  <div className="flex flex-col content-center justify-center items-center mt-4">
                    {/* Seek */}
                    <input
                      type='range'
                      value={sideVideoDuration}
                      min={0}
                      max={1}
                      step='0.05'
                      onChange={handleSideSeekChange}
                    />

                    <div className="bg-white rounded p-0.5 mx-1 text-xs">
                      <span> { sideVideoDuration ? sideVideoDuration.toFixed(2) : "0.00" }/1.0</span>
                    </div>
                  </div>

                  <div className="flex flex-col content-center justify-center items-center mt-4">
                    <div className="flex flex-row content-center justify-center p-1 mt-4 bg-gray-100 rounded">
                      <div className="flex flex-row content-center justify-center items-center p-4">
                        <input type='button'
                          className="border w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-md"
                          onClick={() => setSideVideoPlayback(0.25)}
                          value=".25x"
                        />
                        <input type='button'
                          className="border w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-md"
                          onClick={() => setSideVideoPlayback(0.5)}
                          value=".5x"
                        />
                        <input type='button'
                          className="border w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-md"
                          onClick={() => setSideVideoPlayback(1)}
                          value="1x"
                        />
                        <input type='button'
                          className="border w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-md"
                          onClick={() => setSideVideoPlayback(2)}
                          value="2x"
                        />
                        <input type='button'
                          className="border w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-md"
                          onClick={() => setSideVideoPlayback(3)}
                          value="3x"
                        />
                      </div>
                    </div>
                  </div>
                </Fragment>
                }
              </div>
            </Fragment>
          </div>
        </div>

        {/* End Sidebar */}

        {/* Begin Album Videos */}

        <div className="p-4 flex flex-wrap w-4/5">
          { pageVideos.map( (swing, i) => {
            let width
            if (albumView === "video") {
              width = "w-1/3"
            } else if (albumView === "gif") {
              width = "w-1/6"
            } else if (albumView === "jpg") {
              width = "w-1/6"
            }
            return (
              <div className={`flex flex-col relative ${width} content-center justify-center items-center hover:bg-gray-200`}
                onMouseOver={() => setHoveredSwing(swing.id)}
                key={i}
              >
                { (hoveredSwing === swing.id && !deleteSwing) &&
                  <button className="absolute top-1 right-1 underline text-blue-400 cursor-pointer"
                    onClick={() => {
                      setHoveredSwing(undefined)
                      setDeleteSwing(swing.id)
                    }}
                  >
                    Delete
                  </button>
                }
                { deleteSwing === swing.id &&
                  <button className="absolute top-1 right-1 underline text-blue-400 cursor-pointer"
                    onClick={() => {
                      setDeleteSwing(undefined)
                    }}
                  >
                    Cancel?
                  </button>
                }
                { deleteSwing === swing.id &&
                  <button className="absolute top-6 right-1 underline text-blue-400 cursor-pointer"
                    onClick={() => {
                      setDeleteSwing(undefined)
                      onDeleteSwing(swing.id)
                    }}
                  >
                    Confirm?
                  </button>
                }
                
                { albumView === "video" &&
                  renderVideo({
                    swing,
                    i,
                    ref: playerRefs[i],
                    playing: playings[i],
                    pip: pips[i],
                    duration: playerDurations[i]
                  }) 
                }
                { albumView === "gif" &&
                  <div>
                    <img src={swing.gifURL}
                      alt="loading..."
                      style={{height: 113, width: 142}}
                    />
                  </div>
                }
                { albumView === "jpg" &&
                  <div>
                    <img src={swing.jpgURL}
                      alt="loading..."
                      style={{height: 99, width: 126}}
                    />
                  </div>
                }
              </div>
            )
          })}
        </div>
        {/* End Album Videos */}
      </main>

      {/* All Video Controls Footer */}
      <footer className="flex-none bg-blue-100">
        <div className="p-4 w-full flex flex-row content-center justify-center items-center">
          { album &&
            <div className="flex flex-col mr-4">
              <input type="text"
                value={album.name}
                onChange={onUpdateAlbumName}
              />
              <div className="flex flex-row">
                <select
                  className="my-1 mr-1"
                  onChange={e => {
                    setAlbumView(e.target.value)
                    setSwingsPerPage(swingVieMap[e.target.value])
                  }}
                >
                  { ["video", "gif", "jpg"].map((view, i) => {
                    return(
                      <option key={i} value={view}>{ view }</option>
                    )
                  })}
                </select>
                <p>
                  ({ album.swingVideos.length })
                </p>
              </div>
            </div>
          }

          { allPlaying &&
            <input type='button'
              className="border w-10 rounded p-0.5 mx-1 text-xs bg-red-700 text-white"
              onClick={() => {
                setAllPlaying(false)
                setPlayings(Array(videosCount).fill().map(() => false))
              }}
              value="Pause"
            />
          }
          { !allPlaying &&
            <input type='button'
              className="border w-10 rounded p-0.5 mx-1 text-xs bg-green-700 text-white"
              onClick={() => {
                setAllPlaying(true)
                setPlayings(Array(videosCount).fill().map(() => true))
              }}
              value="Play"
            />
          }

          <input
            type='range'
            min={0}
            max={0.999999}
            step='0.1'
            onMouseUp={handleAllSeekChange}
            onKeyDown={handleAllSeekChange}
          />

          <div className="flex flex-row content-center justify-center items-center p-4">
            <input type='button'
              className="border w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-md"
              onClick={() => setPlaybackRate(0.1)}
              value=".1x"
            />
            <input type='button'
              className="border w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-md"
              onClick={() => setPlaybackRate(0.25)}
              value=".25x"
            />
            <input type='button'
              className="border w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-md"
              onClick={() => setPlaybackRate(0.5)}
              value=".5x"
            />
            <input type='button'
              className="border w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-md"
              onClick={() => setPlaybackRate(1)}
              value="1x"
            />
            <input type='button'
              className="border w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-md"
              onClick={() => setPlaybackRate(1.5)}
              value="1.5x"
            />
          </div>

          <div className="flex flex-col">
            <h2>Page { albumPage+1 }</h2>
            <div className="flex flex-row">
              { albumPage > 0 &&
                <button
                  onClick={() => setAlbumPage(albumPage-1)}
                  className="border border-black rounder p-0.5 mx-1"
                >
                  &lt;
                </button>
              }
              { (albumPage < (swingVideos.length / swingsPerPage)-1) &&
                <button
                  onClick={() => setAlbumPage(albumPage+1)}
                  className="border border-black rounder p-0.5 mx-1"
                >
                  &gt;
                </button>
              }
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

const mapStateToProps = (state) => {
  console.log("mapStateToProps", state)
  return {
    recentUploads: state.recentUploads,
    album: state.album,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getAlbums: LoadAlbums(dispatch),
    getRecentUploads: GetRecentUploads(dispatch),
    loadAlbum: LoadAlbum(dispatch),
    updateAlbum: UpdateAlbum(dispatch),
    updateAlbumRedux: updatedAlbum => dispatch(setAlbum(updatedAlbum))
  }
}
  
Album.propTypes = {
  album: PropTypes.object,
  user: PropTypes.object,
  recentUploads: PropTypes.arrayOf(PropTypes.object),

  getAlbums: PropTypes.func,
  getRecentUploads: PropTypes.func,
  loadAlbum: PropTypes.func,
  updateAlbum: PropTypes.func,
  updateAlbumRedux: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(Album)