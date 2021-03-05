import React from "react"
import Head from "next/head"
import PropTypes from "prop-types"

const PAGE_URL = "tennis-community-web.vercel.app"

const PageHead = ({
  title = "Hive Tennis",
  desc = "Automatically cut swings from your tennis videos! Hive Tennis is a platform to quickly cut, analyze, and get feedback on your tennis!",
  img = "https://d198sck6ekbnwc.cloudfront.net/homepage-bg.jpg",
}) => {
  return(
    <Head>
      <script async
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
          
            gtag('config', ${process.env.NEXT_PUBLIC_GTM_ID});
        `,}}>
      </script>

      <title>Hive Tennis Album</title>
      <meta name="description" content="Check out this album of my tennis swings!"/>

      {/* <meta property="og:url" content="https://tennis-community-web.vercel.app/"/> */}
      <meta property="og:type" content="website"/>
      <meta property="og:title" content={title}/>
      <meta property="og:description" content={desc}/>
      <meta property="og:image" content={img}/>

      <meta name="twitter:card" content="summary_large_image"/>
      <meta property="twitter:domain" content={PAGE_URL}/>
      <meta property="twitter:url" content={`https://${PAGE_URL}/`}/>
      <meta name="twitter:title" content={title}/>
      <meta name="twitter:description" content={desc}/>
      <meta name="twitter:image" content={img}/>
    </Head>
  )
}

PageHead.propTypes = {
  title: PropTypes.string,
  desc: PropTypes.string,
  img: PropTypes.string,
}  

export default PageHead