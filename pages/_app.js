import React, { Fragment } from "react"
import { wrapper } from "../state/store"
import "../styles/index.css"

import FlashNotification from "../components/FlashNotification"


function WrappedApp({ Component, pageProps }) {
  return (
    <Fragment>
      { <FlashNotification /> }
      <Component {...pageProps} />
    </Fragment>
  )
}

export default wrapper.withRedux(WrappedApp)