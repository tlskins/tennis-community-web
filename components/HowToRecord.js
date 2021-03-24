import React, { useState } from "react"
import PropTypes from "prop-types"
import Image from "next/image"

const HowToUpload = () => {
  const [showCamAngles, setShowCamAngles] = useState(false)

  return(
    <ul className="list-disc lg:w-1/2 text-white content-center justify-center items-center px-6">
      <li className="my-2">Record yourself using your mobile phone or any camera in <span className="font-bold text-blue-300">landscape mode</span></li>
      <li className="my-2">Prop up your phone against a water bottle or tennis bag</li>
      <li className="my-2">It's easier to record using the front facing camera to more easily see if you are in frame when recording</li>
      <li className="my-2">
        Currently, only a profile view camera angle
        <span className="underline text-blue-300 cursor-pointer mx-2"
          onMouseEnter={() => setShowCamAngles(true)}
          onMouseLeave={() => setShowCamAngles(false)}
        >
            perpendicular to the baseline or in the corner
        </span>
        is supported, this angle provides a better view of the player's form
      </li>
      { showCamAngles &&
        <Image src="/cam-angles.svg" alt="Camera Angles" width="500" height="400"
          onClick={() => setShowCamAngles(false)}
        />
      }
      <li className="my-2">
        Currently, there is a limit of 400 MB per upload, this translates to about 15 minutes of recording time.
        Videos that are larger will need to be trimmed to about 15 minutes before being uploaded. Most mobile phones have editors that are capable of doing this.
      </li>
    </ul>
  )
}

HowToUpload.propTypes = {
  isFirst: PropTypes.bool,
  isUploadFile: PropTypes.bool,
}
  
export default HowToUpload