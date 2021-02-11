import React, { useEffect, useState, Fragment } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import Moment from "moment-timezone"
import { useRouter } from "next/router"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

import Notifications from "../components/Notifications"
import {
  GetRecentAlbums,
  GetRecentAlbumComments,
  GetRecentFlaggedAlbums,
  GetRecentFlaggedComments,
  GetRecentSwingComments,
  GetRecentUsers,
  UpdateAlbumFlag,
  UpdateCommentFlag,
} from "../behavior/coordinators/admin"
import { UpdateAlbum } from "../behavior/coordinators/albums"
import { SearchFriends } from "../behavior/coordinators/friends"
  
const ALBUMS_LIMIT = 20
const USERS_LIMIT = 20
const COMMENTS_LIMIT = 20
const FLAGGED_ALBUMS_LIMIT = 20
const FLAGGED_COMMENTS_LIMIT = 20

const Admin = ({
  user,
  usersCache,
  
  getRecentAlbums,
  getRecentAlbumComments,
  getRecentFlaggedAlbums,
  getRecentFlaggedComments,
  getRecentSwingComments,
  getRecentUsers,
  searchFriends,
  updateAlbum,
  updateAlbumFlag,
  updateCommentFlag,
}) => {
  const router = useRouter()

  const [activeSideBar, setActiveSidebar] = useState("Recent Albums")

  const [start, setStart] = useState(Moment().add(-14, "days").toDate())
  const [end, setEnd] = useState(new Date())
  const [resolved, setResolved] = useState(false)
  const [page, setPage] = useState(0)

  const [recentAlbums, setRecentAlbums] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [recentAlbumComments, setRecentAlbumComments] = useState([])
  const [recentSwingComments, setRecentSwingComments] = useState([])
  const [recentFlaggedAlbums, setRecentFlaggedAlbums] = useState([])
  const [recentFlaggedComments, setRecentFlaggedComments] = useState([])

  let showNextPage = false
  switch(activeSideBar) {
  case "Recent Comments":
    showNextPage = recentAlbumComments.length === COMMENTS_LIMIT || recentSwingComments.length === COMMENTS_LIMIT
    break
  case "Recent Users":
    showNextPage = recentUsers.length === USERS_LIMIT
    break
  case "Recent Albums":
    showNextPage = recentAlbums.length === ALBUMS_LIMIT
    break
  case "Recent Flagged Albums":
    showNextPage = recentFlaggedAlbums.length === FLAGGED_ALBUMS_LIMIT
    break
  case "Recent Flagged Comments":
    showNextPage = recentFlaggedComments.length === FLAGGED_COMMENTS_LIMIT
    break
      
  default:
    break
  }

  useEffect(async () => {
    if (activeSideBar === "Recent Albums" && start && end) {
      const albums = await getRecentAlbums({ start, end, limit: ALBUMS_LIMIT, offset: page*ALBUMS_LIMIT })
      setRecentAlbums(albums)
    } else if (activeSideBar === "Recent Users" && start && end) {
      const users = await getRecentUsers({ start, end, limit: USERS_LIMIT, offset: page*USERS_LIMIT })
      setRecentUsers(users)
    } else if (activeSideBar === "Recent Comments" && start && end) {
      const albumComments = await getRecentAlbumComments({ start, end, limit: COMMENTS_LIMIT, offset: page*COMMENTS_LIMIT })
      const swingComments = await getRecentSwingComments({ start, end, limit: COMMENTS_LIMIT, offset: page*COMMENTS_LIMIT })
      setRecentAlbumComments(albumComments)
      setRecentSwingComments(swingComments)
    }
  }, [activeSideBar, start, end, page])

  useEffect(async () => {
    if (activeSideBar === "Recent Flagged Albums" && start && end) {
      const flags = await getRecentFlaggedAlbums({ start, end, resolved, limit: FLAGGED_ALBUMS_LIMIT, offset: page*FLAGGED_ALBUMS_LIMIT })
      setRecentFlaggedAlbums(flags)
    } else if (activeSideBar === "Recent Flagged Comments" && start && end) {
      const flags = await getRecentFlaggedComments({ start, end, resolved, limit: FLAGGED_COMMENTS_LIMIT, offset: page*FLAGGED_COMMENTS_LIMIT })
      setRecentFlaggedComments(flags)
    } 
  }, [activeSideBar, start, end, resolved, page])

  useEffect(() => {
    const idsSet = new Set([])

    if (recentAlbums.length > 0) {
      recentAlbums.forEach( album => {
        if (!usersCache[album.userId]) {
          idsSet.add(album.userId)
        }
      })
    }
    if (recentFlaggedAlbums.length > 0) {
      recentFlaggedAlbums.forEach( flag => {
        if (!usersCache[flag.albumUserId]) {
          idsSet.add(flag.albumUserId)
        }
      })
    }
    if (recentFlaggedComments.length > 0) {
      recentFlaggedComments.forEach( flag => {
        if (!usersCache[flag.commenterId]) {
          idsSet.add(flag.commenterId)
        }
      })
    }

    if (idsSet.size > 0) {
      searchFriends({ ids: Array.from(idsSet) })
    }
  }, [recentAlbums, recentFlaggedAlbums, recentFlaggedComments])

  const onUpdateAlbumFlag = flag => async () => {
    const success = await updateAlbumFlag({ id: flag.id, resolved: !flag.resolved })
    if (success) {
      const flags = await getRecentFlaggedAlbums({ start, end, resolved, limit: FLAGGED_ALBUMS_LIMIT, offset: page*FLAGGED_ALBUMS_LIMIT })
      setRecentFlaggedAlbums(flags)
    }
  }

  const onUpdateCommentFlag = flag => async () => {
    const success = await updateCommentFlag({ id: flag.id, resolved: !flag.resolved })
    if (success) {
      const flags = await getRecentFlaggedComments({ start, end, resolved, limit: FLAGGED_COMMENTS_LIMIT, offset: page*FLAGGED_COMMENTS_LIMIT })
      setRecentFlaggedComments(flags)
    }
  }

  const onUpdateAlbumHome = album => async () => {
    const success = await updateAlbum({ id: album.id, name: album.name, homeApproved: !album.homeApproved })
    if (success) {
      const albums = await getRecentAlbums({ start, end, limit: ALBUMS_LIMIT, offset: page*ALBUMS_LIMIT })
      setRecentAlbums(albums)
    }
  }

  useEffect(() => {
    if (!user || !user.id || !user.isAdmin) {
      router.push("/")
    }
  }, [user])

  if (!user) {
    return(<Fragment/>)
  }

  return (
    <div className="flex flex-col h-screen min-h-screen">
      { (user && user.id) &&
        <Notifications />
      }
      <main className="flex flex-1 overflow-y-auto">

        {/* Begin Sidebar */}

        <div className="h-screen top-0 sticky p-4 bg-white w-1/5 overflow-y-scroll border-r border-gray-400">
          <div className="flex flex-col content-center justify-center items-center text-sm">

            {/* Recent Albums Sidebar */}
            <div className="mb-2">
              <h2 className="text-blue-400 underline cursor-pointer text-center"
                onClick={() => {
                  if (activeSideBar === "Recent Albums") {
                    setActiveSidebar(undefined)
                  } else {
                    setActiveSidebar("Recent Albums")
                    setPage(0)
                  }
                }}
              >
                Recent Albums
              </h2>
            </div>
          
            {/* Recent Users Sidebar */}
            <div className="mb-2">
              <h2 className="text-blue-400 underline cursor-pointer text-center"
                onClick={() => {
                  if (activeSideBar === "Recent Users") {
                    setActiveSidebar(undefined)
                  } else {
                    setActiveSidebar("Recent Users")
                    setPage(0)
                  }
                }}
              >
                Recent Users
              </h2>
            </div>
          
            {/* Recent Comments Sidebar */}
            <div className="mb-2">
              <h2 className="text-blue-400 underline cursor-pointer text-center"
                onClick={() => {
                  if (activeSideBar === "Recent Comments") {
                    setActiveSidebar(undefined)
                  } else {
                    setActiveSidebar("Recent Comments")
                    setPage(0)
                  }
                }}
              >
                Recent Comments
              </h2>
            </div>

            {/* Recent Flagged Albums Sidebar */}
            <div className="mb-2">
              <h2 className="text-blue-400 underline cursor-pointer text-center"
                onClick={() => {
                  if (activeSideBar === "Recent Flagged Albums") {
                    setActiveSidebar(undefined)
                  } else {
                    setActiveSidebar("Recent Flagged Albums")
                    setPage(0)
                  }
                }}
              >
                Recent Flagged Albums
              </h2>
            </div>

            {/* Recent Flagged Comments Sidebar */}
            <div className="mb-2">
              <h2 className="text-blue-400 underline cursor-pointer text-center"
                onClick={() => {
                  if (activeSideBar === "Recent Flagged Comments") {
                    setActiveSidebar(undefined)
                  } else {
                    setActiveSidebar("Recent Flagged Comments")
                    setPage(0)
                  }
                }}
              >
                Recent Flagged Comments
              </h2>
            </div>
          
            <div className="mb-2">
              <div className="flex flex-col content-center justify-center items-center p-4 w-full">

                {/* Date Filters */}
                <div className="flex flex-row">
                  <div className="flex flex-col mx-1">
                    <div className="flex flex-row m-0.5">
                      <p className="text-center text-gray-400">
                        Start
                      </p>
                      { start &&
                        <input type='button'
                          className="border w-6 rounded-full mx-1 text-xs bg-red-300"
                          onClick={() => setStart(undefined)}
                          value="x"
                        />
                      }
                    </div>
                    <DatePicker
                      className="rounded border border-gray-400 p-0.5 w-20 text-xs text-center shadow"
                      selected={start}
                      onChange={date => setStart(date)}
                    />
                  </div>
                  <div className="flex flex-col mx-1">
                    <div className="flex flex-row m-0.5">
                      <p className="text-center text-gray-400">
                        End
                      </p>
                      { end &&
                        <input type='button'
                          className="border w-6 rounded-full mx-1 text-xs bg-red-300"
                          onClick={() => setStart(undefined)}
                          value="x"
                        />
                      }
                    </div>
                    <DatePicker
                      className="rounded border border-gray-400 p-0.5 w-20 text-xs text-center shadow z-100"
                      selected={end}
                      onChange={date => setEnd(date)}
                    />
                  </div>
                </div>

                {/* Resolved Filter */}
                { activeSideBar?.includes("Flagged") &&
                  <div className="flex flex-row m-0.5 mt-2">
                    <p>Resolved</p>
                    <input type="checkbox"
                      className="ml-2"
                      checked={resolved}
                      onChange={() => setResolved(!resolved)}
                    />
                  </div>
                }

                {/* Page Filter */}
                <div className="flex flex-row m-0.5 mt-2">
                  { page > 0 &&
                    <button
                      onClick={() => setPage(page-1)}
                      className="-0.5 mx-1"
                    >
                    &lt;
                    </button>
                  }
                  <p>Page { page+1 }</p>
                  { showNextPage &&
                    <button
                      onClick={() => setPage(page+1)}
                      className="-0.5 mx-1"
                    >
                    &gt;
                    </button>
                  }
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* End Sidebar */}

        {/* Begin Main */}

        <div className="p-4 flex flex-col flex-wrap w-4/5 bg-gray-100">

          {/* Recent Albums */}
          { activeSideBar === "Recent Albums" &&
            <div className="p-4 flex flex-col bg-white rounded-lg">
              <p className="text-center mb-2 underline font-semibold">Recent Albums</p>

              <div className="grid grid-cols-10 gap-4 border border-gray-400 bg-gray-100 p-0.5 rounded sticky top-0">
                <div className="border-r border-gray-400 col-span-3">Name</div>
                <div className="border-r border-gray-400 col-span-2">Created</div>
                <div className="border-r border-gray-400">Creator</div>
                <div className="border-r border-gray-400">Public?</div>
                <div className="border-r border-gray-400">Home?</div>
                <div className="border-r border-gray-400">Friends?</div>
                <div>URL</div>
              </div>
              { recentAlbums.map(album => {
                return(
                  <div key={album.id}
                    className="grid grid-cols-10 gap-4 border border-gray-400 p-0.5 rounded mt-1 text-sm"
                  >
                    <div className="border-r border-gray-400 col-span-3">{ album.name }</div>
                    <div className="border-r border-gray-400 col-span-2">{ Moment(album.createdAt).format("LLL") }</div>
                    <div className="border-r border-gray-400">{ usersCache[album.userId]?.userName || "..." }</div>
                    <div className="border-r border-gray-400">{ album.isPublic ? "Yes" : "No" }</div>
                    <div className="border-r border-gray-400">
                      { album.isPublic ?
                        <input type="button"
                          className="rounded-md bg-blue-700 text-white py-0.5 px-1 cursor-pointer text-xs shadow-md border border-gray-400"
                          value={album.homeApproved ? "Approved" : "UnApproved"}
                          onClick={onUpdateAlbumHome(album)}
                        />
                        :
                        "N/A"
                      }
                      
                    </div>
                    <div className="border-r border-gray-400">{ album.isViewableByFriends ? "Yes" : "No" }</div>
                    <div>
                      <a className="text-blue-400 underline"
                        href={`/albums/${album.id}`}
                      >
                        Link
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          }

          {/* Recent Users */}
          { activeSideBar === "Recent Users" &&
            <div className="p-4 flex flex-col bg-white rounded-lg">
              <p className="text-center mb-2 underline font-semibold">Recent Users</p>

              <div className="grid grid-cols-5 gap-4 border border-gray-400 bg-gray-100 p-0.5 rounded sticky top-0">
                <div className="border-r border-gray-400">Name</div>
                <div className="border-r border-gray-400">UserName</div>
                <div className="border-r border-gray-400">Email</div>
                <div className="border-r border-gray-400">Created</div>
                <div>Status</div>
              </div>
              { recentUsers.map(user => {
                return(
                  <div key={user.id}
                    className="grid grid-cols-5 gap-4 border border-gray-400 p-0.5 rounded mt-1 text-sm"
                  >
                    <div className="border-r border-gray-400">{ `${user.firstName} ${user.lastName}` }</div>
                    <div className="border-r border-gray-400">{ user.userName }</div>
                    <div className="border-r border-gray-400">{ user.email }</div>
                    <div className="border-r border-gray-400">{ Moment(user.createdAt).format("LLL") }</div>
                    <div>{ user.status }</div>
                  </div>
                )
              })}
            </div>
          }

          {/* Recent Comments */}
          { activeSideBar === "Recent Comments" &&
            <div className="flex flex-col">
              <div className="p-4 flex flex-col bg-white rounded-lg">
                <p className="text-center mb-2 underline font-semibold">Album Comments</p>
                <div className="grid grid-cols-12 gap-4 border border-gray-400 bg-gray-100 p-0.5 rounded sticky top-0">
                  <div className="border-r border-gray-400">Name</div>
                  <div className="border-r border-gray-400">User</div>
                  <div className="border-r border-gray-400 col-span-2">Posted</div>
                  <div className="border-r border-gray-400">Link</div>
                  <div className="col-span-7">Text</div>
                </div>
                { recentAlbumComments.map(comment => {
                  return(
                    <div key={comment.id}
                      className="grid grid-cols-12 gap-4 border border-gray-400 p-0.5 rounded mt-1 text-sm"
                    >
                      <div className="border-r border-gray-400">{ usersCache[comment.userId] ? `${usersCache[comment.userId].firstName} ${usersCache[comment.userId].lastName}` : "..." }</div>
                      <div className="border-r border-gray-400">{ usersCache[comment.userId]?.userName || "..." }</div>
                      <div className="border-r border-gray-400 col-span-2">{ Moment(comment.createdAt).format("LLL") }</div>
                      <div className="border-r border-gray-400">
                        <a className="text-blue-400 underline"
                          href={`/albums/${comment.albumId}`}
                        >
                              Link
                        </a>
                      </div>
                      <div className="col-span-7 overflow-y-scroll">{ comment.text }</div>
                    </div>
                  )
                })}
              </div>

              <div className="p-4 flex flex-col bg-white rounded-lg">
                <p className="text-center mb-2 underline font-semibold">Swing Comments</p>
                <div className="grid grid-cols-12 gap-4 border border-gray-400 bg-gray-100 p-0.5 rounded sticky top-0">
                  <div className="border-r border-gray-400">Name</div>
                  <div className="border-r border-gray-400">User</div>
                  <div className="border-r border-gray-400 col-span-2">Posted</div>
                  <div className="border-r border-gray-400">Link</div>
                  <div className="col-span-7">Text</div>
                </div>
                { recentSwingComments.map(comment => {
                  return(
                    <div key={comment.id}
                      className="grid grid-cols-12 gap-4 border border-gray-400 p-0.5 rounded mt-1 text-sm"
                    >
                      <div className="border-r border-gray-400">{ usersCache[comment.userId] ? `${usersCache[comment.userId].firstName} ${usersCache[comment.userId].lastName}` : "..." }</div>
                      <div className="border-r border-gray-400">{ usersCache[comment.userId]?.userName || "..." }</div>
                      <div className="border-r border-gray-400 col-span-2">{ Moment(comment.createdAt).format("LLL") }</div>
                      <div className="border-r border-gray-400">
                        <a className="text-blue-400 underline"
                          href={`/albums/${comment.albumId}/swings/${comment.swingId}`}
                        >
                          Link
                        </a>
                      </div>
                      <div className="col-span-7 overflow-y-scroll">{ comment.text }</div>
                    </div>
                  )
                })}
              </div>
            </div>
          }

          {/* Recent Flagged Albums */}
          { activeSideBar === "Recent Flagged Albums" &&
            <div className="p-4 flex flex-col bg-white rounded-lg">
              <p className="text-center mb-2 underline font-semibold">Flagged Albums</p>

              <div className="grid grid-cols-5 gap-4 border border-gray-400 bg-gray-100 p-0.5 rounded sticky top-0">
                <div className="border-r border-gray-400">Album</div>
                <div className="border-r border-gray-400">Creator</div>
                <div className="border-r border-gray-400">Created</div>
                <div className="border-r border-gray-400">Resolved</div>
                <div>Link</div>
              </div>
              { recentFlaggedAlbums.map(flag => {
                return(
                  <div key={flag.id}
                    className="grid grid-cols-5 gap-4 border border-gray-400 p-0.5 rounded mt-1 text-sm"
                  >
                    <div className="border-r border-gray-400">{ flag.albumName }</div>
                    <div className="border-r border-gray-400">{ usersCache[flag.albumUserId] ? `${usersCache[flag.albumUserId].firstName} ${usersCache[flag.albumUserId].lastName}` : "..." }</div>
                    <div className="border-r border-gray-400">{ Moment(flag.createdAt).format("LLL") }</div>
                    <div className="border-r border-gray-400">
                      <input type="button"
                        className="rounded-md bg-blue-700 text-white py-0.5 px-1 cursor-pointer text-xs shadow-md border border-gray-400"
                        value={flag.resolved ? "Resolved" : "Unresolved"}
                        onClick={onUpdateAlbumFlag(flag)}
                      />
                    </div>
                    <div>
                      <a className="text-blue-400 underline"
                        href={`/albums/${flag.albumId}`}
                      >
                        Link
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          }

          {/* Recent Flagged Comments */}
          { activeSideBar === "Recent Flagged Comments" &&
            <div className="p-4 flex flex-col bg-white rounded-lg">
              <p className="text-center mb-2 underline font-semibold">Flagged Comments</p>

              <div className="grid grid-cols-12 gap-4 border border-gray-400 bg-gray-100 p-0.5 rounded sticky top-0">
                <div className="border-r border-gray-400">Commentor</div>
                <div className="border-r border-gray-400 col-span-2">Posted</div>
                <div className="border-r border-gray-400">Resolved</div>
                <div className="border-r border-gray-400">Link</div>
                <div className="col-span-7">Text</div>
              </div>
              { recentFlaggedComments.map(flag => {
                return(
                  <div key={flag.id}
                    className="grid grid-cols-12 gap-4 border border-gray-400 p-0.5 rounded mt-1 text-sm"
                  >
                    <div className="border-r border-gray-400">{ usersCache[flag.commenterId] ? `${usersCache[flag.commenterId].firstName} ${usersCache[flag.commenterId].lastName}` : "..." }</div>
                    <div className="border-r border-gray-400 col-span-2">{ Moment(flag.createdAt).format("LLL") }</div>
                    <div className="border-r border-gray-400">
                      <input type="button"
                        className="rounded-md bg-blue-700 text-white py-0.5 px-1 cursor-pointer text-xs shadow-md border border-gray-400"
                        value={flag.resolved ? "Resolved" : "Unresolved"}
                        onClick={onUpdateCommentFlag(flag)}
                      />
                    </div>
                    <div className="border-r border-gray-400">
                      <a className="text-blue-400 underline"
                        href={flag.swingId ? `/albums/${flag.albumId}/swings/${flag.swingId}` : `/albums/${flag.albumId}`}
                      >
                        Link
                      </a>
                    </div>
                    <div className="col-span-7 overflow-y-scroll">{ flag.text }</div>
                  </div>
                )
              })}
            </div>
          }
        </div>
        {/* End Main */}
      </main>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    usersCache: state.usersCache,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getRecentAlbums: GetRecentAlbums(dispatch),
    getRecentAlbumComments: GetRecentAlbumComments(dispatch),
    getRecentFlaggedAlbums: GetRecentFlaggedAlbums(dispatch),
    getRecentFlaggedComments: GetRecentFlaggedComments(dispatch),
    getRecentSwingComments: GetRecentSwingComments(dispatch),
    getRecentUsers: GetRecentUsers(dispatch),
    searchFriends: SearchFriends(dispatch),
    updateAlbum: UpdateAlbum(dispatch),
    updateAlbumFlag: UpdateAlbumFlag(dispatch),
    updateCommentFlag: UpdateCommentFlag(dispatch),
  }
}
  
Admin.propTypes = {
  user: PropTypes.object,
  usersCache: PropTypes.object,

  getRecentAlbums: PropTypes.func,
  getRecentAlbumComments: PropTypes.func,
  getRecentFlaggedAlbums: PropTypes.func,
  getRecentFlaggedComments: PropTypes.func,
  getRecentSwingComments: PropTypes.func,
  getRecentUsers: PropTypes.func,
  searchFriends: PropTypes.func,
  updateAlbum: PropTypes.func,
  updateAlbumFlag: PropTypes.func,
  updateCommentFlag: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(Admin)