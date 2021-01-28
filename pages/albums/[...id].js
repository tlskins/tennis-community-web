import React, { useEffect, useState, createRef, useRef, Fragment } from "react"
import { connect } from "react-redux"
import ReactPlayer from "react-player"
import PropTypes from "prop-types"
import { useRouter } from "next/router"
import Moment from "moment"

import Notifications from "../../components/Notifications"
import Sharing from "../../components/Sharing"
import { GetRecentUploads } from "../../behavior/coordinators/uploads"
import {
  LoadAlbums,
  LoadAlbum,
  UpdateAlbum,
  PostComment,
} from "../../behavior/coordinators/albums"
import { SearchFriends } from "../..//behavior/coordinators/friends"
import { setAlbum } from "../../state/album/action"
import speechBubble from "../../public/speech-bubble.svg"

const SWING_FRAMES = 45
const REPLY_PREVIEW_LEN = 50
let commentsCache = {}
let posting = false

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

const swingViewMap = {
  "video": 9,
  "gif": 24,
  "jpg": 24,
}

let timer

const Album = ({
  album,
  recentUploads,
  user,
  usersCache,

  getRecentUploads,
  loadAlbum,
  postComment,
  searchFriends,
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
  const [playerFrames, setPlayerFrames] = useState({})
  const [playings, setPlayings] = useState([])
  const [pips, setPips] = useState([])

  const [activeSideBar, setActiveSidebar] = useState("Album Comments")

  const [albumPage, setAlbumPage] = useState(0)
  const [hoveredSwing, setHoveredSwing] = useState(undefined)
  const [deleteSwing, setDeleteSwing] = useState(undefined)

  const sideVideoRef = useRef(undefined)
  const [sideVideo, setSideVideo] = useState(publicVideos[0].url)
  const [sideVideoDuration, setSideVideoDuration] = useState(0)
  const [sideVideoPlayback, setSideVideoPlayback] = useState(1)
  const [sideVideoPlaying, setSideVideoPlaying] = useState(false)
  const [sideVideoPip, setSideVideoPip] = useState(false)

  const [isPublic, setIsPublic] = useState(false)
  const [isViewableByFriends, setIsViewableByFriends] = useState(false)
  const [friendIds, setFriendIds] = useState([])

  const [comments, setComments] = useState([])
  const [commenters, setCommenters] = useState([])
  const [comment, setComment] = useState("")
  const [replyId, setReplyId] = useState(undefined)
  const [replyPreview, setReplyPreview] = useState("")

  const pageVideos = swingVideos.slice(albumPage * swingsPerPage, (albumPage+1) * swingsPerPage)

  useEffect(() => {
    if (albumId) {
      loadAlbum(albumId)
    }
  }, [albumId])

  useEffect(() => {
    setComments(album?.comments || [])
    setIsPublic(album?.isPublic || false)
    setIsViewableByFriends(album?.isViewableByFriends || false)
    setFriendIds(album?.friendIds || [])
  }, [album])

  useEffect(() => {
    if (comments.length > 0) {
      const commentersSet = new Set([])
      // search comment users
      const usersSet = new Set([])
      comments.forEach( com => {
        if (!usersCache[com.userId]) {
          usersSet.add(com.userId)
        }

        // build commenters
        commentersSet.add(com.userId)

        // build comments cache
        commentsCache[com.id] = com
      })
      const ids = Array.from(usersSet)
      if (ids.length > 0) {
        searchFriends({ ids })
      }
      setCommenters(Array.from(commentersSet))
    }
  }, [comments])

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

  const onPostComment = async () => {
    if (posting) {
      return
    }
    posting = true
    const params = { albumId, text: comment }
    if (replyId) {
      params.replyId = replyId
    }
    if (await postComment(params)) {
      setReplyId(undefined)
      setReplyPreview("")
      setComment("")
    }
    posting = false
  }

  const onSortComments = e => {
    const sortBy = e.target.value
    let newComments = []
    if (sortBy === "POSTED ASC") {
      newComments = comments.sort((a,b) => Moment(a.createdAt).isAfter(Moment(b.createdAt)) ? 1 : -1)
    } else if (sortBy === "POSTED DESC") {
      newComments = comments.sort((a,b) => Moment(a.createdAt).isBefore(Moment(b.createdAt)) ? 1 : -1)
    }
    setComments([...newComments])
  }

  const onFilterComments = e => {
    const filterBy = e.target.value
    let newComments = []
    if (filterBy === "ALL") {
      newComments = comments.map( com => {
        com.isHidden = false
        return com
      })
    } else {
      newComments = comments.map( com => {
        com.isHidden = com.userId !== filterBy
        return com
      })
    }
    setComments([...newComments])
  }

  const onShareAlbum = () => {
    updateAlbum(
      {
        id: album.id,
        name: album.name,
        isPublic,
        isViewableByFriends,
        friendIds
      },
      true,
    )
  }

  const renderVideo = ({ swing, i, ref, playing, pip, duration }) => {
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
          playbackRate={playbackRate}
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
              e.stopPropagation()
              e.preventDefault()
            }}
          />

          <div className="bg-white rounded p-0.5 mx-1 text-xs w-10">
            <p className="text-center"> { duration ? duration : "0" }/{SWING_FRAMES}</p>
          </div>

          <div className="flex flex-row bg-white rounded p-0.5 mx-1 text-xs w-8">
            <p className="mr-1 text-center">{(swing.comments?.length || 0)}</p>
            <img src={speechBubble} className="w-5 h-5"/>
          </div>

          <input type='button'
            className='border rounded py-0.5 px-1 mx-1 text-xs font-bold bg-indigo-700 text-white cursor-pointer'
            value='view'
            onClick={() => router.push(`/albums/${albumId}/swings/${swing.id}`)}
          />
        </div>
      </Fragment>
    )
  }


  return (
    <div className="flex flex-col h-screen min-h-screen">
      { (user && user.id) &&
        <Notifications />
      }

      <main className="flex overflow-y-scroll bg-gray-100">

        {/* Begin Sidebar */}

        <div className="h-screen top-0 sticky p-4 bg-white w-1/4 overflow-y-scroll border-r border-gray-400">
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
                <div className="flex flex-col content-center justify-center items-center">
                  <select className="my-4"
                    onChange={e => setSideVideo(e.target.value)}
                  >
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
                </div>
                }
              </div>
            </Fragment>

            {/* Sharing Sidebar */}
            <Fragment>
              <h2 className="text-blue-400 underline cursor-pointer"
                onClick={() => {
                  if (activeSideBar === "Sharing") {
                    setActiveSidebar(undefined)
                  } else {
                    setActiveSidebar("Sharing")
                  }
                }}
              >
                Sharing
              </h2>
              <div className="mb-2">
                { activeSideBar === "Sharing" &&
                  <div className="flex flex-col content-center justify-center items-center">
                    <Sharing
                      isPublic={isPublic}
                      setIsPublic={setIsPublic}
                      isViewableByFriends={isViewableByFriends}
                      setIsViewableByFriends={setIsViewableByFriends}
                      friendIds={friendIds}
                      setFriendIds={setFriendIds}
                    />
                    <input type='button'
                      className="border w-14 rounded py-0.5 px-2 my-2 text-xs font-semibold bg-blue-700 text-white"
                      onClick={onShareAlbum}
                      value="Share"
                    />
                  </div>
                }
              </div>
            </Fragment>

            {/* Comments Sidebar */}
            <Fragment>
              <h2 className="text-blue-400 underline cursor-pointer"
                onClick={() => {
                  if (activeSideBar === "Album Comments") {
                    setActiveSidebar(undefined)
                  } else {
                    setActiveSidebar("Album Comments")
                  }
                }}
              >
                Album Comments
              </h2>
              <div className="mb-2">
                { activeSideBar === "Album Comments" &&
                  <div className="flex flex-col content-center justify-center items-center">
                    <div className="p-4">
                      <div className="flex flex-col p-4 items-center overscroll-contain">
                        <div className="flex flex-col w-full">

                          {/* Comment Form */}
                          <div className="flex flex-col border-b-2 border-gray-400 mb-2">
                            { replyId &&
                              <div className="p-2 my-1 border border-black rounded text-xs bg-gray-300 hover:bg-red-100 cursor-pointer"
                                onClick={() => {
                                  setReplyPreview("")
                                  setReplyId(undefined)
                                }}
                              >
                                <p>reply to</p>
                                <p className="pl-2 text-gray-700">{ replyPreview }</p>
                              </div>
                            }
                            <textarea
                              className="p-2 border border-black rounded"
                              autoFocus={true}
                              placeholder={ replyId ? "Reply to comment" : "Comment"}
                              rows="4"
                              onChange={e => setComment(e.target.value)}
                              value={comment}
                            />
                            <div className="flex flex-row">
                              <p className="mx-2 p-2 text-sm text-gray-500 align-middle">
                                { Moment().format("MMM D YYYY H:m a") }
                              </p>
                              <p className="mx-2 p-2 text-sm align-middle font-bold">
                              |
                              </p>
                              <input type='button'
                                className='border w-12 rounded py-0.5 px-2 m-2 text-xs bg-green-700 text-white text-center'
                                value='post'
                                onClick={onPostComment}
                              />
                            </div>
                          </div>

                          {/* Comments Filters / Sort */}
                          <div className="flex flex-row my-2">
                            <select className="rounded py-0.5 px-1 mx-2 border border-black bg-blue-600 text-white text-xs"
                              onChange={onSortComments}
                            >
                              <option value="POSTED ASC">Sort by First Posted</option>
                              <option value="POSTED DESC">Sort by Last Posted</option>
                            </select>

                            <select className="rounded py-0.5 px-1 ml-12 border border-black bg-blue-600 text-white text-xs"
                              onChange={onFilterComments}
                            >
                              <option value="ALL">All Users</option>
                              { commenters.map( usrId => {
                                return(
                                  <option key={usrId} value={usrId}>{ usersCache[usrId]?.userName || "..." }</option>
                                )
                              })}
                            </select>
                          </div>

                          {/* Comments List  */}

                          <div className="flex flex-col h-80 overflow-y-scroll">
                            { comments.filter( com => !com.isHidden ).map( comment => {
                              return(
                                <div key={comment.id}
                                  className="my-2 p-0.5 border border-gray-400 rounded shadow-md ring-gray-300 hover:bg-blue-100 cursor-pointer"
                                >
                                  { comment.replyId &&
                                    <div className="p-2 border border-black rounded text-xs bg-gray-300">
                                      <p>reply to</p>
                                      <p className="pl-2 text-gray-700">
                                        { commentsCache[comment.replyId]?.text?.substring(0, REPLY_PREVIEW_LEN) }
                                      </p>
                                      <div className="flex flex-row items-center">
                                        <p className="mx-2 text-xs text-blue-500 align-middle">
                                          @{ usersCache[commentsCache[comment.replyId]?.userId]?.userName || "..." }
                                        </p>
                                        <p className="mx-2 text-sm align-middle font-bold">
                                          |
                                        </p>
                                        <p className="mx-2 text-xs text-gray-500 align-middle">
                                          { Moment(commentsCache[comment.replyId]?.createdAt).format("MMM D YYYY H:m a") }
                                        </p>
                                      </div>
                                    </div>
                                  }
                                  <div className="flex flex-col pt-1 my-0.5"
                                  >
                                    <p className="p-1">
                                      { comment.text }
                                    </p>
                                    <div className="flex flex-row items-center">
                                      <p className="mx-2 text-xs text-blue-500 align-middle">
                                        @{ usersCache[comment.userId]?.userName || "..." }
                                      </p>
                                      <p className="mx-2 text-sm align-middle font-bold">
                                        |
                                      </p>
                                      <p className="mx-2 text-xs text-gray-500 align-middle">
                                        { Moment(comment.createdAt).format("MMM D YYYY H:m a") }
                                      </p>
                                      <p className="mx-2 text-sm align-middle font-bold">
                                        |
                                      </p>
                                      <input type='button'
                                        className='border w-12 rounded py-0.5 px-2 m-2 text-xs bg-green-700 text-white text-center'
                                        value='reply'
                                        onClick={() => {
                                          setReplyId(comment.id)
                                          setReplyPreview(comment.text.substring(0, REPLY_PREVIEW_LEN))
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                }
              </div>
            </Fragment>
          </div>
        </div>

        {/* End Sidebar */}

        {/* Begin Album Videos */}

        <div className="p-4 flex flex-col w-3/4">
          {/* <h2 className="m-4 text-xl underline text-center">
            { album?.name }
          </h2> */}

          <div className="mb-2 flex content-center justify-center items-center">
            <input type="text"
              className="text-lg text-center underline hover:bg-blue-100 p-1 rounded-lg border border-gray-200"
              value={album?.name}
              onChange={onUpdateAlbumName}
            />
          </div>

          <div className="flex flex-wrap rounded bg-white px-2 py-4 shadow-md mb-2">
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
                <div className={`flex flex-col relative ${width} items-center hover:bg-green-200 rounded-md p-2`}
                  onMouseOver={() => setHoveredSwing(swing.id)}
                  onMouseLeave={() => {
                    setHoveredSwing(undefined)
                    setDeleteSwing(undefined)
                  }}
                  key={i}
                >
                  { (hoveredSwing === swing.id && !deleteSwing) &&
                    <button className="absolute top-2 right-4 underline text-sm text-blue-400 cursor-pointer"
                      onClick={() => {
                        setHoveredSwing(undefined)
                        setDeleteSwing(swing.id)
                      }}
                    >
                      Delete
                    </button>
                  }
                  { deleteSwing === swing.id &&
                    <button className="absolute top-2 right-4 underline text-sm text-blue-400 cursor-pointer"
                      onClick={() => {
                        setDeleteSwing(undefined)
                      }}
                    >
                      Cancel?
                    </button>
                  }
                  { deleteSwing === swing.id &&
                    <button className="absolute top-6 right-4 underline text-sm text-blue-400 cursor-pointer"
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
                      duration: playerFrames[i]
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
        </div>
        {/* End Album Videos */}
      </main>

      {/* All Video Controls Footer */}
      <footer className="absolute bottom-0 sticky w-full bg-gray-200 border-t border-gray-400 mb-0">
        <div className="p-4 w-full flex flex-row content-center justify-center items-center">
          { album &&
            <div className="flex flex-col mr-8">
              <div className="flex flex-col">
                <p className="text-sm underline font-semibold">
                  Analysis Format
                </p>
                <div className="flex flex-row">
                  <select
                    className="my-1 mr-1 rounded border border-gray-500"
                    onChange={e => {
                      setAlbumView(e.target.value)
                      setSwingsPerPage(swingViewMap[e.target.value])
                    }}
                  >
                    { Object.entries(swingViewMap).map(([type, count], i) => {
                      return(
                        <option key={i} value={type}>{ type } ({count})</option>
                      )
                    })}
                  </select>
                  <p>
                    ({ album.swingVideos.length })
                  </p>
                </div>
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
            <h2 className="underline text-blue-500">
              Page { albumPage+1 }
            </h2>
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
    user: state.user,
    usersCache: state.usersCache,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getAlbums: LoadAlbums(dispatch),
    getRecentUploads: GetRecentUploads(dispatch),
    loadAlbum: LoadAlbum(dispatch),
    postComment: PostComment(dispatch),
    searchFriends: SearchFriends(dispatch),
    updateAlbum: UpdateAlbum(dispatch),
    updateAlbumRedux: updatedAlbum => dispatch(setAlbum(updatedAlbum))
  }
}
  
Album.propTypes = {
  album: PropTypes.object,
  user: PropTypes.object,
  usersCache: PropTypes.object,
  recentUploads: PropTypes.arrayOf(PropTypes.object),

  getAlbums: PropTypes.func,
  getRecentUploads: PropTypes.func,
  loadAlbum: PropTypes.func,
  postComment: PropTypes.func,
  searchFriends: PropTypes.func,
  updateAlbum: PropTypes.func,
  updateAlbumRedux: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(Album)