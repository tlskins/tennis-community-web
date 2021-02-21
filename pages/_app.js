import React from "react"
import { wrapper } from "../state/store"
import "../styles/index.css"
import {PersistGate} from "redux-persist/integration/react"
import {useStore} from "react-redux"

import FlashNotification from "../components/FlashNotification"
import NavBar from "../components/NavBar"
import { jsx, ThemeProvider } from "@emotion/react"
import styled from "@emotion/styled"
import colors from "../styles/colors.js"


function WrappedApp({ Component, pageProps }) {
  const store = useStore()
  return (
    <PersistGate persistor={store.__persistor} loading={<div>Loading</div>}>
      <ThemeProvider theme={ colors }>
        { <FlashNotification /> }
        <NavBar />
        <Component {...pageProps} />
      </ThemeProvider>
    </PersistGate>
  )
}

export default wrapper.withRedux(WrappedApp)
