import React, { Fragment, useState } from "react"
import { connect } from "react-redux"
import PropTypes from "prop-types"
import Link from "next/link"

const NavBar = ({ user }) => {
  if (!user || !user.id) {
    return(<Fragment />)
  }
  const [hoveredLink, setHoveredLink] = useState(undefined)

  return(
    <header className="px-16 bg-white flex flex-wrap items-center border-b border-black">
      <div className="flex-1 flex justify-between items-center">
        <Link href="/">
          <a className="lg:p-4 py-3 px-0 block border-b-2 border-transparent hover:border-indigo-400" href="#">LOGO</a>
        </Link>
      </div>

      <div className="hidden lg:flex lg:items-center lg:w-auto w-full" id="menu">
        <div className="relative inline-flex flex-col align-middle w-full mx-12">
          <div className="lg:p-4 py-3 px-0 block border-b-2 border-transparent hover:border-indigo-400 cursor-pointer"
            onClick={() => setHoveredLink("Albums")}
          >
            Albums
          </div>
          { hoveredLink === "Albums" &&
            <div
              className="absolute text-base z-50 float-left py-2 list-none text-left mt-12"
              style={{ minWidth: "12rem" }}
              onMouseLeave={() => setHoveredLink(undefined)}
            >
              <Link href="/albums/new">
                <div onClick={() => setHoveredLink(undefined)}
                  className="text-sm py-4 px-4 my-2 font-normal block w-full text-center whitespace-no-wrap bg-transparent text-gray-800 rounded bg-white shadow-md hover:underline cursor-pointer hover:text-blue-300"
                >
                    New
                </div>
              </Link>
              <Link href="/albums">
                <div onClick={() => setHoveredLink(undefined)}
                  className="text-sm py-4 px-4 my-2 font-normal block w-full text-center whitespace-no-wrap bg-transparent text-gray-800 rounded bg-white shadow-md hover:underline cursor-pointer hover:text-blue-300"
                >
                    View
                </div>
              </Link>
            </div>
          }
        </div>

        <Link href="/friends">
          <a className="lg:p-4 py-3 px-0 mx-12 block border-b-2 border-transparent hover:border-indigo-400" href="#">Friends</a>
        </Link>

        <Link href="#">
          <a className="lg:p-4 py-3 px-0 ml-12 block border-b-2 border-transparent hover:border-indigo-400" href="#">Profile</a>
        </Link>
      </div>
    </header>
  )
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
  }
}

NavBar.propTypes = {
  user: PropTypes.object,
}
  
  
export default connect(mapStateToProps, undefined)(NavBar)