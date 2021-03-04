import React from "react"
import { wrapper } from "../state/store"
import "../styles/index.css"
import {PersistGate} from "redux-persist/integration/react"
import {useStore} from "react-redux"
import Head from "next/head"
import PropTypes from "prop-types"

import FlashNotification from "../components/FlashNotification"
import NavBar from "../components/NavBar"
import { jsx, ThemeProvider } from "@emotion/react"
import styled from "@emotion/styled"
import colors from "../styles/colors.js"


const PAGE_URL = "tennis-community-web.vercel.app"

function WrappedApp({ Component, pageProps }) {
  const store = useStore()
  const { head: { title, desc, img } } = store.getState()

  return (
    <>
      <Head>
        <title>Hive Tennis</title>
        <meta name="description" content={desc} key="desc"/>

        <meta property="og:url" content={`https://${PAGE_URL}/`} key="ogurl" name="ogurl"/>

        <meta property="og:type" content="website" key="ogtype" name="ogtype"/>
        <meta property="og:title" content={title} key="ogtitle" name="ogtitle"/>
        <meta property="og:description" content={desc} key="ogdesc" name="ogdesc"/>
        <meta property="og:image" content={img} key="ogimg" name="ogimg"/>

        <meta name="twitter:card" content="summary_large_image" key="twitter_card"/>
        <meta property="twitter:domain" content={PAGE_URL} key="twitter_dom" name="twitter_dom"/>
        <meta property="twitter:url" content={`https://${PAGE_URL}/`} key="twitter_url" name="twitter_url"/>
        <meta name="twitter:title" content={title} key="twitter_title"/>
        <meta name="twitter:description" content={desc} key="twitter_desc"/>
        <meta name="twitter:image" content={img} key="twitter_img"/>
      </Head>
      <PersistGate persistor={store.__persistor} loading={<div>Loading</div>}>
        <ThemeProvider theme={ colors }>
          { <FlashNotification /> }
          <NavBar />
          <Component {...pageProps} />
        </ThemeProvider>
      </PersistGate>
    </>
  )
}

WrappedApp.propTypes = {
  Component: PropTypes.object,
  pageProps: PropTypes.object,
}

export default wrapper.withRedux(WrappedApp)
