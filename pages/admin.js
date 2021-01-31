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
} from "../behavior/coordinators/admin"
import { SearchFriends } from "../behavior/coordinators/friends"
  
let timer

const ALBUMS_LIMIT = 20

const Admin = ({
  user,
  usersCache,
  
  getRecentAlbums,
  searchFriends,
}) => {
  const router = useRouter()

  const [activeSideBar, setActiveSidebar] = useState("Recent Albums")

  const [albumsStartDate, setAlbumsStartDate] = useState(Moment().add(-14, "days").toDate())
  const [albumsEndDate, setAlbumsEndDate] = useState(new Date())
  const [recentAlbums, setRecentAlbums] = useState([])
  const [albumsPage, setAlbumsPage] = useState(0)

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

  useEffect(() => {
    if (recentAlbums.length > 0) {
      const idsSet = new Set([])
      recentAlbums.forEach( album => idsSet.add(album.userId))
      let ids = Array.from(idsSet)
      ids = ids.filter( id => !usersCache[id])
      searchFriends({ ids: [ ...ids] })
    }
  }, [recentAlbums])
  
  const executeAfterTimeout = (func, timeout) => {
    if ( timer ) {
      clearTimeout( timer )
    }
    timer = undefined
    timer = setTimeout(() => {
      func()
    }, timeout )
  }

  //   const onSearchUsers = async e => {
  //     const search = e.target.value
  //     setSearch(search)
  //     executeAfterTimeout(async () => {
  //       if (search) {
  //         const friends = await searchFriends({ search })
  //         setFoundUsers(friends)
  //       } else {
  //         setFoundUsers([])
  //       }
  //     }, 700)
  //   }

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
          </div>
        </div>

        {/* End Sidebar */}

        {/* Begin Main */}

        <div className="p-4 flex flex-col flex-wrap w-4/5 bg-gray-100">

          {/* Recent Albums */}
          <div className="p-4 flex flex-col bg-white">
            <div className="grid grid-cols-9 gap-4 border border-gray-400 bg-gray-100 p-0.5 rounded">
              <div className="border-r border-gray-400 col-span-3">Name</div>
              <div className="border-r border-gray-400 col-span-2">Created</div>
              <div className="border-r border-gray-400">Creator</div>
              <div className="border-r border-gray-400">Public?</div>
              <div className="border-r border-gray-400">Friends?</div>
              <div className="border-r border-gray-400">URL</div>
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
                  <div className="border-r border-gray-400">
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
    searchFriends: SearchFriends(dispatch),
  }
}
  
Admin.propTypes = {
  user: PropTypes.object,
  usersCache: PropTypes.object,

  getRecentAlbums: PropTypes.func,
  searchFriends: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(Admin)