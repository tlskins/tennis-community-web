import React, { useEffect, useState, createRef } from "react"
import { connect, useSelector, useDispatch } from "react-redux"
import PropTypes from "prop-types"
import { useRouter } from "next/router"
import Moment from "moment"
import { FaPlayCircle, FaRegPauseCircle } from "react-icons/fa"
import { ImPrevious, ImNext } from "react-icons/im"
import { IconContext } from "react-icons"
import axios from "axios"

import { newNotification, setLoginFormVisible } from "../../state/ui/action"
import Notifications from "../../components/Notifications"
import Sharing from "../../components/Sharing"
import Modal from "../../components/Modal"
import PageHead from "../../components/PageHead"
import SwingModal from "../../components/SwingModal"
import SwingPlayer from "../../components/SwingPlayer"
import VideoResources from "../../components/VideoResources"
import ProComparison from "../../components/ProComparison"
import { useWindowDimensions, textareaCursor, cursorWord } from "../../behavior/helpers"
import { GetRecentUploads } from "../../behavior/coordinators/uploads"
import { API_HOST } from "../../behavior/api/rest"
import {
  pAlbum,
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
const REPLY_PREVIEW_LEN = 75
let commentsCache = {}
let posting = false

const swingViewMap = {
  "video": {
    true: 6, // is mobile
    false: 9,
  },
  "jpg": {
    true: 20,
    false: 15,
  },
}

let timer

const Album = ({
  confirmation,
  recentUploads,
  user,
  usersCache,

  flagComment,
  getRecentUploads,
  inviteUser,
  // loadAlbum,
  onShowInviteForm,
  postComment,
  searchFriends,
  flashMessage,
  updateAlbum,
  updateAlbumRedux,
  // static props
  album: staticAlbum,
  head,
}) => {
  const router = useRouter()
  const album = useSelector(state => state.album)
  const dispatch = useDispatch()
  const albumId = router.query.id && router.query.id[0]
  const { swing } = router.query
  const { width: windowWidth } = useWindowDimensions()
  const isMobileView = windowWidth < 1000
  const swingVideos = album?.swingVideos || []
  const videosCount = swingVideos.length

  const [albumView, setAlbumView] = useState("video")
  const [swingsPerPage, setSwingsPerPage] = useState(swingViewMap["video"][isMobileView])
  const [textAreaRef, setTextAreaRef] = useState(createRef())

  const [showFooterUsage, setShowFooterUsage] = useState(false)
  const [showProUsage, setShowProUsage] = useState(false)
  const [showVideoUsage, setShowVideoUsage] = useState(false)
  const [showSharingUsage, setShowSharingUsage] = useState(false)
  const [showAlbumUsage, setShowAlbumUsage] = useState(false)
  const [showOverviewUsage, setShowOverviewUsage] = useState(false)

  const [playbackRate, setPlaybackRate] = useState(1)
  const [allPlaying, setAllPlaying] = useState(false)
  const [playerRefs, setPlayerRefs] = useState([])
  const [playerFrames, setPlayerFrames] = useState({})
  const [playings, setPlayings] = useState([])
  const [pips, setPips] = useState([])

  const [activeSideBar, setActiveSidebar] = useState(user ? "Album Overview" : "Album Comments")
  const [expandedSideBar, setExpandedSideBar] = useState(false)
  const [albumPage, setAlbumPage] = useState(0)
  const [showSwingModal, setShowSwingModal] = useState(!!swing)

  const [isPublic, setIsPublic] = useState(false)
  const [isViewableByFriends, setIsViewableByFriends] = useState(false)
  const [friendIds, setFriendIds] = useState([])
  const [invEmail, setInvEmail] = useState("")
  const [invFirstName, setInvFirstName] = useState("")
  const [invLastName, setInvLastName] = useState("")

  const [comments, setComments] = useState([])
  const [commentsRef, setCommentsRef] = useState([])
  const [commenters, setCommenters] = useState([])
  const [comment, setComment] = useState("")
  const [commentUserTags, setCommentUserTags] = useState([])
  const [replyId, setReplyId] = useState(undefined)
  const [replyPreview, setReplyPreview] = useState("")
  const [searchedFriends, setSearchedFriends] = useState([])

  const [rallyFilters, setRallyFilters] = useState([])
  const [swingsByRally, setSwingsByRally] = useState([])
  const [pageVideos, setPageVideos] = useState([])

  useEffect(() => {
    if (staticAlbum) {
      dispatch(setAlbum(staticAlbum))
    }
  }, [staticAlbum])

  useEffect(() => {
    setShowSwingModal(!!swing)
  }, [swing])

  useEffect(() => {
    let allComments = [
      ...(album?.comments || []),
      ...(swingVideos.map( swing => 
        swing.comments.map( comment => 
          ({ ...comment, swingName: swing.name, swingId: swing.id })
        )
      ).flat()),
    ]
    allComments = allComments.sort((a, b) => Moment(a.createdAt).isAfter(b.createdAt) ? -1 : 1)
    setComments(allComments)
    setIsPublic(album?.isPublic || false)
    setIsViewableByFriends(album?.isViewableByFriends || false)
    setFriendIds(album?.friendIds || [])
    if (swingVideos.length > 0) {
      const swingsByRally = swingVideos.reduce((acc, swing) => {
        const rally = swing.rally || 1
        rally > acc.length ? acc.push([swing]) : acc[rally-1].push(swing)
        return acc
      }, [])
      setSwingsByRally(swingsByRally)
      setRallyFilters(swingsByRally.map((_,i) => i+1))
    }
  }, [album])

  useEffect(() => {
    if (comments.length > 0) {
      const commentersSet = new Set([])
      const usersSet = new Set([])
      comments.forEach( com => {
        if (!usersCache[com.userId]) usersSet.add(com.userId)
        commentersSet.add(com.userId)
        commentsCache[com.id] = com
      })
      const ids = Array.from(usersSet)
      if (ids.length > 0) searchFriends({ ids })
      setCommenters(Array.from(commentersSet))
      setCommentsRef(ref => comments.map((_, i) => ref[i] || createRef()))
    }
  }, [comments])

  useEffect(() => {
    if (album?.id) {
      let filtered = swingVideos.map( (swing,i) => {
        swing.idx = i
        return swing
      })
      filtered = filtered.filter( swing => rallyFilters.includes(swing.rally || 1))
      const swings = filtered.slice(albumPage * swingsPerPage, (albumPage+1) * swingsPerPage)

      setPageVideos(swings)
      setPlayerRefs(ref => pageVideos.map((_, i) => ref[i] || createRef()))
      setPlayings(pageVideos.map(() => true))
      setPips(pageVideos.map(() => false))
      setAllPlaying(true)
    }
  }, [album?.id, rallyFilters, albumPage, swingsPerPage])

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
          callback: () => {
            updateAlbum({
              ...album,
              swingVideos: album.swingVideos.filter( sw => sw.id !== swing.id ),
            }, false, true)
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

  const onCheckAndSearchFriends = text => {
    setSearchedFriends([])
    const cursorIdx = textareaCursor(textAreaRef?.current)
    const [word, start, end] = cursorWord(cursorIdx, text)
    if (word.charAt(0) === "@") {
      executeAfterTimeout(async () => {
        let friends = await searchFriends({ search: word.slice(1), limit: 5 })
        friends = friends.map( f => ({ ...f, start, end }))
        setSearchedFriends(friends)
      }, 600)
    }
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
    const success = await updateAlbum(
      {
        id: album.id,
        name: album.name,
        isPublic,
        isViewableByFriends,
        friendIds
      },
      true,
    )
    if (success) {
      flashMessage({
        id: Moment().toString(),
        message: "Album sharing updated!",
      })
    }

    if (invEmail) {
      const success = await inviteUser({
        email: invEmail,
        firstName: invFirstName,
        lastName: invLastName,
        inviterId: user?.id,
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
    <>
      <PageHead
        title={head?.title}
        desc={head?.desc}
        img={head?.img}
        imgHeight={head?.imgHeight}
        imgWidth={head?.imgWidth}
      />
      <div className="bg-gray-200">
        <Notifications />
        { showSwingModal &&
          <Modal
            hideModal={ () => {
              setShowSwingModal(false)
              router.push({
                pathname: `/albums/${albumId}`,
                query: {},
              })
            }}
            width="80%"
            padding="20px"
          >
            <SwingModal
              swingId={swing}
              album={album}
            />
          </Modal>
        }

        <main className="bg-gray-200 min-h-screen h-full">
          <div className="lg:flex lg:flex-row min-h-screen">
            {/* Begin Sidebar */}
            <Sidebar width={ expandedSideBar ? "50vw" : "25vw" }>
              <div className="flex content-center justify-center items-center">
                <div className="flex flex-col text-sm">
                  {/* Album Overview */}
                  <div>
                    <div className="flex flex-row relative pl-12">
                      <div className={`flex content-center justify-center items-center py-0.5 px-2 my-1 rounded-xl ${activeSideBar === "Album Overview" ? "bg-yellow-300" : "bg-gray-800 text-yellow-300"}`}>
                        <input type="radio"
                          checked={activeSideBar === "Album Overview"}
                          onClick={() => setActiveSidebar(activeSideBar === "Album Overview" ? undefined : "Album Overview")}
                          onChange={() => {}}
                        />
                        <label className="ml-2 text-sm font-semibold uppercase">
                          Album Overview
                        </label>
                      </div>

                      <div className="relative">
                        <input type="button"
                          className="text-xs rounded-full bg-black text-white hover:bg-white hover:text-black h-4 w-4 border border-white ml-2 mt-2 cursor-pointer hidden lg:block"
                          value="?"
                          onClick={() => {
                            setShowOverviewUsage(activeSideBar !== "Album Overview" ? true : !showOverviewUsage)
                            setActiveSidebar("Album Overview")
                          }}
                        />
                        { showOverviewUsage &&
                          <div className="absolute ml-10 -my-28 w-60 bg-yellow-300 text-black text-xs font-semibold tracking-wide rounded shadow py-1.5 px-4 bottom-full z-10">
                            <ul className="list-disc pl-6">
                              <li>Shows the swings and rallies that were clipped from the original video</li>
                              <li>Rallies, or Points, are consecutive hits while playing tennis</li>
                              <li>Toggle the Rally checkboxes to filter by Rally</li>
                            </ul>
                          </div>
                        }
                      </div>
                    </div>
                
                    { activeSideBar === "Album Overview" &&
                      <div className="flex flex-col rounded bg-white shadow-lg p-2 my-2">
                        <div className="flex flex-col pl-8 py-4 mb-4 max-h-96 rounded shadow-lg bg-gray-200 text-gray-700 overflow-y-auto">
                          <p className="uppercase underline font-semibold mb-1">
                            { swingVideos.length } Total Swings | { swingsByRally.length } Rallies
                          </p>

                          <div>
                            <input type="checkbox"
                              className="mr-2"
                              checked={false}
                              onChange={() => {
                                const rallies = rallyFilters.length === swingsByRally.length ?
                                  [] :
                                  swingsByRally.map( swings => swings[0].rally )
                                setRallyFilters(rallies)
                                setAlbumPage(0)
                              }}
                            />
                            <span className="font-semibold mr-1">
                              { rallyFilters.length === swingsByRally.length ? "Deselect All" : "Select All" }
                            </span>
                          </div>

                          {
                            swingsByRally.map((swings, i) => {
                              return(
                                <div key={i}>
                                  <input type="checkbox"
                                    className="mr-2"
                                    checked={rallyFilters.includes(i+1)}
                                    onChange={() => {
                                      const rallies = rallyFilters.includes(i+1) ?
                                        rallyFilters.filter( rally => rally != i+1) :
                                        [...rallyFilters, i+1]
                                      setRallyFilters(rallies)
                                      setAlbumPage(0)
                                    }}
                                  />
                                  <span className="font-semibold mr-1">Rally {i+1}:</span>
                                  <span className="text-xs">{swings.length} swings</span>
                                </div>
                              )
                            })
                          }
                        </div>
                      </div>
                    }
                  </div>

                  {/* Pro Comparison Sidebar */}
                  <div>
                    <div className="flex flex-row relative pl-12">
                      <div className={`flex content-center justify-center items-center py-0.5 px-2 my-1 rounded-xl ${activeSideBar === "Pro Comparison" ? "bg-yellow-300" : "bg-gray-800 text-yellow-300"}`}>
                        <input type="radio"
                          checked={activeSideBar === "Pro Comparison"}
                          onClick={() => setActiveSidebar(activeSideBar === "Pro Comparison" ? undefined : "Pro Comparison")}
                          onChange={() => {}}
                        />
                        <label className="ml-2 text-sm font-semibold uppercase">
                          Pro Comparison
                        </label>
                      </div>

                      <input type="button"
                        className="text-xs rounded-full bg-black text-white hover:bg-white hover:text-black h-4 w-4 border border-white ml-2 mt-2 cursor-pointer hidden lg:block"
                        value="?"
                        onClick={() => {
                          setShowProUsage(activeSideBar !== "Pro Comparison" ? true : !showProUsage)
                          setActiveSidebar("Pro Comparison")
                        }}
                      />
                    </div>

                    { activeSideBar === "Pro Comparison" &&
                      <div className="my-2">
                        <ProComparison showUsage={showProUsage} />
                      </div>
                    }
                  </div>

                  {/* Video Resources Sidebar */}
                  <div>
                    <div className="flex flex-row relative pl-12">
                      <div className={`flex content-center justify-center items-center py-0.5 px-2 my-1 rounded-xl ${activeSideBar === "Video Resources" ? "bg-yellow-300" : "bg-gray-800 text-yellow-300"}`}>
                        <input type="radio"
                          checked={activeSideBar === "Video Resources"}
                          onClick={() => setActiveSidebar(activeSideBar === "Video Resources" ? undefined : "Video Resources")}
                          onChange={() => {}}
                        />
                        <label className="ml-2 text-sm font-semibold uppercase">
                          Youtube Tutorials
                        </label>
                      </div>

                      <input type="button"
                        className="text-xs rounded-full bg-black text-white hover:bg-white hover:text-black h-4 w-4 border border-white ml-2 mt-2 cursor-pointer hidden lg:block"
                        value="?"
                        onClick={() => {
                          setShowVideoUsage(activeSideBar !== "Video Resources" ? true : !showVideoUsage)
                          setActiveSidebar("Video Resources")
                        }}
                      />
                    </div>

                    { activeSideBar === "Video Resources" &&
                      <div className="my-2">
                        <VideoResources
                          onExpand={playing => setExpandedSideBar(playing)}
                          showUsage={showVideoUsage}
                        />
                      </div>
                    }
                  </div>

                  { (user && user.id == album?.userId) &&
                    <div>
                      <div className="flex flex-row relative pl-12">
                        <div className={`flex content-center justify-center items-center py-0.5 px-2 my-1 rounded-xl ${activeSideBar === "Sharing" ? "bg-yellow-300" : "bg-gray-800 text-yellow-300"}`}>
                          <input type="radio"
                            checked={activeSideBar === "Sharing"}
                            onClick={() => setActiveSidebar(activeSideBar === "Sharing" ? undefined : "Sharing")}
                            onChange={() => {}}
                          />
                          <label className="ml-2 text-sm font-semibold uppercase">
                          Sharing
                          </label>
                        </div>

                        <input type="button"
                          className="text-xs rounded-full bg-black text-white hover:bg-white hover:text-black h-4 w-4 border border-white ml-2 mt-2 cursor-pointer hidden lg:block"
                          value="?"
                          onClick={() => {
                            setShowSharingUsage(activeSideBar !== "Sharing" ? true : !showSharingUsage)
                            setActiveSidebar("Sharing")
                          }}
                        />
                      </div>

                      { activeSideBar === "Sharing" &&
                        <div className="flex flex-col content-center justify-center items-center my-2 p-4 bg-white rounded">
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
                            className="w-14 rounded py-0.5 px-2 mt-4 text-xs font-semibold bg-blue-700 text-white cursor-pointer"
                            onClick={onShareAlbum}
                            value="Share"
                          />
                        </div>
                      }
                    </div>
                  }

                  {/* Comments Sidebar */}
                  <div className="w-full">
                    <div className="flex flex-row relative pl-12">
                      <div className={`flex content-center justify-center items-center py-0.5 px-2 my-1 rounded-xl ${activeSideBar === "Album Comments" ? "bg-yellow-300" : "bg-gray-800 text-yellow-300"}`}>
                        <input type="radio"
                          checked={activeSideBar === "Album Comments"}
                          onClick={() => setActiveSidebar(activeSideBar === "Album Comments" ? undefined : "Album Comments")}
                          onChange={() => {}}
                        />
                        <label className="ml-2 text-sm font-semibold uppercase">
                      Album Comments
                        </label>
                      </div>
                    </div>

                    { activeSideBar === "Album Comments" &&
                      <div className="my-2 rounded bg-white p-2 w-full">
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
                              <div className="flex flex-col relative">
                                <textarea
                                  ref={textAreaRef}
                                  className="p-2 rounded shadow-lg bg-gray-100"
                                  placeholder={commentsPlaceholder}
                                  rows="4"
                                  maxLength={500}
                                  value={comment}
                                  onClick={() => {
                                    onCheckAndSearchFriends(comment)
                                    if (confirmation) onShowInviteForm()
                                  }}
                                  onChange={e => {
                                    const text = e.target.value
                                    onCheckAndSearchFriends(text)
                                    if (user && !user.disableComments) setComment(text)
                                  }}
                                />
                                { commentUserTags.length > 0 &&
                                  <div className="flex flex-row mt-1 p-1 rounded shadow-lg">
                                    { commentUserTags.map( (tag, i) => {
                                      return(
                                        <span key={i}
                                          className="rounded px-0.5 shadow-md bg-yellow-300 "
                                        >
                                          @{ tag.user.userName }
                                        </span>
                                      )
                                    })}
                                  </div>
                                }
                                <div className="absolute bottom-0 w-full">
                                  <div className="absolute mt-0.5 bg-white border border-white flex flex-col w-full">
                                    { searchedFriends.map( friend => {
                                      return(
                                        <div key={friend.id}
                                          className="h-8 p-1 mt-0.5 text-center text-yellow-300 rounded bg-gray-800 hover:bg-yellow-300 hover:text-gray-800 w-full overflow-hidden whitespace-nowrap cursor-pointer"
                                          onClick={() => {
                                            const { start, end, userName } = friend
                                            setComment(
                                              comment.slice(0,start)+
                                              "@"+userName+
                                              comment.slice(end, comment.length)
                                            )
                                            setCommentUserTags([...commentUserTags, { start, end, type: "user", user: friend }])
                                            setSearchedFriends([])
                                            textAreaRef?.current?.focus()
                                          }}
                                        >
                                          {`@${friend.userName} (${friend.firstName} ${friend.lastName})`}
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-row p-1 content-center justify-center items-center">
                                <p className="text-sm mr-2 text-gray-500 align-middle">
                                  { Moment().format("MMM D h:mm a") }
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
                                  disabled={!user || user.disableComments}
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
                            <div className="flex flex-col overflow-y-auto lg:h-full rounded shadow-lg bg-gray-300 border border-gray-300 p-1">
                              { comments.filter( com => !com.isHidden ).length === 0 &&
                                  <p className="text-center p-2"> No comments </p>
                              }
                              
                              { comments.length > 0 &&
                                <div className="max-h-96">
                                  { comments.map( (comment, idx) => {
                                    return(
                                      <div key={comment.id}
                                        className={`px-2 py-1.5 mb-2 ${comment.userId === user?.id ? "bg-gray-200" : "bg-white"} rounded shadow-lg ${comment.isHidden ? "hidden" : ""}`}
                                        ref={commentsRef[idx]}
                                      >
                                        { comment.replyId &&
                                          <div className="p-2 rounded shadow-lg text-xs bg-gray-400 cursor-pointer hover:bg-gray-300">
                                            <p>reply to</p>
                                            <p className="pl-2 text-gray-700"
                                              onClick={() => {
                                                const replyIdx = comments.findIndex( c => c.id === comment.replyId )
                                                if (!replyIdx) return
                                                commentsRef[replyIdx].current.scrollIntoView()
                                              }}
                                            >
                                              { commentsCache[comment.replyId]?.text?.substring(0, REPLY_PREVIEW_LEN) }
                                            </p>
                                            <div className="flex flex-row items-center text-center">
                                              <p className="mx-2 text-xs text-blue-500 align-middle">
                                                @{ usersCache[commentsCache[comment.replyId]?.userId]?.userName || "..." }
                                              </p>
                                              <p className="mx-2 text-sm align-middle font-bold">
                                                |
                                              </p>
                                              <p className="mx-2 text-xs text-gray-500 align-middle">
                                                { Moment(commentsCache[comment.replyId]?.createdAt).format("MMM D h:mm a") }
                                              </p>
                                            </div>
                                          </div>
                                        }
                                        <div className="flex flex-col p-1 mt-2 mb-1">
                                          <p className="text-xs bg-gray-300 rounded-md shadow w-full px-2 py-0.5 mb-1">
                                            { comment.text }
                                          </p>
                                        
                                          <div className="mx-1 mt-0.5 flex flex-row content-center justify-center items-center text-center">
                                            <p className={`mx-1 text-xs ${comment.userId === user?.id ? "text-gray-700" : "text-blue-500"} align-middle`}>
                                              @{ usersCache[comment.userId]?.userName || "..." }
                                            </p>
                                            <p className="mx-1 text-sm align-middle font-bold">
                                            |
                                            </p>
                                            { comment.swingId &&
                                            <>
                                              <a className="mx-1 text-xs px-2 rounded-lg bg-black text-yellow-300 shadow-md underline align-middle"
                                                href={`/albums/${albumId}?swing=${comment.swingId}`}
                                              >
                                              swing { comment.swingName }
                                              </a>
                                              <p className="mx-1 text-sm align-middle font-bold">
                                              |
                                              </p>
                                            </>
                                            }
                                            <p className="mx-1 text-xs text-gray-500 align-middle">
                                              { Moment(comment.createdAt).format("MMM D h:mm a") }
                                            </p>
                                            <p className="mx-1 text-sm align-middle font-bold">
                                            |
                                            </p>
                                            { (user && !user.disableComments) &&
                                            <input type='button'
                                              className='border w-10 rounded py-0.5 px-0.5 mx-0.5 text-xs bg-green-700 text-white text-center cursor-pointer'
                                              value='reply'
                                              onClick={() => {
                                                setReplyId(comment.id)
                                                setReplyPreview(comment.text.substring(0, REPLY_PREVIEW_LEN))
                                              }}
                                            />
                                            }
                                            { (user && comment.userId !== user.id) &&
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
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </Sidebar>
            {/* End Sidebar */}

            {/* Begin Album Videos */}
            <div className={`p-4 block lg:flex lg:flex-col lg:${mainWidth} relative bg-gray-400 lg:bg-transparent content-center justify-center items-center`}>
            
              <a href="/albums"
                className="text-xs text-blue-500 underline cursor-pointer absolute left-3 top-4 hidden lg:block"
              >
                back to albums
              </a>

              <div className="mb-2 block lg:flex flex-col content-center justify-center items-center">
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

              <div className="flex flex-col lg:grid lg:grid-cols-3 rounded bg-white lg:bg-white px-2 py-4 shadow-lg mb-2">
                { pageVideos.map( (swing, i) => {
                  const viewScale = albumView === "video" ? "items-center" : "m-2"
                  return (
                    <div className={`flex flex-col rounded-md ${viewScale}`}
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
                          playerHeight="182px"
                          handleSeekChange={handleSeekChange}
                          isOwner={album.userId === user?.id}
                          onDelete={onDeleteSwing(swing)}
                          setPips={setPips}
                          setPlayings={setPlayings}
                          setPlayerFrames={setPlayerFrames}
                        />
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
        <div className="sticky flex bottom-10 lg-pl-25pct content-center justify-center items-center">
          <div className="absolute flex flex-row bg-gray-700 rounded-full shadow-lg mx-4 py-1 w-full lg:w-1/4 content-center justify-center items-center">        
            <div className="flex flex-row w-full content-center justify-items-center justify-between items-center lg:mx-1">
              <IconContext.Provider value={{ color: `${albumPage === 0 ? "gray" : "orange"}`, size: "40px", left: "0px" }}>
                <div className={`ml-4 content-center justify-center items-center ${albumPage !== 0 && "cursor-pointer"}`}>
                  <ImPrevious onClick={() => {
                    if (albumPage !== 0) setAlbumPage(albumPage-1)
                  }}/>
                </div>
              </IconContext.Provider>

              <div className="flex flex-col">
                <div className="flex flex-row content-center justify-around items-center">
                  <div className="flex flex-row items-center">
                    { allPlaying &&
                    <IconContext.Provider value={{ color: "red", size: "32px" }}>
                      <div className="content-center justify-center items-center cursor-pointer">
                        <FaRegPauseCircle onClick={() => {
                          setAllPlaying(false)
                          setPlayings(Array(videosCount).fill().map(() => false))
                        }}/>
                      </div>
                    </IconContext.Provider>
                    }
                    { !allPlaying &&
                    <IconContext.Provider value={{ color: "yellow", size: "32px" }}>
                      <div className="content-center justify-center items-center cursor-pointer">
                        <FaPlayCircle onClick={() => {
                          setAllPlaying(true)
                          setPlayings(Array(videosCount).fill().map(() => true))
                        }}/>
                      </div>
                    </IconContext.Provider>
                    }
                  </div>

                  <div className="flex flex-col">
                    <div className="flex flex-col">
                      <div className="flex flex-row text-sm text-yellow-300 font-semibold content-center justify-center items-center">
                      swings 
                        <div className="flex flex-col ml-3 content-center justify-center">
                          <div className="text-center">
                            { (pageVideos[0]?.idx || 0) + 1 } - { (pageVideos[pageVideos.length-1]?.idx || 0) + 1 }
                          </div>
                          <div className="text-center text-xs hidden lg:block">
                            { pageVideos[0] && `${parseInt(pageVideos[0].timestampSecs/60)}:${parseInt(pageVideos[0].timestampSecs%60).toString().padStart(2,"0")} ` }
                          -
                            { pageVideos[pageVideos.length-1] && ` ${parseInt(pageVideos[pageVideos.length-1].timestampSecs/60)}:${parseInt(pageVideos[pageVideos.length-1].timestampSecs%60).toString().padStart(2,"0")}` }
                          </div>
                        </div>
                      </div>

                      <div className="relative flex items-row content-center justify-center items-center">
                        <input
                          type='range'
                          className="my-0.5"
                          min={0}
                          max={SWING_FRAMES}
                          step='1'
                          onMouseUp={handleAllSeekChange}
                          onKeyDown={handleAllSeekChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row content-center justify-center items-center mt-2">
                  <input type='button'
                    className={`w-8 rounded p-0.5 mx-1 text-xs font-bold shadow-lg cursor-pointer ${playbackRate === 0.1 ? "bg-yellow-300 text-gray-700" : "bg-gray-800 text-yellow-300"}`}
                    onClick={() => setPlaybackRate(0.1)}
                    value=".1x"
                  />
                  <input type='button'
                    className={`w-8 rounded p-0.5 mx-1 text-xs font-bold shadow-lg cursor-pointer ${playbackRate === 0.25 ? "bg-yellow-300 text-gray-700" : "bg-gray-800 text-yellow-300"}`}
                    onClick={() => setPlaybackRate(0.25)}
                    value=".25x"
                  />
                  <input type='button'
                    className={`w-8 rounded p-0.5 mx-1 text-xs font-bold shadow-lg cursor-pointer ${playbackRate === 0.5 ? "bg-yellow-300 text-gray-700" : "bg-gray-800 text-yellow-300"}`}
                    onClick={() => setPlaybackRate(0.5)}
                    value=".5x"
                  />
                  <input type='button'
                    className={`w-8 rounded p-0.5 mx-1 text-xs font-bold shadow-lg cursor-pointer ${playbackRate === 1 ? "bg-yellow-300 text-gray-700" : "bg-gray-800 text-yellow-300"}`}
                    onClick={() => setPlaybackRate(1)}
                    value="1x"
                  />
                  <input type='button'
                    className={`w-8 rounded p-0.5 mx-1 text-xs font-bold shadow-lg cursor-pointer ${playbackRate === 1.5 ? "bg-yellow-300 text-gray-700" : "bg-gray-800 text-yellow-300"}`}
                    onClick={() => setPlaybackRate(1.5)}
                    value="1.5x"
                  />
                </div>
              </div>

              <IconContext.Provider value={{ color: `${albumPage >= (swingVideos.length / swingsPerPage)-1 ? "gray" : "orange"}`, size: "40px", left: "0px" }}>
                <div className={`mr-4 content-center justify-center items-center ${albumPage < (swingVideos.length / swingsPerPage)-1 && "cursor-pointer"}`}>
                  <ImNext onClick={() => {
                    if (albumPage < (swingVideos.length / swingsPerPage)-1) setAlbumPage(albumPage+1)
                  }}/>
                </div>
              </IconContext.Provider>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const mapStateToProps = (state) => {
  return {
    recentUploads: state.recentUploads,
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
    onShowInviteForm: () => dispatch(setLoginFormVisible("INVITE")),
    postComment: PostComment(dispatch),
    searchFriends: SearchFriends(dispatch),
    flashMessage: args => dispatch(newNotification(args)),
    updateAlbum: UpdateAlbum(dispatch),
    updateAlbumRedux: updatedAlbum => dispatch(setAlbum(updatedAlbum))
  }
}

export async function getServerSideProps({ params: { id }}) {
  const { data } = await axios.get(`${API_HOST}/albums/${id[0]}`)
  const album = pAlbum(data)

  return {
    props: {
      album,
      head: {
        title: album?.name,
        desc: `Check out my tennis album "${album?.name}"`,
        img: album?.swingVideos[0]?.jpgURL,
        imgHeight: "600",
        imgWidth: "1066",
      }
    }
  }
}

Album.propTypes = {
  album: PropTypes.object,
  confirmation: PropTypes.object,
  head: PropTypes.object,
  user: PropTypes.object,
  usersCache: PropTypes.object,
  recentUploads: PropTypes.arrayOf(PropTypes.object),
  pageTitle: PropTypes.string,
  pageDesc: PropTypes.string,
  pageImg: PropTypes.string,

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