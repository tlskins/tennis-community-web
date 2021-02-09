import React, { useEffect, useState, createRef } from "react"
import Head from "next/head"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import { useRouter } from "next/router"
import Moment from "moment"
import { FaPlayCircle, FaRegPauseCircle } from "react-icons/fa"
import { IconContext } from "react-icons"

import { newNotification, showInviteForm } from "../../state/ui/action"
import Notifications from "../../components/Notifications"
import Sharing from "../../components/Sharing"
import SwingPlayer from "../../components/SwingPlayer"
import VideoResources from "../../components/VideoResources"
import ProComparison from "../../components/ProComparison"
import { getUserIcon } from "../../behavior/users"
import { GetRecentUploads } from "../../behavior/coordinators/uploads"
import {
  LoadAlbum,
  UpdateAlbum,
  PostComment,
  FlagComment,
} from "../../behavior/coordinators/albums"
import { SearchFriends } from "../..//behavior/coordinators/friends"
import { InviteUser } from "../../behavior/coordinators/users"
import { setAlbum } from "../../state/album/action"
import speechBubble from "../../public/speech-bubble.svg"
import pencil from "../../public/pencil.svg"
import flag from "../../public/flag.svg"
import Sidebar from "../../components/Sidebar"

const SWING_FRAMES = 60
const REPLY_PREVIEW_LEN = 50
let commentsCache = {}
let posting = false

const swingViewMap = {
  "video": 9,
  "gif": 24,
  "jpg": 24,
}

let timer

const Album = ({
  album,
  confirmation,
  recentUploads,
  user,
  usersCache,

  flagComment,
  getRecentUploads,
  inviteUser,
  loadAlbum,
  onShowInviteForm,
  postComment,
  searchFriends,
  flashMessage,
  updateAlbum,
  updateAlbumRedux,
}) => {
  const router = useRouter()
  const albumId = router.query.id && router.query.id[0]

  const swingVideos = album?.swingVideos || []
  const videosCount = swingVideos.length
  const [albumView, setAlbumView] = useState("video")
  const [swingsPerPage, setSwingsPerPage] = useState(9)

  const [showFooterUsage, setShowFooterUsage] = useState(false)
  const [showProUsage, setShowProUsage] = useState(false)
  const [showVideoUsage, setShowVideoUsage] = useState(false)
  const [showSharingUsage, setShowSharingUsage] = useState(false)
  const [showAlbumUsage, setShowAlbumUsage] = useState(false)

  const [playbackRate, setPlaybackRate] = useState(1)
  const [allPlaying, setAllPlaying] = useState(false)
  const [playerRefs, setPlayerRefs] = useState([])
  const [playerFrames, setPlayerFrames] = useState({})
  const [playings, setPlayings] = useState([])
  const [pips, setPips] = useState([])

  const [activeSideBar, setActiveSidebar] = useState("Album Comments")
  const [expandedSideBar, setExpandedSideBar] = useState(false)
  const [albumPage, setAlbumPage] = useState(0)

  const [isPublic, setIsPublic] = useState(false)
  const [isViewableByFriends, setIsViewableByFriends] = useState(false)
  const [friendIds, setFriendIds] = useState([])
  const [invEmail, setInvEmail] = useState("")
  const [invFirstName, setInvFirstName] = useState("")
  const [invLastName, setInvLastName] = useState("")

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
      setPlayings(pageVideos.map(() => false))
      setPips(pageVideos.map(() => false))
    }
  }, [album?.id, albumPage])

  useEffect(() => {
    if (user && recentUploads === null) {
      getRecentUploads()
    }
  }, [recentUploads, user])

  const handleAllSeekChange = e => {
    const frame = parseFloat(e.target.value)
    if (frame != null) {
      const seekTo = frame === SWING_FRAMES ? 0.9999 : parseFloat((frame/SWING_FRAMES).toFixed(4))
      setPlayings(swingVideos.map(() => false))
      playerRefs.forEach( playerRef => playerRef.current.seekTo(seekTo))
      setPlayerFrames(Object.keys(playerFrames).reduce((acc,key) => {
        acc[key]=frame
        return acc
      },{}))
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

  const onDeleteSwing = swing => async () => {
    flashMessage({
      id: Moment().toString(),
      message: `Delete "${swing.name}"?`,
      buttons: [
        {
          buttonText: "Confirm",
          callback: async () => {
            const success = await updateAlbum({
              ...album,
              swingVideos: album.swingVideos.filter( sw => sw.id !== swing.id ),
            })
            if (success) {
              flashMessage({
                id: Moment().toString(),
                message: `Swing "${swing.name}" Deleted`,
              })
            }
          }
        }
      ]
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

  const onFlagComment = comment => () => {
    flashMessage({
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
              text: comment.text,
            })
            if (success) {
              flashMessage({
                id: Moment().toString(),
                message: "Comment Flagged!"
              })
            }
          },
        }
      ],
    })
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

  const onShareAlbum = async () => {
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
    if (invEmail) {
      const success = await inviteUser({
        email: invEmail,
        firstName: invFirstName,
        lastName: invLastName,
        inviterId: user.id,
        URL: `albums/${album.id}`,
      })
      if (success) {
        flashMessage({
          id: Moment().toString(),
          message: `Album successfully shared with ${invEmail}`,
        })
        setInvEmail("")
        setInvFirstName("")
        setInvLastName("")
      }
    }
  }

  const mainWidth = expandedSideBar ? "w-1/2" : "w-3/4"
  let commentsPlaceholder = "Comment on entire album"
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

      <main className="overflow-y-scroll bg-gray-200">

        <div className="lg:flex lg:flex-row block">
          {/* Begin Sidebar */}
          <Sidebar width={ expandedSideBar ? "50vw" : "25vw" }>
            <div className="flex flex-col content-center justify-center items-center text-sm">
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

              {/* Sharing Sidebar */}
              { (user && user.id == album?.userId) &&
              <div className="mb-2">
                <div className="flex flex-row content-center justify-center items-center mb-2">
                  <h2 className="text-gray-300 uppercase cursor-pointer text-center"
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
                  <input type="button"
                    className="text-xs rounded-full bg-black text-white hover:bg-white hover:text-black h-4 w-4 border border-white ml-2 cursor-pointer hidden lg:block"
                    value="?"
                    onClick={() => {
                      setShowSharingUsage(activeSideBar !== "Sharing" ? true : !showSharingUsage)
                      setActiveSidebar("Sharing")
                    }}
                  />
                </div>
                
                { activeSideBar === "Sharing" &&
                <div className="flex flex-col content-center justify-center items-center p-4 bg-white rounded">
                  <Sharing
                    isPublic={isPublic}
                    setIsPublic={setIsPublic}
                    isViewableByFriends={isViewableByFriends}
                    setIsViewableByFriends={setIsViewableByFriends}
                    friendIds={friendIds}
                    setFriendIds={setFriendIds}
                    invEmail={invEmail}
                    setInvEmail={setInvEmail}
                    invFirstName={invFirstName}
                    setInvFirstName={setInvFirstName}
                    invLastName={invLastName}
                    setInvLastName={setInvLastName}
                    showUsage={showSharingUsage}
                  />
                  <input type='button'
                    className="w-14 rounded py-0.5 px-2 my-2 text-xs font-semibold bg-blue-700 text-white"
                    onClick={onShareAlbum}
                    value="Share"
                  />
                </div>
                }
              </div>
              }

              {/* Comments Sidebar */}
              <div className="mb-2 w-full">
                <h2 className="text-gray-300 uppercase cursor-pointer text-center mb-2"
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
                { activeSideBar === "Album Comments" &&
                  <div className="mb-2 rounded bg-white p-2">
                    <div className="flex flex-col content-center justify-center items-center overscroll-contain">
                      <div className="flex flex-col w-full">

                        {/* Comment Form */}
                        { user?.disableComments &&
                          <p className="rounded-md p-2 font-semibold bg-red-200 mb-2">Your commenting has been disabled</p>
                        }
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
                          <div className="flex flex-row p-1 content-center justify-center items-center">
                            <p className="text-sm mr-2 text-gray-500 align-middle">
                              { Moment().format("MMM D YYYY h:mm a") }
                            </p>
                            <p className="text-sm mr-2 align-middle font-bold">
                                |
                            </p>
                            <p className="text-sm mr-2 align-middle font-medium">
                                chars {comment.length}
                            </p>
                            <p className="text-sm mr-2 align-middle font-bold">
                                |
                            </p>
                            <input type='button'
                              className='border w-12 rounded py-0.5 px-2 text-xs bg-green-700 text-white text-center cursor-pointer'
                              value='post'
                              disabled={!user || !user.disableComments}
                              onClick={onPostComment}
                            />
                          </div>
                        </div>

                        {/* Comments Filters / Sort */}
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
                          </select>

                          <select className="rounded py-0.5 px-1 mx-2 border border-black bg-blue-600 text-white text-xs"
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

                        <div className="flex flex-col h-40 lg:h-full pr-4 rounded shadow-lg bg-gray-100 px-1">
                          { comments.filter( com => !com.isHidden ).length === 0 &&
                            <p className="text-center p-2"> No comments </p>
                          }
                          <div className="overflow-y-scroll">
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
                                        { Moment(commentsCache[comment.replyId]?.createdAt).format("MMM D YYYY h:mm a") }
                                      </p>
                                    </div>
                                  </div>
                                  }
                                  <div className="flex flex-col pt-1 my-0.5">
                                    <p className="p-1">
                                      { comment.text }
                                    </p>
                                    <div className="flex flex-row content-center justify-center items-center">
                                      <img src={getUserIcon(user)}
                                        className="w-5 h-5 ml-1"
                                      />
                                      <p className="mx-1 text-xs text-blue-500 align-middle">
                                      @{ usersCache[comment.userId]?.userName || "..." }
                                      </p>
                                      <p className="mx-1 text-sm align-middle font-bold">
                                      |
                                      </p>
                                      <p className="mx-1 text-xs text-gray-500 align-middle">
                                        { Moment(comment.createdAt).format("MMM D YYYY h:mm a") }
                                      </p>
                                      <p className="mx-1 text-sm align-middle font-bold">
                                      |
                                      </p>
                                      { (user && !user.disableComments) &&
                                      <input type='button'
                                        className='border w-10 rounded py-0.5 px-1 mx-1 text-xs bg-green-700 text-white text-center cursor-pointer'
                                        value='reply'
                                        onClick={() => {
                                          setReplyId(comment.id)
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
                    </div>
                  </div>
                }
              </div>
            </div>
          </Sidebar>
            
          {/* End Sidebar */}

          {/* Begin Album Videos */}
          <div className={`p-4 block lg:flex lg:flex-col lg:${mainWidth} relative content-center justify-center items-center`}>
            
            <a href="/albums"
              className="text-xs text-blue-500 underline cursor-pointer absolute left-3 top-4 hidden lg:block"
            >
            back to albums
            </a>

            <div className="mb-2 block lg:flex content-center justify-center items-center">
              <div className="flex flex-row content-center justify-center items-center relative">
                <input type="button"
                  className="text-xs rounded-full bg-black text-white hover:bg-white hover:text-black h-4 w-4 border border-white mr-5 cursor-pointer hidden lg:block"
                  value="?"
                  onClick={() => setShowAlbumUsage(!showAlbumUsage)}
                />
                <input type="text"
                  className="text-lg text-center underline hover:bg-blue-100 p-1 rounded-lg border-2 border-gray-200"
                  value={album?.name}
                  onChange={onUpdateAlbumName}
                  disabled={!user || user.id !== album?.userId}
                />
                { (user && user.id === album?.userId) &&
                <img src={pencil} className="w-4 h-4 absolute right-2"/>
                }
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:flex-wrap w-full h-full rounded bg-white px-2 py-4 shadow-lg mb-2">
              { pageVideos.map( (swing, i) => {
                return (
                  <div className={"flex flex-col items-center rounded-md lg:w-1/3 lg:h-1/3"}
                    key={i}
                  >
                    { albumView === "video" &&
                      <SwingPlayer
                        albumId={albumId}
                        showAlbumUsage={showAlbumUsage}
                        swing={swing}
                        swingFrames={SWING_FRAMES}
                        i={i}
                        playbackRate={playbackRate}
                        pips={pips}
                        playings={playings}
                        playerFrames={playerFrames}
                        playerRefs={playerRefs}
                        playerWidth="320px"
                        playerHeight="230px"
                        handleSeekChange={handleSeekChange}
                        onDelete={album.userId === user.id && onDeleteSwing(swing)}
                        setPips={setPips}
                        setPlayings={setPlayings}
                        setPlayerFrames={setPlayerFrames}
                      />
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
        </div>

      </main>

      {/* All Video Controls Footer */}
      <div className="sticky flex flex-row bottom-0 left-0 right-0 bg-gray-200 border-t border-gray-400 content-center justify-center items-center">
        <div className="flex flex-row w-20 lg:w-40">
          <input type="button"
            className="text-xs rounded-full bg-black text-white hover:bg-white hover:text-black h-4 w-4 border border-white mr-5 cursor-pointer hidden lg:block"
            value="?"
            onClick={() => setShowFooterUsage(!showFooterUsage)}
          />
          <p className="text-center text-xs font-semibold tracking wider">
          All Video Controls
          </p>
        </div>
        
        <div className="flex flex-row py-2 px-1 content-center justify-center items-center lg:mx-4">
          <div className="static hidden lg:flex flex-row">
            { allPlaying &&
              <IconContext.Provider value={{ color: "red" }}>
                <div className="m-2 content-center justify-center items-center cursor-pointer">
                  <FaRegPauseCircle onClick={() => {
                    setAllPlaying(false)
                    setPlayings(Array(videosCount).fill().map(() => false))
                  }}/>
                </div>
              </IconContext.Provider>
            }
            { !allPlaying &&
              <IconContext.Provider value={{ color: "blue" }}>
                <div className="m-2 content-center justify-center items-center cursor-pointer">
                  <FaPlayCircle onClick={() => {
                    setAllPlaying(true)
                    setPlayings(Array(videosCount).fill().map(() => true))
                  }}/>
                </div>
              </IconContext.Provider>
            }

            <div className="relative flex items-center">
              { showFooterUsage &&
                <div className="absolute mb-5 -mx-56 w-60 bg-yellow-300 text-black text-xs font-semibold tracking-wide rounded shadow py-1.5 px-4 bottom-full">
                  <p>Player seek for all videos at once</p>
                  <p>Click once and use &lt;- and -&gt; keys to nav frame by frame</p>
                  <svg className="absolute text-yellow-300 h-2 right-0 mr-3 top-full" x="0px" y="0px" viewBox="0 0 600 400" xmlSpace="preserve"><polygon className="fill-current" points="0,0 300,400 600,0"/></svg>
                </div>
              }
              <input
                type='range'
                min={0}
                max={SWING_FRAMES}
                step='1'
                onMouseUp={handleAllSeekChange}
                onKeyDown={handleAllSeekChange}
              />
            </div>
          </div>

          <div className="flex flex-row content-center justify-center items-center p-2">
            <input type='button'
              className="w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-lg"
              onClick={() => setPlaybackRate(0.1)}
              value=".1x"
            />
            <input type='button'
              className="w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-lg"
              onClick={() => setPlaybackRate(0.25)}
              value=".25x"
            />
            <input type='button'
              className="w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-lg"
              onClick={() => setPlaybackRate(0.5)}
              value=".5x"
            />
            <input type='button'
              className="w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-lg"
              onClick={() => setPlaybackRate(1)}
              value="1x"
            />
            <input type='button'
              className="w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-lg"
              onClick={() => setPlaybackRate(1.5)}
              value="1.5x"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex flex-row relative">
            { showFooterUsage &&
              <div className="absolute mb-5 mx-10 w-64 bg-yellow-300 text-black text-xs font-semibold tracking-wide rounded shadow py-1.5 pl-4 bottom-full">
                <p>Choose how to display your swings:</p>
                <ul className="list-disc pl-4">
                  <li>Video - 9 swings in video player</li>
                  <li>GIF - 24 swings as GIFs</li>
                  <li>JPGs - 24 swings as JPGs</li>
                </ul>
                <svg className="absolute text-yellow-300 h-2 left-0 ml-3 top-full" x="0px" y="0px" viewBox="0 0 600 400" xmlSpace="preserve"><polygon className="fill-current" points="0,0 300,400 600,0"/></svg>
              </div>
            }
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
          </div>
          <div className="flex flex-row">
            { albumPage > 0 &&
              <button
                onClick={() => setAlbumPage(albumPage-1)}
                className="border border-black rounder p-0.5 mx-1"
              >
                &lt;
              </button>
            }
            { showFooterUsage &&
            <div className="absolute">
              <div className="relative mb-20 ml-20 bg-yellow-300 text-black text-xs font-semibold tracking-wide rounded shadow py-1.5 px-4 bottom-full">
                Show prev or next page of swings
                {/* <svg className="absolute text-yellow-300 h-2 left-0 ml-3 top-full" x="0px" y="0px" viewBox="0 0 600 400" xmlSpace="preserve"><polygon className="fill-current" points="0,0 300,400 600,0"/></svg> */}
              </div>
            </div>
            }
            <h2 className="underline text-blue-500">
              Page { albumPage+1 }
            </h2>
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
    </div>
  )
}

const mapStateToProps = (state) => {
  console.log("mapStateToProps", state)
  return {
    recentUploads: state.recentUploads,
    album: state.album,
    confirmation: state.confirmation,
    user: state.user,
    usersCache: state.usersCache,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    flagComment: FlagComment(dispatch),
    getRecentUploads: GetRecentUploads(dispatch),
    inviteUser: InviteUser(dispatch),
    loadAlbum: LoadAlbum(dispatch),
    onShowInviteForm: () => dispatch(showInviteForm()),
    postComment: PostComment(dispatch),
    searchFriends: SearchFriends(dispatch),
    flashMessage: args => dispatch(newNotification(args)),
    updateAlbum: UpdateAlbum(dispatch),
    updateAlbumRedux: updatedAlbum => dispatch(setAlbum(updatedAlbum))
  }
}
  
Album.propTypes = {
  album: PropTypes.object,
  confirmation: PropTypes.object,
  user: PropTypes.object,
  usersCache: PropTypes.object,
  recentUploads: PropTypes.arrayOf(PropTypes.object),

  flagComment: PropTypes.func,
  flashMessage: PropTypes.func,
  getRecentUploads: PropTypes.func,
  inviteUser: PropTypes.func,
  loadAlbum: PropTypes.func,
  onShowInviteForm: PropTypes.func,
  postComment: PropTypes.func,
  searchFriends: PropTypes.func,
  updateAlbum: PropTypes.func,
  updateAlbumRedux: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(Album)