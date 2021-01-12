import React from "react"
import { wrapper } from "../state/store"
import "../styles/index.css"
import {PersistGate} from "redux-persist/integration/react"
import {useStore} from "react-redux"

import FlashNotification from "../components/FlashNotification"
import NavBar from "../components/NavBar"

function WrappedApp({ Component, pageProps }) {
  const store = useStore()
  return (
    <PersistGate persistor={store.__persistor} loading={<div>Loading</div>}>
      { <FlashNotification /> }
      <NavBar />
      <Component {...pageProps} />
    </PersistGate>
  )
}

export default wrapper.withRedux(WrappedApp)