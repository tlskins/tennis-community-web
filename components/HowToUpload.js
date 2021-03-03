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
    <div className="p-4 flex flex-row bg-gray-700 rounded shadow-lg mb-3">
      <div className="flex flex-col overflow-auto text-white">
        <h2 className="font-bold text-lg text-center tracking-wider mb-6 w-full">
          Upload {isFirst ? "your first" : "a"} video!
        </h2>

        <div className="flex flex-row lg:content-center overflow-x-hidden">
          <img src={hoverUpload ? uploadBlue : uploadYellow}
            className="w-80 h-72 mr-10 hidden lg:block"
            onMouseEnter={() => setHoverUpload(true)}
            onMouseLeave={() => setHoverUpload(false)}
          />

          <div className="flex-flex-row w-full px-4 lg:px-0 content-center lg:justify-center items-center">
            <ol className="list-decimal overflow-x-hidden">
              <li className="mb-5">
                <span className="font-semibold">Record yourself playing tennis</span>
                <div className="pl-6">
                  <ul className="list-disc">
                    <li>Using a mobile phone, or camera, record yourself playing a match, rallying, or hitting against the wall.</li>
                    <li>Prop your phone up so that you get a good profile view of yourself
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
              </li>

              <li className="mb-5">
                <span className="font-semibold">Upload your video</span>
                <div className="pl-6">
                  <ul className="list-disc">
                    <li>You can upload a video from your computer or phone (most modern phones compress before uploading files now)</li>
                    <li>The upload will take about 10 minutes for the AI to export all the swings into an Album.</li>
                  </ul>
                  { isUploadFile && 
                    <div className="mt-2">
                      <SwingUploader />
                    </div>
                  }
                </div>
              </li>

              <li className="mb-5">
                <span className="font-semibold">Analyze & comment on your albums</span>
                <div className="pl-6">
                  <ul className="list-disc">
                    <li>
                      After the upload has finished processing, find your newly created Album here, or on the
                      <a href="/albums" className="text-blue-300 underline ml-1">albums</a> page.
                    </li>
                    <li>Delete any incorrectly captured swings, this will help correctly track the rallies in the album as well.</li>
                    <li>Albums can also be created from existing album(s).</li>
                  </ul>
                </div>
              </li>
            </ol>
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