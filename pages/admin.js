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
  GetRecentUsers,
  GetRecentAlbumComments,
  GetRecentSwingComments,
} from "../behavior/coordinators/admin"
import { SearchFriends } from "../behavior/coordinators/friends"
  
const ALBUMS_LIMIT = 20
const USERS_LIMIT = 20
const COMMENTS_LIMIT = 20

const Admin = ({
  user,
  usersCache,
  
  getRecentAlbums,
  getRecentUsers,
  getRecentAlbumComments,
  getRecentSwingComments,
  searchFriends,
}) => {
  const router = useRouter()

  const [activeSideBar, setActiveSidebar] = useState("Recent Albums")

  const [albumsStartDate, setAlbumsStartDate] = useState(Moment().add(-14, "days").toDate())
  const [albumsEndDate, setAlbumsEndDate] = useState(new Date())
  const [recentAlbums, setRecentAlbums] = useState([])
  const [albumsPage, setAlbumsPage] = useState(0)

  const [usersStartDate, setUsersStartDate] = useState(Moment().add(-14, "days").toDate())
  const [usersEndDate, setUsersEndDate] = useState(new Date())
  const [recentUsers, setRecentUsers] = useState([])
  const [usersPage, setUsersPage] = useState(0)

  const [commentsStartDate, setCommentsStartDate] = useState(Moment().add(-14, "days").toDate())
  const [commentsEndDate, setCommentsEndDate] = useState(new Date())
  const [recentAlbumComments, setRecentAlbumComments] = useState([])
  const [recentSwingComments, setRecentSwingComments] = useState([])
  const [commentsPage, setCommentsPage] = useState(0)

  useEffect(() => {
    if (!user || !user.id || !user.isAdmin) {
      router.push("/")
    }
  }, [user])

  if (!user) {
    return(<Fragment/>)
  }

  useEffect(async () => {
    if (activeSideBar === "Recent Albums" && albumsStartDate && albumsEndDate) {
      const albums = await getRecentAlbums({ start: albumsStartDate, end: albumsEndDate, limit: ALBUMS_LIMIT, offset: albumsPage*ALBUMS_LIMIT })
      setRecentAlbums(albums)
    }
  }, [activeSideBar, albumsStartDate, albumsEndDate, albumsPage])

  useEffect(async () => {
    if (activeSideBar === "Recent Users" && usersStartDate && usersEndDate) {
      const users = await getRecentUsers({ start: usersStartDate, end: usersEndDate, limit: USERS_LIMIT, offset: usersPage*USERS_LIMIT })
      setRecentUsers(users)
    }
  }, [activeSideBar, usersStartDate, usersEndDate, usersPage])

  useEffect(async () => {
    if (activeSideBar === "Recent Comments" && commentsStartDate && commentsEndDate) {
      const albumComments = await getRecentAlbumComments({ start: commentsStartDate, end: commentsEndDate, limit: COMMENTS_LIMIT, offset: commentsPage*COMMENTS_LIMIT })
      const swingComments = await getRecentSwingComments({ start: commentsStartDate, end: commentsEndDate, limit: COMMENTS_LIMIT, offset: commentsPage*COMMENTS_LIMIT })
      setRecentAlbumComments(albumComments)
      setRecentSwingComments(swingComments)
    }
  }, [activeSideBar, commentsStartDate, commentsEndDate, commentsPage])

  useEffect(() => {
    if (recentAlbums.length > 0) {
      const idsSet = new Set([])
      recentAlbums.forEach( album => idsSet.add(album.userId))
      let ids = Array.from(idsSet)
      ids = ids.filter( id => !usersCache[id])
      searchFriends({ ids: [ ...ids] })
    }
  }, [recentAlbums])

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
                  }
                }}
              >
                Recent Albums
              </h2>
              <div className="mb-2">
                { activeSideBar === "Recent Albums" &&
                    <div className="flex flex-col content-center justify-center items-center p-4 w-full">
                      <div className="flex flex-row">
                        <div className="flex flex-col mx-1">
                          <div className="flex flex-row m-0.5">
                            <p className="text-center text-gray-400">
                                Start
                            </p>
                            { albumsStartDate &&
                                <input type='button'
                                  className="border w-6 rounded-full mx-1 text-xs bg-red-300"
                                  onClick={() => setAlbumsStartDate(undefined)}
                                  value="x"
                                />
                            }
                          </div>
                          <DatePicker
                            className="rounded border border-gray-400 p-0.5 w-20 text-xs text-center shadow"
                            selected={albumsStartDate}
                            onChange={date => setAlbumsStartDate(date)}
                          />
                        </div>
                        <div className="flex flex-col mx-1">
                          <div className="flex flex-row m-0.5">
                            <p className="text-center text-gray-400">
                                End
                            </p>
                            { albumsEndDate &&
                                <input type='button'
                                  className="border w-6 rounded-full mx-1 text-xs bg-red-300"
                                  onClick={() => setAlbumsEndDate(undefined)}
                                  value="x"
                                />
                            }
                          </div>
                          <DatePicker
                            className="rounded border border-gray-400 p-0.5 w-20 text-xs text-center shadow z-100"
                            selected={albumsEndDate}
                            onChange={date => setAlbumsEndDate(date)}
                          />
                        </div>
                      </div>
                      <div className="flex flex-row m-0.5 mt-2">
                        { albumsPage > 0 &&
                            <button
                              onClick={() => setAlbumsPage(albumsPage-1)}
                              className="-0.5 mx-1"
                            >
                            &lt;
                            </button>
                        }
                        <p>Page { albumsPage+1 }</p>
                        { recentAlbums.length === ALBUMS_LIMIT &&
                            <button
                              onClick={() => setAlbumsPage(albumsPage+1)}
                              className="-0.5 mx-1"
                            >
                            &gt;
                            </button>
                        }
                      </div>
                    </div>
                }
              </div>
            </div>
          
            {/* Recent Users Sidebar */}
            <div className="mb-2">
              <h2 className="text-blue-400 underline cursor-pointer text-center"
                onClick={() => {
                  if (activeSideBar === "Recent Users") {
                    setActiveSidebar(undefined)
                  } else {
                    setActiveSidebar("Recent Users")
                  }
                }}
              >
                Recent Users
              </h2>
              <div className="mb-2">
                { activeSideBar === "Recent Users" &&
                    <div className="flex flex-col content-center justify-center items-center p-4 w-full">
                      <div className="flex flex-row">
                        <div className="flex flex-col mx-1">
                          <div className="flex flex-row m-0.5">
                            <p className="text-center text-gray-400">
                                Start
                            </p>
                            { usersStartDate &&
                                <input type='button'
                                  className="border w-6 rounded-full mx-1 text-xs bg-red-300"
                                  onClick={() => setUsersStartDate(undefined)}
                                  value="x"
                                />
                            }
                          </div>
                          <DatePicker
                            className="rounded border border-gray-400 p-0.5 w-20 text-xs text-center shadow"
                            selected={usersStartDate}
                            onChange={date => setUsersStartDate(date)}
                          />
                        </div>
                        <div className="flex flex-col mx-1">
                          <div className="flex flex-row m-0.5">
                            <p className="text-center text-gray-400">
                                End
                            </p>
                            { usersEndDate &&
                                <input type='button'
                                  className="border w-6 rounded-full mx-1 text-xs bg-red-300"
                                  onClick={() => setUsersEndDate(undefined)}
                                  value="x"
                                />
                            }
                          </div>
                          <DatePicker
                            className="rounded border border-gray-400 p-0.5 w-20 text-xs text-center shadow z-100"
                            selected={usersEndDate}
                            onChange={date => setUsersEndDate(date)}
                          />
                        </div>
                      </div>
                      <div className="flex flex-row m-0.5 mt-2">
                        { usersPage > 0 &&
                            <button
                              onClick={() => setUsersPage(usersPage-1)}
                              className="-0.5 mx-1"
                            >
                            &lt;
                            </button>
                        }
                        <p>Page { usersPage+1 }</p>
                        { recentUsers.length === USERS_LIMIT &&
                            <button
                              onClick={() => setUsersPage(usersPage+1)}
                              className="-0.5 mx-1"
                            >
                            &gt;
                            </button>
                        }
                      </div>
                    </div>
                }
              </div>
            </div>
          
            {/* Recent Comments Sidebar */}
            <div className="mb-2">
              <h2 className="text-blue-400 underline cursor-pointer text-center"
                onClick={() => {
                  if (activeSideBar === "Recent Comments") {
                    setActiveSidebar(undefined)
                  } else {
                    setActiveSidebar("Recent Comments")
                  }
                }}
              >
                Recent Comments
              </h2>
              <div className="mb-2">
                { activeSideBar === "Recent Comments" &&
                    <div className="flex flex-col content-center justify-center items-center p-4 w-full">
                      <div className="flex flex-row">
                        <div className="flex flex-col mx-1">
                          <div className="flex flex-row m-0.5">
                            <p className="text-center text-gray-400">
                                Start
                            </p>
                            { commentsStartDate &&
                                <input type='button'
                                  className="border w-6 rounded-full mx-1 text-xs bg-red-300"
                                  onClick={() => setCommentsStartDate(undefined)}
                                  value="x"
                                />
                            }
                          </div>
                          <DatePicker
                            className="rounded border border-gray-400 p-0.5 w-20 text-xs text-center shadow"
                            selected={commentsStartDate}
                            onChange={date => setCommentsStartDate(date)}
                          />
                        </div>
                        <div className="flex flex-col mx-1">
                          <div className="flex flex-row m-0.5">
                            <p className="text-center text-gray-400">
                                End
                            </p>
                            { commentsEndDate &&
                                <input type='button'
                                  className="border w-6 rounded-full mx-1 text-xs bg-red-300"
                                  onClick={() => setCommentsStartDate(undefined)}
                                  value="x"
                                />
                            }
                          </div>
                          <DatePicker
                            className="rounded border border-gray-400 p-0.5 w-20 text-xs text-center shadow z-100"
                            selected={commentsEndDate}
                            onChange={date => setCommentsEndDate(date)}
                          />
                        </div>
                      </div>
                      <div className="flex flex-row m-0.5 mt-2">
                        { commentsPage > 0 &&
                            <button
                              onClick={() => setCommentsPage(commentsPage-1)}
                              className="-0.5 mx-1"
                            >
                            &lt;
                            </button>
                        }
                        <p>Page { commentsPage+1 }</p>
                        { (recentAlbumComments.length === COMMENTS_LIMIT || recentSwingComments.length === COMMENTS_LIMIT) &&
                            <button
                              onClick={() => setCommentsPage(commentsPage+1)}
                              className="-0.5 mx-1"
                            >
                            &gt;
                            </button>
                        }
                      </div>
                    </div>
                }
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
              <div className="grid grid-cols-9 gap-4 border border-gray-400 bg-gray-100 p-0.5 rounded sticky top-0">
                <div className="border-r border-gray-400 col-span-3">Name</div>
                <div className="border-r border-gray-400 col-span-2">Created</div>
                <div className="border-r border-gray-400">Creator</div>
                <div className="border-r border-gray-400">Public?</div>
                <div className="border-r border-gray-400">Friends?</div>
                <div>URL</div>
              </div>
              { recentAlbums.map(album => {
                return(
                  <div key={album.id}
                    className="grid grid-cols-9 gap-4 border border-gray-400 p-0.5 rounded mt-1 text-sm"
                  >
                    <div className="border-r border-gray-400 col-span-3">{ album.name }</div>
                    <div className="border-r border-gray-400 col-span-2">{ Moment(album.createdAt).format("LLL") }</div>
                    <div className="border-r border-gray-400">{ usersCache[album.userId]?.userName || "..." }</div>
                    <div className="border-r border-gray-400">{ album.isPublic ? "Yes" : "No" }</div>
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
    getRecentUsers: GetRecentUsers(dispatch),
    getRecentAlbumComments: GetRecentAlbumComments(dispatch),
    getRecentSwingComments: GetRecentSwingComments(dispatch),
    searchFriends: SearchFriends(dispatch),
  }
}
  
Admin.propTypes = {
  user: PropTypes.object,
  usersCache: PropTypes.object,

  getRecentAlbums: PropTypes.func,
  getRecentUsers: PropTypes.func,
  getRecentAlbumComments: PropTypes.func,
  getRecentSwingComments: PropTypes.func,
  searchFriends: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(Admin)