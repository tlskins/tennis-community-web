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


const PAGE_URL = "hivetennis.com"

function WrappedApp({ Component, pageProps }) {
  const store = useStore()
  console.log("pageprops", pageProps)
  const {
    pageTitle = "Hive Tennis",
    pageDesc = "Automatically cut swings from your tennis videos! Hive Tennis is a platform to quickly cut, analyze, and get feedback on your tennis!",
    ogImage = "https://d198sck6ekbnwc.cloudfront.net/homepage-bg.jpg",
  } = pageProps

  return (
    <>
      <Head>
        {/* <!-- HTML Meta Tags --> */}
        <title>Hive Tennis</title>
        <meta name="description" content={pageDesc} key="desc"/>

        {/* <!-- Facebook Meta Tags --> */}
        <meta property="og:url" content={`https://${PAGE_URL}/`} key="ogurl" name="ogurl"/>

        <meta property="og:type" content="website" key="ogtype" name="ogtype"/>
        <meta property="og:title" content={pageTitle} key="ogtitle" name="ogtitle"/>
        <meta property="og:description" content={pageDesc} key="ogdesc" name="ogdesc"/>
        <meta property="og:image" content={ogImage} key="ogimg" name="ogimg"/>

        {/* <!-- Twitter Meta Tags --> */}
        <meta name="twitter:card" content="summary_large_image" key="twitter_card"/>
        <meta property="twitter:domain" content={PAGE_URL} key="twitter_dom" name="twitter_dom"/>
        <meta property="twitter:url" content={`https://${PAGE_URL}/`} key="twitter_url" name="twitter_url"/>
        <meta name="twitter:title" content={pageTitle} key="twitter_title"/>
        <meta name="twitter:description" content={pageDesc} key="twitter_desc"/>
        <meta name="twitter:image" content={ogImage} key="twitter_img"/>

        {/* <!-- Meta Tags Generated via https://www.opengraph.xyz --> */}
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
