import React from "react"
import PropTypes from "prop-types"
import handleViewport from "react-in-viewport"

const SwingImageContent = ({
  forwardedRef,
  swing,
  onHover = () => {},
}) => {
  return(
    <div className="cursor-pointer"
      ref={forwardedRef}
      id={swing.id}
      onMouseEnter={onHover}
    >
      <div className="flex mx-1 w-64 content-center justify-center items-center">
        <div className="inline-block h-32 w-48">
          <img src={swing.jpgURL}
            className="object-contain"
            alt="loading..."
          />
        </div>
      </div>
    </div>
  )
}

SwingImageContent.propTypes = {
  inViewport: PropTypes.bool,
  swing: PropTypes.object,
  forwardedRef: PropTypes.object,

  onHover: PropTypes.func,
}

export const SwingImage = handleViewport(SwingImageContent)