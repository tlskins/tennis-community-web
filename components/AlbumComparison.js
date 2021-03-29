import React, { useState, useEffect, createRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { ImPrevious, ImNext } from "react-icons/im"
import { IconContext } from "react-icons"

import { 
  LoadMyAlbums,
  LoadFriendsAlbums,
  LoadSharedAlbums,
  LoadPublicAlbums,
  LoadProAlbums,
  PostComment,
} from "../behavior/coordinators/albums"
import SwingPlayer from "./SwingPlayer"
import CommentsListAndForm from "./CommentsListAndForm"

const albumTypes = [
  { name: "Pro", value: "pro" },
  { name: "My", value: "my" },
  { name: "Friends", value: "friends" },
  { name: "Requested", value: "shared" },
  { name: "Public", value: "public" },
]

const AlbumComparison = () => {
  const dispatch = useDispatch()
  const loadProAlbums = LoadProAlbums(dispatch)
  const loadMyAlbums = LoadMyAlbums(dispatch)
  const loadFriendsAlbums = LoadFriendsAlbums(dispatch)
  const loadSharedAlbums = LoadSharedAlbums(dispatch)
  const loadPublicAlbums = LoadPublicAlbums(dispatch)
  const postComment = PostComment(dispatch)

  const {
    myAlbums,
    friendsAlbums,
    sharedAlbums,
    publicAlbums,
    proAlbums,
    user,
    usersCache,
  } = useSelector(state => ({
    ...state.albums,
    user: state.user,
    usersCache: state.usersCache,
  }))

  const [albumType, setAlbumType] = useState("pro") // pro - my - friends - shared - public
  const [albums, setAlbums] = useState([])
  const [album, setAlbum] = useState(undefined)
  const [swingIdx, setSwingIdx] = useState(0)

  const [playbackRate, setPlaybackRate] = useState(1)
  const [playerRefs,] = useState([createRef()])
  const [playings, setPlayings] = useState([false])
  const [pips, setPips] = useState([false])
  const [playerFrames, setPlayerFrames] = useState({ 0: 0 })
  const [comments, setComments] = useState([])

  const swing = album?.swingVideos[swingIdx]

  useEffect(async () => {
    let albums = []
    if (albumType === "pro") albums = await loadProAlbums()
    if (albumType === "my") albums = await loadMyAlbums()
    if (albumType === "friends") albums = await loadFriendsAlbums()
    if (albumType === "shared") albums = await loadSharedAlbums()
    if (albumType === "public") albums = await loadPublicAlbums()
    setAlbums(albums)
    setSwingIdx(0)
  }, [albumType])

  useEffect(() => {
    setComments(album?.allComments || [])
  }, [album])

  useEffect(() => {
    if (albums.length > 0) setAlbum(albums[0])
  }, [albums])

  const handleSeekChange = (playerRef, i) => e => {
    const frame = parseFloat(e.target.value)
    if (frame != null) {
      const seekTo = frame === swing.frames ? 0.9999 : parseFloat((frame/swing.frames).toFixed(4))
      playerRef.current.seekTo(seekTo)
      setPlayerFrames({
        ...playerFrames,
        [i]: frame,
      })
    }
  }

  const onPostComment = async args => {
    const album = await postComment(args)
    if (!album) return
    setAlbum(album)
    return album
  }

  return(
    <div className="flex flex-col content-center justify-center items-center mb-2 p-2 bg-white rounded shadow-lg">
      <select className="mt-4 mb-2 p-0.5 border border-gray-500 rounded shadow-md"
        onChange={e => setAlbumType(e.target.value)}
      >
        { albumTypes.map((a, i) => {
          return(
            <option key={i} value={a.value}>{ a.name }</option>
          )
        })}
      </select>

      <select className="mb-4 p-0.5 border border-gray-500 rounded shadow-md"
        onChange={e => setAlbum(albums.find( alb => alb.id === e.target.value ))}
      >
        { albums.map((a, i) => {
          return(
            <option key={i} value={a.id}>{ a.name }</option>
          )
        })}
      </select>

      { swing &&
            <SwingPlayer
              albumId={album?.id}
              swing={swing}
              swingFrames={swing.frames}
              i={0}
              playbackRate={playbackRate}
              pips={pips}
              playings={playings}
              playerFrames={playerFrames}
              playerRefs={playerRefs}
              playerWidth="320px"
              playerHeight="182px"
              handleSeekChange={handleSeekChange}
              setPips={setPips}
              setPlayings={setPlayings}
              setPlayerFrames={setPlayerFrames}
            />
      }

      { album &&
        <a className="text-xs text-blue-400 underline mx-2"
          href={`/albums/${album.id}`}
        >
          { album.name } 
        </a>
      }

      <div className="flex flex-row content-center justify-center items-center mt-1">
        { album &&
            <IconContext.Provider value={{ color: `${swingIdx !== 0 ? "orange" : "gray"}`, size: "30px", left: "0px" }}>
              <div className={`mr-2 content-center justify-center items-center ${swingIdx !== 0 && "cursor-pointer"}`}>
                <ImPrevious onClick={() => {
                  if (swingIdx !== 0) setSwingIdx(swingIdx-1)
                }}/>
              </div>
            </IconContext.Provider>
        }
        
        <div className="flex flex-row content-center justify-center items-center bg-gray-100 rounded p-4">
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
            onClick={() => setPlaybackRate(2)}
            value="2x"
          />
          <input type='button'
            className="w-8 rounded p-0.5 mx-1 text-xs font-bold bg-gray-300 shadow-lg"
            onClick={() => setPlaybackRate(3)}
            value="3x"
          />
        </div>

        { album &&
            <IconContext.Provider value={{ color: `${swingIdx < album.swingVideos.length-1 ? "orange" : "gray"}`, size: "30px", left: "0px" }}>
              <div className={`ml-2 content-center justify-center items-center ${swingIdx < album.swingVideos.length-1 && "cursor-pointer"}`}>
                <ImNext onClick={() => {
                  if (swingIdx < album.swingVideos.length-1) setSwingIdx(swingIdx+1)
                }}/>
              </div>
            </IconContext.Provider>
        }
      </div>

      { album &&
        <div className="my-2 rounded bg-white p-2 w-full">
          <CommentsListAndForm
            albumId={album.id}
            user={user}
            usersCache={usersCache}
            comments={comments}
            swingId={swing.id}
            postComment={onPostComment}
          />
        </div>
      }
    </div>
  )
}

export default AlbumComparison