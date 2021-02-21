import React from "react"
import Head from "next/head"

const About = () => {
  return (
    <>
      <Head>
        {/* <!-- HTML Meta Tags --> */}
        <title>Hive Tennis</title>
        <meta name="description" content="Automatically cut swings from your tennis videos! HiveTennis is a platform to quickly cut, analyze, and get feedback on your tennis!" key="desc"/>

        {/* <!-- Facebook Meta Tags --> */}
        <meta property="og:url" content="https://tennis-community-web.vercel.app/" key="ogurl" name="ogurl"/>

        <meta property="og:type" content="website" key="ogtype" name="ogtype"/>
        <meta property="og:title" content="Hive Tennis" key="ogtitle" name="ogtitle"/>
        <meta property="og:description" content="Automatically cut swings from your tennis videos! HiveTennis is a platform to quickly cut, analyze, and get feedback on your tennis!" key="ogdesc" name="ogdesc"/>
        <meta property="og:image" content="https://d198sck6ekbnwc.cloudfront.net/homepage-bg.jpg" key="ogimg" name="ogimg"/>

        {/* <!-- Twitter Meta Tags --> */}
        <meta name="twitter:card" content="summary_large_image" key="twitter_card"/>
        <meta property="twitter:domain" content="tennis-community-web.vercel.app" key="twitter_dom" name="twitter_dom"/>
        <meta property="twitter:url" content="https://tennis-community-web.vercel.app/" key="twitter_url" name="twitter_url"/>
        <meta name="twitter:title" content="Hive Tennis" key="twitter_title"/>
        <meta name="twitter:description" content="Automatically cut swings from your tennis videos! HiveTennis is a platform to quickly cut, analyze, and get feedback on your tennis!" key="twitter_desc"/>
        <meta name="twitter:image" content="https://d198sck6ekbnwc.cloudfront.net/homepage-bg.jpg" key="twitter_img"/>

        {/* <!-- Meta Tags Generated via https://www.opengraph.xyz --> */}
      </Head>
      <div>
            about
      </div>
    </>
  )
}

export default About