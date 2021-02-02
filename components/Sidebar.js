import React, { Component, useRef } from "react"
import close from "../public/close.svg"

import {
  SidebarContainer,
} from "../styles/styled-components"


const Sidebar = props => {
  const { children } = props

  return (
    <SidebarContainer>
      { children }
    </SidebarContainer>
  )
}


export default Sidebar
