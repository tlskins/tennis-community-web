import React, { useState } from "react"
import PropTypes from "prop-types"

import SwingUploader from "./SwingUploader"
import uploadYellow from "../public/upload-yellow.svg"
import uploadBlue from "../public/upload-blue.svg"


const HowToUpload = ({ isFirst }) => {
  const [hoverUpload, setHoverUpload] = useState(false)

  return(
    <div className="p-4 flex flex-row bg-yellow-300 rounded shadow-md mb-3">
      <div className="flex flex-col overflow-auto">
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
                  <div className="mt-2">
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
                      <a href="/albums" className="text-blue-700 underline ml-1">albums</a> page.
                    </li>
                    <li>
                      Delete any swings that are not relevant.
                    </li>
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
}
  
export default HowToUpload