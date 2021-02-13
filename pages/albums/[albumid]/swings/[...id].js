import React, { useEffect, useState, createRef } from "react"
import Head from "next/head"
import { connect } from "react-redux"
import ReactPlayer from "react-player"
import PropTypes from "prop-types"
import { useRouter } from "next/router"
import Moment from "moment"

import { newNotification, showInviteForm } from "../../../../state/ui/action"
import Notifications from "../../../../components/Notifications"
import ProComparison from "../../../../components/ProComparison"
import VideoResources from "../../../../components/VideoResources"
import Sidebar from "../../../../components/Sidebar"
import { getUserIcon, getUserType } from "../../../../behavior/users"
import { LoadAlbum, PostComment, FlagComment, UpdateSwing } from "../../../../behavior/coordinators/albums"
import { SearchFriends } from "../../../../behavior/coordinators/friends"
import speechBubble from "../../../../public/speech-bubble.svg"
import flag from "../../../../public/flag.svg"
import pencil from "../../../../public/pencil.svg"
import { FaPlayCircle, FaRegPauseCircle } from "react-icons/fa"
import { IconContext } from "react-icons"

const SWING_FRAMES = 60
const REPLY_PREVIEW_LEN = 50
let commentsCache = {}
let posting = false
let timer

const executeAfterTimeout = (func, timeout) => {
  if ( timer ) {
    clearTimeout( timer )
  }
  timer = undefined
  timer = setTimeout(() => {
    func()
  }, timeout )
}

const Album = ({
  album,
  confirmation,
  user,
  usersCache,

  flagComment,
  loadAlbum,
  onShowInviteForm,
  postComment,
  searchFriends,
  toggleFlashMessage,
  updateSwing,
}) => {
  const router = useRouter()
  const albumId = router.query.albumid
  const swingId = router.query.id && router.query.id[0]
  const swingVideos = album?.swingVideos || []
  const swing = swingVideos.find( sw => sw.id === swingId )

  const [name, setName] = useState(swing?.name)
  const [showProUsage, setShowProUsage] = useState(false)
  const [showVideoUsage, setShowVideoUsage] = useState(false)
  const [showSwingUsage, setShowSwingUsage] = useState(false)

  const [playing, setPlaying] = useState(false)
  const [playerRef, setPlayerRef] = useState(undefined)
  const [playerFrame, setPlayerFrame] = useState(0.0)
  const [playback, setPlayback] = useState(1)

  const [comments, setComments] = useState([])
  const [commenters, setCommenters] = useState([])
  const [comment, setComment] = useState("")
  const [replyId, setReplyId] = useState(undefined)
  const [replyPreview, setReplyPreview] = useState("")

  const [activeSideBar, setActiveSidebar] = useState(undefined)
  const [expandedSideBar, setExpandedSideBar] = useState(false)


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
    if (swing) {
      setComments(swing.comments || [])
      setName(swing.name)
    }
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
    playerRef.current.seekTo(seekTo)
    setPlayerFrame(frame)
  }

  const onUpdateSwingName = e => {
    setName(e.target.value)
    executeAfterTimeout(() => {
      updateSwing({ ...swing, albumId: album.id, name: e.target.value })
    }, 700)
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

  const onFlagComment = comment => () => {
    toggleFlashMessage({
      id: comment.id,
      message: `Flag Comment: "${comment.text}" as inappropriate?`,
      buttons: [
        {
          buttonText: "Confirm",
          callback: async () => {
            const success = await flagComment({
              commentCreatedAt: comment.createdAt,
              commentId: comment.id,
              commenterId: comment.userId,
              albumId: album.id,
              swingId,
              text: comment.text,
            })
            if (success) {
              toggleFlashMessage({
                id: Moment().toString(),
                message: "Comment Flagged!"
              })
            }
          },
        }
      ]
    })
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
      <div className="flex flex-col">
        <Head>
          <script async
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
          
            gtag('config', ${process.env.NEXT_PUBLIC_GTM_ID});
        `,}}>
          </script>
        </Head>
        <div className="flex-shrink-0">
          <ReactPlayer
            className="rounded-md overflow-hidden"
            ref={ref}
            url={swing.videoURL} 
            playing={playing}
            pip={pip}
            volume={0}
            muted={true}
            playbackRate={playback}
            loop={true}
            progressInterval={200}
            onProgress={({ played }) => {
              const frame = Math.round(played*SWING_FRAMES)
              setPlayerFrame(frame)
            }}
            config={{
              file: {
                attributes: {
                  controlsList: "nofullscreen",
                  playsInline: true,
                }
              }
            }}
            height=""
            width=""
          />
        </div>

        {/* Controls Panel */}
        <div className="flex flex-col p-1 mt-4 bg-gray-100 rounded shadow-lg">
          <div className="flex flex-row content-center justify-center items-center mt-1 text-xs">
            <div className="font-semibold mr-1">Rally { swing.rally }</div> | 
            <div className="flex flex-row bg-white rounded p-0.5 mx-1 text-xs relative">
                @<div className="w-8 text-center">{ `${parseInt(swing.timestampSecs/60)}:${parseInt(swing.timestampSecs%60).toString().padStart(2,"0")}` }</div>
            </div>
          </div>

          <div className="flex flex-row content-center justify-center items-center mt-1">
            <div>
              {/* Play / Pause */}
              { playing &&
                <IconContext.Provider value={{ color: "red" }}>
                  <div className="m-2 content-center justify-center items-center cursor-pointer">
                    <FaRegPauseCircle onClick={() => setPlaying(false)}/>
                  </div>
                </IconContext.Provider>
              }
              { !playing &&
                <IconContext.Provider value={{ color: "blue" }}>
                  <div className="m-2 content-center justify-center items-center cursor-pointer">
                    <FaPlayCircle onClick={() => setPlaying(true)}/>
                  </div>
                </IconContext.Provider>
              }
            </div>

            <div className="flex flex-col ml-2 relative">
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

              { showSwingUsage &&
                <div className="absolute mb-2 -ml-3 w-80 bg-yellow-300 text-black text-xs font-semibold tracking-wide rounded shadow py-1.5 px-4 bottom-full">
                  <p>Drag or click once and use &lt;- and -&gt; keys to nav frame by frame</p>
                  <svg className="absolute text-yellow-300 h-2 left-0 ml-3 top-full" x="0px" y="0px" viewBox="0 0 600 400" xmlSpace="preserve"><polygon className="fill-current" points="0,0 300,400 600,0"/></svg>
                </div>
              }

            </div>

            <div className="bg-white rounded p-0.5 mx-1 text-xs w-10 relative">
              <p className="text-center"> { duration ? duration : "0" }/{SWING_FRAMES}</p>
              { showSwingUsage &&
                <div className="absolute -mb-14 ml-4 w-48 bg-yellow-300 text-black text-xs font-semibold tracking-wide rounded shadow py-1.5 px-4 bottom-full z-100">
                  <svg className="absolute text-yellow-300 h-2 left-0 ml-3 bottom-full" x="0px" y="0px" viewBox="0 0 600 400" xmlSpace="preserve"><polygon className="fill-current" points="0,400 300,0 600,400"/></svg>
                  Frame # / Total Frames
                </div>
              }
            </div>
          </div>

          <div className="flex flex-row content-center justify-center items-center px-4 py-2 bg-gray-100 rounded relative">
            <input type='button'
              className="w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-lg cursor-pointer"
              onClick={() => setPlayback(0.25)}
              value=".25x"
            />
            <input type='button'
              className="w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-lg cursor-pointer"
              onClick={() => setPlayback(0.5)}
              value=".5x"
            />
            { showSwingUsage &&
                <div className="absolute -mb-20 ml-16 w-48 bg-yellow-300 text-black text-xs font-semibold tracking-wide rounded shadow py-1.5 px-4 bottom-full z-100">
                  <svg className="absolute text-yellow-300 h-2 left-0 ml-3 bottom-full" x="0px" y="0px" viewBox="0 0 600 400" xmlSpace="preserve"><polygon className="fill-current" points="0,400 300,0 600,400"/></svg>
                  Change playback rate
                </div>
            }
            <input type='button'
              className="w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-lg cursor-pointer"
              onClick={() => setPlayback(1)}
              value="1x"
            />
            <input type='button'
              className="w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-lg cursor-pointer"
              onClick={() => setPlayback(2)}
              value="2x"
            />
            <input type='button'
              className="w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-lg cursor-pointer"
              onClick={() => setPlayback(3)}
              value="3x"
            />
          </div>
        </div>
      </div>
    )
  }

  const mainWidth = expandedSideBar ? "w-1/2" : "w-3/4"
  const swingColSpan = expandedSideBar ? "col-span-5" : "col-span-3"
  let commentsPlaceholder = "Comment on specific frame"
  if (!user) {
    commentsPlaceholder = "Create account to comment"
  } else if (user.disableComments) {
    commentsPlaceholder = "Your commenting has been disabled. Please contact an administrator."
  } else if (replyId) {
    commentsPlaceholder = "Reply to comment"
  }

  return (
    <div>
      <Head>
        <script async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
          
            gtag('config', ${process.env.NEXT_PUBLIC_GTM_ID});
        `,}}>
        </script>
      </Head>

      { (user && user.id) &&
        <Notifications />
      }
      <main className="overflow-y-scroll bg-gray-200 min-h-screen">
        <div className="lg:flex lg:flex-row min-h-screen">
          {/* Begin Sidebar */}
          <Sidebar width={ expandedSideBar ? "50vw" : "25vw" }>
            <div className="flex flex-col content-center justify-center items-center text-sm sticky top-0">
              {/* Pro Comparison Sidebar */}
              <div className="mb-2">
                <div className="flex flex-row content-center justify-center items-center mb-2">
                  <h2 className="text-gray-300 uppercase cursor-pointer text-center"
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
                  <input type="button"
                    className="text-xs rounded-full bg-black text-white hover:bg-white hover:text-black h-4 w-4 border border-white ml-2 cursor-pointer hidden lg:block"
                    value="?"
                    onClick={() => {
                      setShowProUsage(activeSideBar !== "Pro Comparison" ? true : !showProUsage)
                      setActiveSidebar("Pro Comparison")
                    }}
                  />
                </div>
                { activeSideBar === "Pro Comparison" &&
                <ProComparison showUsage={showProUsage} />
                }
              </div>

              {/* Video Resources Sidebar */}
              <div className="mb-2">
                <div className="flex flex-row content-center justify-center items-center mb-2">
                  <h2 className="text-gray-300 uppercase cursor-pointer text-center"
                    onClick={() => {
                      if (activeSideBar === "Video Resources") {
                        setActiveSidebar(undefined)
                      } else {
                        setActiveSidebar("Video Resources")
                      }
                    }}
                  >
                    Youtube Tutorials
                  </h2>
                  <input type="button"
                    className="text-xs rounded-full bg-black text-white hover:bg-white hover:text-black h-4 w-4 border border-white ml-2 cursor-pointer hidden lg:block"
                    value="?"
                    onClick={() => {
                      setShowVideoUsage(activeSideBar !== "Video Resources" ? true : !showVideoUsage)
                      setActiveSidebar("Video Resources")
                    }}
                  />
                </div>
                { activeSideBar === "Video Resources" &&
                <VideoResources
                  onExpand={playing => setExpandedSideBar(playing)}
                  showUsage={showVideoUsage}
                />
                }
              </div>
            </div>
          </Sidebar>

          <div className={`lg:flex p-2 lg:p-8 lg:${mainWidth}`}>
            {/* Swing Video Column */}
            <div className={`${swingColSpan} lg:flex flex-col items-center py-4 px-8 rounded bg-white shadow-lg relative`}>
              <a href={`/albums/${album?.id}`}
                className="text-xs text-blue-500 underline cursor-pointer absolute left-3 top-2 hidden lg:block"
              >
              back to album
              </a>

              <div className="mb-2 flex content-center justify-center items-center">
                <div className="flex flex-row content-center justify-center items-center relative">
                  <input type="button"
                    className="text-xs mr-2 rounded-full bg-black text-white hover:bg-white hover:text-black h-4 w-4 border border-white ml-2 cursor-pointer hidden lg:block"
                    value="?"
                    onClick={() => setShowSwingUsage(!showSwingUsage)}
                  />
                  <input type="text"
                    className="text-lg text-center underline hover:bg-blue-100 p-1 rounded-lg border-2 border-gray-200"
                    value={name}
                    onChange={onUpdateSwingName}
                    disabled={!user || user.id !== album?.userId}
                  />
                  { (user && user.id === album?.userId) &&
                  <img src={pencil} className="w-4 h-4 absolute right-2"/>
                  }
                </div>
              </div>
          
              <div className="mt-4">
                {
                  renderVideo({
                    swing,
                    ref: playerRef,
                    playing: playing,
                    duration: playerFrame,
                  }) 
                }
              </div>
            </div>

            {/* Comments Column */}
            { !expandedSideBar &&
            <div className="lg:flex flex-col lg:ml-8 lg:mt-0 mt-2 items-center py-4 px-8 overscroll-contain rounded  bg-white shadow-lg">
              <div className="flex flex-col w-full">

                <div className="flex flex-col border-b-2 border-gray-400 mb-2 relative">
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
                    className="p-2 rounded shadow-lg bg-gray-100"
                    placeholder={commentsPlaceholder}
                    rows="4"
                    maxLength={500}
                    value={comment}
                    onClick={() => {
                      if (confirmation) onShowInviteForm()
                    }}
                    onChange={e => {
                      if (user && !user.disableComments) setComment(e.target.value)
                    }}
                  />
                  { showSwingUsage &&
                    <div className="absolute -mb-28 bg-yellow-300 text-black text-xs font-semibold tracking-wide rounded shadow py-1.5 px-4 bottom-full z-100">
                      Use seek bar to select frame # to comment on
                      <svg className="absolute text-yellow-300 h-2 right-0 mr-3 top-full" x="0px" y="0px" viewBox="0 0 600 400" xmlSpace="preserve"><polygon className="fill-current" points="0,0 300,400 600,0"/></svg>
                    </div>
                  }
                  <div className="flex flex-row p-2 content-center justify-center items-center">
                    <p className="mx-2 text-sm text-gray-500 align-middle">
                      { Moment().format("MMM D YYYY H:m a") }
                    </p>
                    <p className="mx-2 text-sm align-middle font-bold">
                      |
                    </p>
                    <p className="text-sm text-gray-500 align-middle">
                        chars {comment.length}
                    </p>
                    <p className="mx-2 text-sm align-middle font-bold">
                      |
                    </p>
                    <p className="text-sm align-middle font-medium underline">
                        frame {playerFrame}
                    </p>
                    <p className="mx-2 text-sm align-middle font-bold">
                      |
                    </p>
                    
                    <input type='button'
                      className='border w-12 rounded py-0.5 px-2 text-xs bg-green-700 text-white text-center cursor-pointer'
                      value='post'
                      onClick={onPostComment}
                      disabled={!user || user.disableComments}
                    />
                  </div>
                </div>

                <div className="flex flex-row my-2 content-center justify-center items-center">
                  <div className="flex flex-row bg-white rounded p-0.5 mx-1 text-xs w-8">
                    <p className="mr-1 text-center">{(comments?.length || 0)}</p>
                    <img src={speechBubble} className="w-5 h-5"/>
                  </div>

                  <select className="rounded py-0.5 px-1 mx-2 border border-black bg-blue-600 text-white text-xs"
                    onChange={onSortComments}
                  >
                    <option value="POSTED ASC">Sort by First Posted</option>
                    <option value="POSTED DESC">Sort by Last Posted</option>
                    <option value="FRAME">Sort by Frame</option>
                  </select>

                  <select className="rounded py-0.5 px-1 mx-2 border border-black bg-blue-600 text-white text-xs"
                    onChange={onFilterComments}
                  >
                    <option value="ALL">Filter All Users</option>
                    { commenters.map( usrId => {
                      return(
                        <option key={usrId} value={usrId}>{ usersCache[usrId]?.userName || "..." }</option>
                      )
                    })}
                  </select>
                </div>

                {/* Comments List  */}

                <div className="flex flex-col h-96 overflow-y-scroll rounded shadow-lg bg-gray-100 px-1">
                  { comments.filter( com => !com.isHidden ).length === 0 &&
                    <p className="text-center p-2"> No comments </p>
                  }
                  { comments.filter( com => !com.isHidden ).map( comment => {
                    return(
                      <div key={comment.id}
                        className="my-2 p-0.5 rounded shadow-lg bg-white hover:bg-blue-100 cursor-pointer"
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
                          <div className="flex flex-row content-center justify-center items-center">
                            <img src={getUserIcon(usersCache[comment.userId])}
                              className="w-5 h-5 ml-1 cursor-pointer"
                            />
                            <p className="mx-1 text-xs text-blue-500 align-middle">
                              @{ usersCache[comment.userId]?.userName || "..." }
                            </p>
                            <p className="mx-1 text-sm align-middle font-bold">
                            |
                            </p>
                            <p className="mx-1 text-xs text-gray-500 align-middle">
                              { Moment(comment.createdAt).format("MMM D YYYY H:m a") }
                            </p>
                            <p className="mx-1 text-sm align-middle font-bold">
                            |
                            </p>
                            <p className="text-xs align-middle font-medium">
                            frame {comment.frame || 0}
                            </p>
                            <p className="mx-1 text-sm align-middle font-bold">
                            |
                            </p>

                            { (user && !user.disableComments) &&
                              <input type='button'
                                className='border w-11 rounded py-0.5 px-2 mx-2 text-xs bg-green-700 text-white text-center'
                                value='reply'
                                onClick={() => {
                                  setReplyId(comment.id)
                                  setPlayerFrame(comment.frame)
                                  setReplyPreview(comment.text.substring(0, REPLY_PREVIEW_LEN))
                                }}
                              />
                            }
                            
                            { user &&
                              <div className="ml-2 mr-1 p-0.5 rounded-xl bg-white hover:bg-blue-300">
                                <img src={flag}
                                  className="w-4 h-4 cursor-pointer"
                                  onClick={onFlagComment(comment)}
                                />
                              </div>
                            }
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            }
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
    confirmation: state.confirmation,
    user: state.user,
    usersCache: state.usersCache,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    flagComment: FlagComment(dispatch),
    loadAlbum: LoadAlbum(dispatch),
    onShowInviteForm: () => dispatch(showInviteForm()),
    postComment: PostComment(dispatch),
    searchFriends: SearchFriends(dispatch),
    toggleFlashMessage: args => dispatch(newNotification(args)),
    updateSwing: UpdateSwing(dispatch),
  }
}
  
Album.propTypes = {
  album: PropTypes.object,
  confirmation: PropTypes.object,
  user: PropTypes.object,
  usersCache: PropTypes.object,

  flagComment: PropTypes.func,
  loadAlbum: PropTypes.func,
  onShowInviteForm: PropTypes.func,
  postComment: PropTypes.func,
  searchFriends: PropTypes.func,
  toggleFlashMessage: PropTypes.func,
  updateSwing: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(Album)