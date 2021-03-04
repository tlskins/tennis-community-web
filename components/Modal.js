import React, { Component, useRef } from "react"
import close from "../public/close.svg"

import {
  Close,
  ModalOuter,
  ModalInner,
} from "../styles/styled-components"


const Modal = props => {
  const { hideModal, width, children, padding } = props

  return (
    <ModalOuter>
      <ModalInner width={ width } padding={padding}>
        <Close src={ close } onClick={ () => hideModal() }></Close>
        { children }
      </ModalInner>
    </ModalOuter>
  )
}


export default Modal
