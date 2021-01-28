import React, { useEffect, useState, createRef, Fragment } from "react"
import { connect } from "react-redux"
import ReactPlayer from "react-player"
import PropTypes from "prop-types"
import { useRouter } from "next/router"
import Moment from "moment"

import Notifications from "../../../../components/Notifications"
import { LoadAlbum, PostComment } from "../../../../behavior/coordinators/albums"
import { SearchFriends } from "../../../../behavior/coordinators/friends"


const SWING_FRAMES = 45
const REPLY_PREVIEW_LEN = 50
let commentsCache = {}
let posting = false

const Album = ({
  album,
  user,
  usersCache,

  loadAlbum,
  postComment,
  searchFriends,
}) => {
  const router = useRouter()
  const albumId = router.query.albumid
  const swingId = router.query.id && router.query.id[0]

  const [playing, setPlaying] = useState(false)
  const [playerRef, setPlayerRef] = useState(undefined)
  const [playerFrame, setPlayerFrame] = useState(0.0)

  const [comments, setComments] = useState([])
  const [commenters, setCommenters] = useState([])
  const [comment, setComment] = useState("")
  const [replyId, setReplyId] = useState(undefined)
  const [replyPreview, setReplyPreview] = useState("")

  const swingVideos = album?.swingVideos || []
  const swing = swingVideos.find( sw => sw.id === swingId )

  useEffect(() => {
    if (albumId && (!album || album.id !== albumId)) {
      loadAlbum(albumId)
    }
  }, [albumId])

  useEffect(() => {
    if (album?.id) {
      setPlayerRef(createRef())
    }
  }, [album?.id])

  useEffect(() => {
    setComments(swing?.comments || [])
  }, [swing])

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

  const handleSeekChange = e => {
    const frame = parseInt(e.target.value)
    if (frame != null) {
      onSeekTo(frame)
    }
  }

  const onSeekTo = frame => {
    if (frame == null) {
      return
    }
    const seekTo = frame === SWING_FRAMES ? 0.9999 : parseFloat((frame/SWING_FRAMES).toFixed(4))
    console.log("seekto", seekTo, frame)
    playerRef.current.seekTo(seekTo)
    setPlayerFrame(frame)
  }

  const onPostComment = async () => {
    if (posting) {
      return
    }
    posting = true
    const params = { albumId, swingId, text: comment, frame: playerFrame }
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
    } else if (sortBy === "FRAME") {
      newComments = comments.sort((a,b) => a.frame - b.frame)
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

  const renderVideo = ({ swing, ref, playing, pip, duration }) => {
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
          playbackRate={1}
          loop={true}
          progressInterval={200}
          onProgress={({ played }) => {
            const frame = Math.round(played*SWING_FRAMES)
            setPlayerFrame(frame)
          }}
          height="452px"
          width="570px"
        />

        {/* Controls Panel */}
        <div className="flex flex-row content-center justify-center p-1 mt-4 bg-gray-100 rounded">
          <input type='button'
            className='border rounded py-0.5 px-1 mx-1 text-xs bg-blue-700 text-white cursor-pointer'
            value='Back To Album'
            onClick={() => router.push(`/albums/${albumId}`)}
          />

          {/* Play / Pause */}
          { playing &&
            <input type='button'
              className='border w-10 rounded p-0.5 mx-1 text-xs bg-red-700 text-white'
              value='pause'
              onClick={() => setPlaying(!playing)}
            />
          }
          { !playing &&
            <input type='button'
              className='border w-10 rounded p-0.5 mx-1 text-xs bg-green-700 text-white'
              value='play'
              onClick={() => setPlaying(!playing)}
            />
          }
          
          {/* Seek */}
          <input
            type='range'
            value={duration}
            min={0}
            max={SWING_FRAMES}
            step='1'
            onChange={handleSeekChange}
            onFocus={ e => {
              e.stopPropagation()
              e.preventDefault()
            }}
          />

          <div className="bg-white rounded p-0.5 mx-1 text-xs w-10">
            <p className="text-center"> { duration ? duration : "0" }/{SWING_FRAMES}</p>
          </div>
        </div>
      </Fragment>
    )
  }


  return (
    <div className="flex flex-col h-screen min-h-screen">
      { (user && user.id) &&
        <Notifications />
      }
      <main className="flex overflow-y-scroll">
        <div className="py-8 px-24 grid grid-cols-2 gap-4 w-full">
          {/* Swing Video Column */}
          <div className="flex flex-col items-center p-4">
            {
              renderVideo({
                swing,
                ref: playerRef,
                playing: playing,
                duration: playerFrame,
              }) 
            }
          </div>

          {/* Comments Column */}
          <div className="py-4 px-16">
            <div className="flex flex-col p-4 items-center overscroll-contain border border-black rounded shadow-md">
              <div className="flex flex-col w-full">
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
                    <p className="p-2 text-sm align-middle font-medium">
                      frame {playerFrame}
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

                <div className="flex flex-row my-2">
                  <select className="rounded py-0.5 px-1 mx-2 border border-black bg-blue-600 text-white text-xs"
                    onChange={onSortComments}
                  >
                    <option value="POSTED ASC">Sort by First Posted</option>
                    <option value="POSTED DESC">Sort by Last Posted</option>
                    <option value="FRAME">Sort by Frame</option>
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
                              <p className="mx-2 text-sm align-middle font-bold">
                                |
                              </p>
                              <p className="text-xs align-middle font-medium">
                                frame {commentsCache[comment.replyId]?.frame}
                              </p>
                            </div>
                          </div>
                        }
                        <div className="flex flex-col pt-1 my-0.5"
                          onClick={() => onSeekTo(comment.frame)}
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
                            <p className="text-xs align-middle font-medium">
                            frame {comment.frame || 0}
                            </p>
                            <p className="mx-2 text-sm align-middle font-bold">
                            |
                            </p>
                            <input type='button'
                              className='border w-12 rounded py-0.5 px-2 m-2 text-xs bg-green-700 text-white text-center'
                              value='reply'
                              onClick={() => {
                                setReplyId(comment.id)
                                setPlayerFrame(comment.frame)
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
      </main>
    </div>
  )
}

const mapStateToProps = (state) => {
  console.log("mapStateToProps", state)
  return {
    album: state.album,
    user: state.user,
    usersCache: state.usersCache,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    loadAlbum: LoadAlbum(dispatch),
    postComment: PostComment(dispatch),
    searchFriends: SearchFriends(dispatch),
  }
}
  
Album.propTypes = {
  album: PropTypes.object,
  user: PropTypes.object,
  usersCache: PropTypes.object,

  loadAlbum: PropTypes.func,
  postComment: PropTypes.func,
  searchFriends: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(Album)