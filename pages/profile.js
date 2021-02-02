import React, { useEffect, useState, createRef, Fragment } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import Moment from "moment-timezone"
import { useRouter } from "next/router"
import ReactPlayer from "react-player"

import Notifications from "../components/Notifications"
import SwingUploader from "../components/SwingUploader"
import { UpdateUserProfile } from "../behavior/coordinators/users"
import { SearchFriends } from "../behavior/coordinators/friends"
import { getUserIcons, getUserIcon } from "../behavior/users"
import { LoadAlbums } from "../behavior/coordinators/albums"
import uploadYellow from "../public/upload-yellow.svg"
import uploadBlue from "../public/upload-blue.svg"
import speechBubble from "../public/speech-bubble.svg"

const SWING_FRAMES = 60
const albumsPerColumn = 3

const Profile = ({
  albums,
  user,
  usersCache,
  
  loadAlbums,
  searchFriends,
  updateUserProfile,
}) => {
  const router = useRouter()

  useEffect(() => {
    if (!user || !user.id) {
      router.push("/")
    }
  }, [user])

  if (!user) {
    return(<Fragment/>)
  }

  const [showHowTo, setShowHowTo] = useState(albums?.myAlbums?.length === 0)
  const [hoverUpload, setHoverUpload] = useState(false)
  const [hoverUploadButton, setHoverUploadButton] = useState(false)
  const [email, setEmail] = useState(user.email)
  const [userName, setUserName] = useState(user.userName)
  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName)
  const [iconNumber, setIconNumber] = useState(user.iconNumber)
  const [isPublic, setIsPublic] = useState(user.isPublic)
  const [birthYear, setBirthYear] = useState(user.birthYear)
  const [gender, setGender] = useState(user.gender)
  const [ustaLevel, setUstaLevel] = useState(user.ustaLevel)

  const [playerRefs, setPlayerRefs] = useState([])
  const [playerFrames, setPlayerFrames] = useState({})
  const [playings, setPlayings] = useState([])
  const [pips, setPips] = useState([])
  const [currentSwings, setCurrentSwings] = useState([])
  const [currentComments, setCurrentComments] = useState([])

  const [myAlbumsPage, setMyAlbumsPage] = useState(0)
  const myActiveAlbums = albums?.myAlbums?.slice(myAlbumsPage * albumsPerColumn, (myAlbumsPage+1) * albumsPerColumn).filter( a => !!a ) || []

  useEffect(() => {
    loadAlbums()
  }, [])

  useEffect(() => {
    setShowHowTo(albums?.myAlbums?.length === 0)
  }, [albums?.myAlbums])

  console.log("myActiveAlbums", myActiveAlbums)

  useEffect(() => {
    setPlayerRefs(ref => myActiveAlbums.map((_, i) => ref[i] || createRef()))
    setPlayings(myActiveAlbums.map(() => false))
    setPips(myActiveAlbums.map(() => false))
    setCurrentSwings(myActiveAlbums.map(() => 0))
    setCurrentComments(myActiveAlbums.map(album => {
      let comments = [...(album.comments || []), ...(album.swingVideos.map(swing => (swing.comments || [])).flat())]
      comments = comments.filter( comment => comment.userId !== user.id )
      comments = comments.sort( (a,b) => Moment(a.createdAt).isAfter(Moment(b.createdAt)) ? -1 : 1)
      return comments.slice(0,3).filter( c => !!c )
    }))
  }, [albums.myAlbums, myAlbumsPage])

  useEffect(() => {
    if (currentComments.length > 0) {
      const commentersSet = new Set([])
      currentComments.forEach( comments => {
        comments.forEach( comment => {
          if (!usersCache[comment.userId]) commentersSet.add(comment.userId)
        })
      })
      const ids = Array.from(commentersSet)
      if (ids.length > 0) searchFriends({ ids })
    }
  }, [currentComments])

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

  const renderAlbum = ({ album, i }) => {
    if (!album) {
      return null
    }
    const ref = playerRefs[i]
    const playing = playings[i]
    const pip = pips[i]
    const duration = playerFrames[i]
    const swingIdx = currentSwings[i]
    return(
      <Fragment>
        <ReactPlayer
          className="rounded-md overflow-hidden"
          ref={ref}
          url={album.swingVideos[swingIdx]?.videoURL} 
          playing={playing}
          pip={pip}
          volume={0}
          muted={true}
          loop={true}
          progressInterval={200}
          onProgress={({ played }) => {
            const frame = Math.round(played*SWING_FRAMES)
            setPlayerFrames({
              ...playerFrames,
              [i]: frame,
            })
          }}
          height="200px"
          width="240px"
        />

        {/* Controls Panel */}
        <div className="flex flex-row content-center justify-center py-1 mb-2 bg-gray-300 rounded w-4/5">

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
              console.log("focus!")
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
      <main className="flex flex-1 overflow-y-auto bg-gray-100">

        {/* Begin Main */}

        <div className="p-4 flex flex-col w-full">

          {/* How to upload first album */}
          { showHowTo &&
            <div className="p-4 flex flex-row bg-yellow-300 rounded shadow-md mb-3">
              <div className="flex flex-col">
                <h2 className="font-bold text-lg text-center tracking-wider mb-6 w-full">
                    Upload {albums?.myAlbums?.length > 0 ? "an" : "your first"} album!
                </h2>

                <div className="flex flex-row">
                  <img src={hoverUpload ? uploadBlue : uploadYellow}
                    className="w-80 h-72 mr-10"
                    onMouseEnter={() => setHoverUpload(true)}
                    onMouseLeave={() => setHoverUpload(false)}
                  />
                  <div className="flex-flex-row w-full content-center justify-center items-center">
                    <ol className="list-decimal">
                      <li className="mb-5">
                        <span className="font-semibold">Record yourself playing tennis</span>
                        <div className="pl-6">
                          <ul className="list-disc">
                            <li>Using a mobile phone, or camera, record yourself playing a match, rallying, or hitting against the wall.</li>
                            <li>Aim your phone so that you get a good profile view of yourself. This gives you a better angle of your body for swing analysis.</li>
                            <li>Prop your phone up to get a good angle.</li>
                          </ul>
                        </div>
                      </li>

                      <li className="mb-5">
                        <span className="font-semibold">Upload your video</span>
                        <div className="pl-6">
                          <ul className="list-disc">
                            <li>The upload will take about 10 minutes for the AI to export all the swings into an Album.</li>
                          </ul>
                          <div className="w-96 mt-2">
                            <SwingUploader />
                          </div>
                        </div>
                      </li>

                      <li className="mb-5">
                        <span className="font-semibold">Analyze & comment on your albums</span>
                        <div className="pl-6">
                          <ul className="list-disc">
                            <li>
                            After the upload has finished processing, find your newly created Album here, or on the
                              <a href="/albums" className="text-blue-700 underline ml-1">albums</a> page
                            </li>
                          </ul>
                        </div>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          }

          <div className="grid grid-cols-3 gap-6 content-center justify-center items-start">
                
            {/* Profile */}
            <div className="flex flex-col col-span-2 pt-6 pb-20 px-10 bg-white rounded shadow-lg content-center justify-center items-center static">
              <div className="w-full">
                <h2 className="font-bold text-lg text-center tracking-wider mb-1">
                Profile
                </h2>
                <p className="text-center text-xs tracking-widest underline">Member since { Moment(user.createdAt).format("LLL") }</p>
                <img src={hoverUploadButton ? uploadBlue : uploadYellow}
                  className="w-10 h-8 relative -top-8 cursor-pointer"
                  onMouseEnter={() => {
                    setHoverUpload(true)
                    setHoverUploadButton(true)
                  }}
                  onMouseLeave={() => {
                    setHoverUpload(false)
                    setHoverUploadButton(false)
                  }}
                  onClick={() => setShowHowTo(!showHowTo)}
                />
              </div>

              <div className="flex flex-col content-center justify-center items-center my-5">
                <div className="rounded-xl py-4 px-6 bg-gray-100 border border-gray-200 shadow">
                  <img src={getUserIcon({ ...user, iconNumber })} className="w-20 h-20"/>
                </div>
                <div className="flex flex-row mt-4">
                  { getUserIcons(user).map((icon, i) => {
                    return(
                      <div key={i}
                        className="hover:bg-blue-200 rounded-xl p-3 mx-2 cursor-pointer"
                      >
                        <img src={icon.image}
                          className="w-8 h-8"
                          onClick={() => setIconNumber(icon.number)}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Standard Profile */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="flex flex-col content-center justify-center items-end">
                  <p className="text-right align-center w-28 px-2 py-1 float-right rounded-md font-bold tracking-wide">Email</p>
                  <p className="text-right align-center w-28 px-2 py-1 float-right rounded-md font-bold tracking-wide">User Name</p>
                  <p className="text-right align-center w-28 px-2 py-1 float-right rounded-md font-bold tracking-wide">First Name</p>
                  <p className="text-right align-center w-28 px-2 py-1 float-right rounded-md font-bold tracking-wide mb-4">Last Name</p>
                </div>

                <div className="flex flex-col">
                  <div className="flex flex-row rounded-md px-2 py-1 w-40">
                    <input type="text"
                      className="w-40 px-1 rounded-md bg-gray-200 border border-gray-400 shadow-md"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-row rounded-md px-2 py-1 w-40">
                    <p className="mr-0.5">@</p>
                    <input type="text"
                      className="w-36 px-1 rounded-md bg-gray-200 border border-gray-400 shadow-md"
                      value={userName}
                      onChange={e => setUserName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-row rounded-md px-2 py-1 w-40">
                    <input type="text"
                      className="w-40 px-1 rounded-md bg-gray-200 border border-gray-400 shadow-md"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-row rounded-md px-2 py-1 w-40">
                    <input type="text"
                      className="w-40 px-1 rounded-md bg-gray-200 border border-gray-400 shadow-md"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Expanded Profile */}
              <p className="text-left align-center px-2 py-1 float-right rounded-md tracking-wide text-sm text-gray-700 text-center">
                This profile data helps us connect you with other tennis players and relevant topics
              </p>
              <div className="grid grid-cols-2 gap-4 rounded-lg shadow-md border border-gray-400 py-4 w-3/4">
                <div className="flex flex-col content-center justify-center items-end">
                  <p className="text-right align-center w-28 px-2 py-1 float-right rounded-md font-bold tracking-wide">Public?</p>
                  <p className="text-right align-center w-28 px-2 py-1 float-right rounded-md font-bold tracking-wide">Birth Year</p>
                  <p className="text-right align-center w-28 px-2 py-1 float-right rounded-md font-bold tracking-wide">Gender</p>
                  <p className="text-right align-center w-28 px-2 py-1 float-right rounded-md font-bold tracking-wide">USTA Level</p>
                </div>

                <div className="flex flex-col">
                  <div className="flex flex-row px-2 py-3 w-10 h-10 content-center justify-center">
                    <input type="checkbox"
                      className="shadow-md"
                      checked={isPublic}
                      onChange={() => setIsPublic(!isPublic)}
                    />
                  </div>
                  <div className="flex flex-row rounded-md px-2 py-1 w-40">
                    <input type="text"
                      className="w-40 px-1 rounded-md bg-gray-200 border border-gray-400 shadow-md"
                      value={birthYear || ""}
                      onChange={e => {
                        let val = parseInt(e.target.value)
                        if (!val) val = undefined
                        setBirthYear(val)
                      }}
                    />
                    { birthYear &&
                      <input type="button"
                        className="w-6 h-6 px-1.5 ml-1 shadow-md rounded-xl bg-black text-yellow-300 text-xs font-bold cursor-pointer"
                        value="X"
                        min="1900"
                        maxLength="4"
                        onClick={() => setBirthYear(null)}
                      />
                    }
                  </div>
                  <div className="flex flex-row rounded-md px-2 py-1 w-44">
                    <select onSelect={e => setGender(e.target.value)}
                      value={gender}
                      className="w-44 px-1 rounded-md bg-gray-200 border border-gray-400 shadow-md"
                    >
                      <option value={undefined}>-</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="flex flex-row rounded-md px-2 py-1 w-44">
                    <select onSelect={e => setUstaLevel(e.target.value)}
                      value={ustaLevel}
                      className="w-44 px-1 rounded-md bg-gray-200 border border-gray-400 shadow-md"
                    >
                      <option value={undefined}>-</option>
                      <option value={2.5}>2.5</option>
                      <option value={3.0}>3.0</option>
                      <option value={3.5}>3.5</option>
                      <option value={4.0}>4.0</option>
                      <option value={4.5}>4.5</option>
                      <option value={5.0}>5.0</option>
                      <option value={5.5}>5.5</option>
                      <option value={6.0}>6.0</option>
                      <option value={6.5}>6.5</option>
                      <option value={7.0}>7.0</option>
                    </select>
                  </div>
                
                </div>
              </div>
            </div>

            {/* Recent Albums */}
            <div className="flex flex-col pt-6 pb-20 px-4 h-full bg-white rounded shadow-lg">
              <h2 className="font-bold text-lg text-center tracking-wider mb-4 w-full">
                Recent Albums
              </h2>

              { myActiveAlbums.map((album, i) => {
                return(
                  <div key={i} className="flex flex-row bg-gray-100 mb-6 py-2 pr-2 border-2 border-gray-200 rounded-lg shadow-md">
                    <div className="flex flex-col w-3/5 content-center justify-center items-center pr-1">
                      <p href={`/albums/${album.id}`}
                        className="flex text-xs font-semibold text-blue-400 text-center underline mb-1 px-2 cursor-pointer"
                      >
                        {album.name}
                      </p>
                      { renderAlbum({ album, i }) }
                    </div>

                    <div className="flex flex-col w-2/5 content-center text-center py-4">

                      <div className="flex flex-row px-2 mb-1 content-center justify-center items-center text-center">
                        { album.userId === user.id && 
                          <div className="px-2 mx-1 inline-block rounded-lg bg-yellow-300 border border-gray-400 shadow-md font-semibold text-xs">owner</div>
                        }
                        { album.isPublic && 
                          <div className="px-2 mx-1 rounded-lg bg-blue-300 border border-gray-400 shadow-md font-semibold text-xs">public</div>
                        }
                        { album.isViewableByFriends &&
                          <div className="px-2 mx-1 rounded-lg bg-green-300 border border-gray-400 shadow-md font-semibold text-xs">friends</div>
                        }
                      </div>

                      <p className="text-xs w-full mb-1">
                        <span className="font-semibold">Updated</span> { Moment(album.updatedAt).format("lll") }
                      </p>

                      <div className="flex flex-row content-center justify-center items-center">
                        <p className="text-xs bg-white rounded-lg mx-1 mb-1 text-xs px-1">
                          { album.swingVideos.length } <span className="font-semibold">swings</span>
                        </p>

                        <div className="flex flex-row bg-white rounded-lg mx-1 mb-1 text-xs px-1 w-10">
                          <p className="mr-0.5 text-center">{ (album.comments?.length || 0) + album.swingVideos.reduce((acc, swing) => acc + (swing.comments?.length || 0), 0) }</p>
                          <img src={speechBubble} className="w-5 h-5"/>
                        </div>
                      </div>

                      <div className="h-40 overflow-y-scroll bg-gray-300 p-1 rounded-lg">
                        { (currentComments[i] || []).map((comment, j) => {
                          const poster = usersCache[comment.userId]
                          return(
                            <div key={j} className="px-2 pt-1 mb-1 bg-yellow-300 rounded-lg border border-gray-400 shadow">
                              <textarea disabled={true}
                                className="text-xs bg-gray-100 rounded-md shadow-md w-full"
                                value={comment.text}
                                rows={2}
                              />
                              <p className="text-xs w-full">
                                <span className="font-semibold">poster:</span> { poster ? poster.userName : "..." }
                              </p>
                              <p className="text-xs w-full">
                                <span className="font-semibold">posted:</span> { Moment(album.updatedAt).format("lll") }
                              </p>
                            </div>
                          )
                        })}
                        { (currentComments[i] || []).length === 0 &&
                          <p className="text-xs w-full rounded-lg bg-yellow-300 text-center">No Comments</p>
                        }
                      </div>
                    </div>
                  </div>
                )
              })}

              { myAlbumsPage > 0 &&
                <div className="w-full content-center justify-center items-center mb-1">
                  <input type="button"
                    className="rounded border-2 border-gray-400 w-full text-sm tracking-wider font-bold bg-yellow-300 shadow-md cursor-pointer"
                    value={`Previous Page (${myAlbumsPage})`}
                    onClick={() => setMyAlbumsPage(myAlbumsPage-1)}
                  />
                </div>
              }

              { myActiveAlbums.length === albumsPerColumn &&
                <div className="w-full content-center justify-center items-center">
                  <input type="button"
                    className="rounded border-2 border-gray-400 w-full text-sm tracking-wider font-bold bg-yellow-300 shadow-md cursor-pointer"
                    value={`Next Page (${myAlbumsPage+2})`}
                    onClick={() => setMyAlbumsPage(myAlbumsPage+1)}
                  />
                </div>
              }
            </div>
          </div>
       
        </div>
        {/* End Main */}
      </main>
    </div>
  )
}

const mapStateToProps = (state) => {
  console.log("mapStateToProps", state)
  return {
    albums: state.albums,
    user: state.user,
    usersCache: state.usersCache,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    loadAlbums: LoadAlbums(dispatch),
    searchFriends: SearchFriends(dispatch),
    updateUserProfile: UpdateUserProfile(dispatch),
  }
}
  
Profile.propTypes = {
  albums: PropTypes.object,
  user: PropTypes.object,
  usersCache: PropTypes.object,

  loadAlbums: PropTypes.func,
  searchFriends: PropTypes.func,
  updateUserProfile: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile)