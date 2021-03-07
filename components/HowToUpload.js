import React, { useState } from "react"
import PropTypes from "prop-types"
import Image from "next/image"

import SwingUploader from "./SwingUploader"
import uploadYellow from "../public/upload-yellow.svg"
import uploadBlue from "../public/upload-blue.svg"


const HowToUpload = ({ isFirst, isUploadFile }) => {
  const [hoverUpload, setHoverUpload] = useState(false)
  const [showCamAngles, setShowCamAngles] = useState(false)

  return(
    <div className="p-4 flex flex-row bg-gray-800 rounded shadow-lg mb-3">
      <div className="flex flex-col overflow-auto text-white w-full">
        <h2 className="font-bold text-lg text-center tracking-wider mb-6 w-full">
          Upload {isFirst ? "your first" : "a"} video!
        </h2>

        <div className="flex flex-row lg:content-center overflow-x-hidden">
          <img src={hoverUpload ? uploadBlue : uploadYellow}
            className="w-80 h-72 mr-10 hidden lg:block"
            onMouseEnter={() => setHoverUpload(true)}
            onMouseLeave={() => setHoverUpload(false)}
          />

          <div className="flex flex-col px-4 lg:px-0 lg:justify-center overflow-x-hidden w-full">
            <p className="font-bold flex flex-row items-center">
              <span className="p-4 w-12 h-12 mr-2 text-center align-middle text-lg bg-yellow-300 text-gray-800 font-bold rounded">1</span>
              Record
            </p>

            <div className="pl-8 mt-3 mb-5 lg:mt-0 lg:pl-20 w-full">
              <ul className="list-disc text-sm lg:text-base">
                <li>Using your mobile phone, record yourself playing a match, rallying, or hitting against the wall</li>
                <li>Prop your phone up on a water bottle
                  <span className="underline text-blue-300 cursor-pointer ml-2"
                    onMouseEnter={() => setShowCamAngles(true)}
                    onMouseLeave={() => setShowCamAngles(false)}
                  >from the baseline or corner</span>
                </li>
                { showCamAngles &&
                      <Image src="/cam-angles.svg" alt="Camera Angles" width="500" height="400"
                        onClick={() => setShowCamAngles(false)}
                      />
                }
              </ul>
            </div>

            <p className="font-bold flex flex-row items-center">
              <span className="p-4 w-12 h-12 mr-2 text-center align-middle text-lg bg-yellow-300 text-gray-800 font-bold rounded">2</span>
                  Upload
            </p>

            <div className="pl-8 mt-3 mb-5 lg:mt-0 lg:pl-20 w-full">
              <ul className="list-disc text-sm lg:text-base">
                <li>Upload video from your phone (it autocompresses)</li>
                <li>
                  Our <span className="rounded-full mx-1 bg-yellow-300 text-black px-1">Swing Detector</span> will take about 5 minutes to cut the swings from the first 10 mins of the video
                </li>
              </ul>
              { isUploadFile && 
                <div className="mt-2">
                  <SwingUploader />
                </div>
              }
            </div>

            <p className="font-bold flex flex-row items-center">
              <span className="p-4 w-12 h-12 mr-2 text-center align-middle text-lg bg-yellow-300 text-gray-800 font-bold rounded">3</span>
                  Analyze & Share
            </p>

            <div className="pl-8 mt-3 mb-5 lg:mt-0 lg:pl-20 w-full">
              <ul className="list-disc text-sm lg:text-base">
                <li>
                      Find your album on the <a href="/albums" className="text-blue-300 underline ml-1">albums</a> page
                </li>
                <li>Delete any incorrectly captured swings</li>
                <li>Analyze & Share with the community</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

HowToUpload.propTypes = {
  isFirst: PropTypes.bool,
  isUploadFile: PropTypes.bool,
}
  
export default HowToUpload