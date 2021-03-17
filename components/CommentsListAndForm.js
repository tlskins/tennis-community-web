import React, { useEffect, useState, createRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import Moment from "moment"
import PropTypes from "prop-types"

import { textareaCursor, cursorWord } from "../behavior/helpers"
import { SearchFriends } from "../behavior/coordinators/friends"
import { PostComment, FlagComment } from "../behavior/coordinators/albums"
import { newNotification, setLoginFormVisible } from "../state/ui/action"
import flag from "../public/flag.svg"

let timer
let posting = false
const REPLY_PREVIEW_LEN = 75
let commentsCache = {}

const executeAfterTimeout = (func, timeout) => {
  if ( timer ) {
    clearTimeout( timer )
  }
  timer = undefined
  timer = setTimeout(() => {
    func()
  }, timeout )
}

const CommentsListAndForm = ({
  albumId,
  playerFrame,
  user,
  usersCache,
  comments,
  showSwingUsage,
  swingId,
}) => {
  const dispatch = useDispatch()
  const searchFriends = SearchFriends(dispatch)
  const postComment = PostComment(dispatch)
  const flagComment = FlagComment(dispatch)
  const flashMessage = args => dispatch(newNotification(args))
  const onShowInviteForm = () => dispatch(setLoginFormVisible("INVITE"))
  const confirmation = useSelector(state => state.confirmation)
    
  const [comment, setComment] = useState("")
  const [replyId, setReplyId] = useState(undefined)
  const [replyPreview, setReplyPreview] = useState("")
  const [commentsRef, setCommentsRef] = useState([])
  const [textAreaRef,] = useState(createRef())
  const [searchedFriends, setSearchedFriends] = useState([])
  const [searchedFriendIdx, setSearchedFriendIdx] = useState(0)
  const [commentUserTags, setCommentUserTags] = useState([])

  useEffect(() => {
    comments.forEach( com => commentsCache[com.id] = com)
    setCommentsRef(ref => comments.map((_, i) => ref[i] || createRef()))
  }, [comments])

  const onPostComment = async () => {
    if (posting) {
      return
    }
    posting = true
    const params = {
      albumId,
      text: comment,
      userTags: commentUserTags,
    }
    if (replyId) params.replyId = replyId
    if (swingId) params.swingId = swingId
    if (playerFrame != null) params.frame = playerFrame
    if (await postComment(params)) {
      setReplyId(undefined)
      setReplyPreview("")
      setComment("")
      setCommentUserTags([])
      setSearchedFriends([])
      setSearchedFriendIdx(0)
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
              albumId,
              swingId,
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

  const onCheckAndSearchFriends = text => {
    setSearchedFriends([])
    setSearchedFriendIdx(0)
    // remove any deleted tags
    const newUserTags = commentUserTags.filter( tag => {
      return text.slice(tag.start, tag.end) === `@${tag.userName}`
    })
    setCommentUserTags(newUserTags)
    // check if typing out a tag
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

  const onSelectSearchedFriend = friend => () => {
    const { id: userId, start, end, userName, firstName, lastName } = friend
    if (commentUserTags.some( tag => tag.userName === userName )) return

    setComment(
      comment.slice(0,start)+
      "@"+userName+
      comment.slice(end, comment.length)
    )
    setCommentUserTags([
      ...commentUserTags,
      { start, end: start+1+userName.length, userId, userName, firstName, lastName }
    ])
    setSearchedFriends([])
    setSearchedFriendIdx(0)
    textAreaRef?.current?.focus()
  }

  let commentsPlaceholder = swingId ?
    "Comment on specific frame and tag friends using @"
    :
    "Comment on entire album and tag friends using @"
  if (!user) {
    commentsPlaceholder = "Create account to comment"
  } else if (user.disableComments) {
    commentsPlaceholder = "Your commenting has been disabled. Please contact an administrator."
  } else if (replyId) {
    commentsPlaceholder = "Reply to comment"
  }

  return(
    <div className="flex flex-col w-full">
      {/* Comment Form */}
      { user?.disableComments &&
        <p className="rounded-md p-2 font-semibold bg-red-200 mb-2">Your commenting has been disabled</p>
      }
      <div className="flex flex-col mb-2">
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
            style={{resize: "none"}}
            ref={textAreaRef}
            className="p-2 rounded shadow bg-gray-100"
            placeholder={commentsPlaceholder}
            rows="4"
            maxLength={500}
            value={comment}
            onClick={() => {
              if (user && comment) onCheckAndSearchFriends(comment)
              if (confirmation) onShowInviteForm()
            }}
            onChange={e => {
              if (user && !user.disableComments) {
                const text = e.target.value
                onCheckAndSearchFriends(text)
                setComment(text)
              }
            }}
            onKeyDown={e => {
              if (e.key === "Escape") {
                e.preventDefault()
                setSearchedFriends([])
                setSearchedFriendIdx(0)
              }
              if (e.key === "Enter" && searchedFriends.length > 0) {
                e.preventDefault()
                onSelectSearchedFriend(searchedFriends[searchedFriendIdx])()
              }
              if (e.key === "ArrowDown") {
                let newIdx = searchedFriendIdx+1
                if (newIdx >= searchedFriends.length) newIdx = 0
                setSearchedFriendIdx(newIdx)
              }
              if (e.key === "ArrowUp") {
                let newIdx = searchedFriendIdx-1
                if (newIdx < 0) newIdx = searchedFriends.length-1
                setSearchedFriendIdx(newIdx)
              }
            }}
          />
          { showSwingUsage &&
            <div className="absolute -mb-28 bg-yellow-300 text-black text-xs font-semibold tracking-wide rounded shadow py-1.5 px-4 bottom-full z-100">
              Use seek bar to select frame # to comment on
              <svg className="absolute text-yellow-300 h-2 right-0 mr-3 top-full" x="0px" y="0px" viewBox="0 0 600 400" xmlSpace="preserve"><polygon className="fill-current" points="0,0 300,400 600,0"/></svg>
            </div>
          }
          { commentUserTags.length > 0 &&
            <div className="flex flex-row mt-1 p-1 bg-gray-100 rounded shadow-lg">
              { commentUserTags.map( (tag, i) => {
                return(
                  <span key={i}
                    className="rounded px-0.5 mx-0.5 shadow-md bg-yellow-300 "
                  >
                    @{ tag.userName }
                  </span>
                )
              })}
            </div>
          }
          <div className="absolute bottom-0 w-full">
            <div className="absolute mt-0.5 bg-white border border-white flex flex-col w-full">
              { searchedFriends.map( (friend, i) => {
                const selected = searchedFriendIdx === i
                return(
                  <div key={friend.id}
                    className={`h-8 p-1 mt-0.5 text-center rounded ${selected ? "bg-yellow-300 text-gray-800" : "text-yellow-300 bg-gray-800"} w-full overflow-hidden whitespace-nowrap cursor-pointer`}
                    onClick={onSelectSearchedFriend(friend)}
                    onMouseEnter={() => setSearchedFriendIdx(i)}
                  >
                    {`@${friend.userName} (${friend.firstName} ${friend.lastName})`}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-row p-1 mt-1 content-center justify-center items-center">
          { playerFrame != null &&
            <>
              <p className="mx-1 text-xs px-1 rounded-lg bg-black text-center text-yellow-300 underline align-middle">
                frame {playerFrame}
              </p>
              <p className="mx-2 text-xs align-middle font-bold">
                |
              </p>
            </>
          }
          <input type='button'
            className='border w-12 rounded-full shadow-lg py-0.5 px-2 text-xs bg-green-700 text-white text-center cursor-pointer'
            value='post'
            disabled={!user || user.disableComments}
            onClick={onPostComment}
          />
        </div>
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
                    className={`px-2 py-1 mb-2 ${comment.userId === user?.id ? "bg-gray-200" : "bg-white"} rounded shadow-lg ${comment.isHidden ? "hidden" : ""}`}
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

                    <div className="flex flex-col mt-2 mb-1">
                      <p className="text-xs bg-gray-300 rounded-md shadow w-full px-2 py-0.5 mb-1">
                        { comment.taggedText.map( (segment, i) => {
                          return(
                            segment.type === "text" ?
                              segment.text
                              :
                              <span key={i} className="px-0.5 mx-0.5 bg-yellow-300 rounded shadow-lg">
                                { segment.text }
                              </span>
                          )
                        }) }
                      </p>

                      {/* content-center justify-center items-center */}
                      <div className="mx-1 mt-0.5 flex lg:justify-center items-center overflow-x-auto">
                        <div className={`mx-1 text-xs whitespace-nowrap ${comment.userId === user?.id ? "text-gray-700" : "text-blue-500"}`}>
                          @{ usersCache[comment.userId]?.userName || "..." }
                        </div>
                        <div className="mx-1 text-sm align-middle font-bold">
                          |
                        </div>
                        <div className="mx-1 text-xs whitespace-nowrap text-gray-500 align-middle">
                          { Moment(comment.createdAt).format("MMM D h:mm a") }
                        </div>

                        { comment.swingId &&
                          <>
                            <div className="mx-1 text-sm align-middle font-bold">
                              |
                            </div>
                            <a className="mx-1 text-xs px-2 whitespace-nowrap rounded-lg bg-black text-yellow-300 shadow-md underline align-middle"
                              href={`/albums/${albumId}?swing=${comment.swingId}`}
                            >
                              swing { comment.swingName } { comment.frame != null && `/ frame ${comment.frame || 0}`}
                            </a>
                          </>
                        }
                      </div>

                      { user &&
                        <div className="mx-1 mt-0.5 flex justify-center items-center overflow-x-auto">
                          { (user && !user.disableComments) &&
                            <input type='button'
                              className='border w-10 rounded-full shadow-lg px-0.5 mx-0.5 text-xs bg-green-700 text-white text-center cursor-pointer'
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
                      }
                    </div>
                  </div>
                )
              })}
            </div>
        }
      </div>
    </div>
  )
}


CommentsListAndForm.propTypes = {
  albumId: PropTypes.string,
  playerFrame: PropTypes.number,
  user: PropTypes.object,
  usersCache: PropTypes.object,
  comments: PropTypes.arrayOf(PropTypes.object),
  showSwingUsage: PropTypes.bool,
  swingId: PropTypes.string,
}

export default CommentsListAndForm