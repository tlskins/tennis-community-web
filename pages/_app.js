import React from "react"
import { Provider } from "react-redux"
import PropTypes from "prop-types"

import FlashNotification from "../components/FlashNotification"
import NavBar from "../components/NavBar"
import { ThemeProvider } from "@emotion/react"
import colors from "../styles/colors.js"
import { store } from "../state/store"
import "../styles/index.css"
// import styled from "@emotion/styled"

const App = ({ Component, pageProps }) => {
  return(
    <>
      <Provider store={store}>
        <ThemeProvider theme={ colors }>
          { <FlashNotification /> }
          <NavBar />
          <Component {...pageProps} />
        </ThemeProvider>
      </Provider>
    </>
  )
}

App.propTypes = {
  Component: PropTypes.func,
  pageProps: PropTypes.object,
}

export default App
