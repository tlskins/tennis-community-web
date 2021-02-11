import React, { Component, useRef } from "react"

import {
  ChartContainer as ChartContainerStyles,
} from "../styles/styled-components"


const ChartContainer = props => {
  const { children } = props

  return (
    <ChartContainerStyles {...props}>
      { children }
    </ChartContainerStyles>
  )
}


export default ChartContainer
