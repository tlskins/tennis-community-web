import styled from '@emotion/styled'

export const Header = styled.header`
  background: black;
  background: url(${ props => props.bg }) no-repeat center center;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  width: 100%;
  height: 80vh;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.8;
    width: 100%;
    height: 100%;
    background: rgb(250,204,21);
    background: linear-gradient(262deg, #f57c00 0%, ${ props => props.theme.gray900 } 60%);
    z-index: -1;
    @media (max-width: 800px ) {
      background: ${ props => props.theme.gray900 };
      opacity: 0.85;
    }
  }
  @media (max-width: 800px ) {
    background: url(${ props => props.mobileBg }) no-repeat center center;
    height: 90vh;
  }
`

export const HeaderTitleContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  padding: 0 20px;
`

export const HeaderTitle = styled.h1`
  color: #fff;
  font-size: 55px;
  font-family: 'black';
  max-width: 750px;
  @media (max-width: 800px ) {
    font-size: 35px;
  }
`

export const CTAButton = styled.button`
  margin-top: 30px;
  background: ${ props => props.theme.yellow300 };
  color: ${ props => props.theme.gray800 };
  font-family: 'bold';
  padding: 10px 40px;
  font-size: 20px;
  transition: 0.2s ease-in-out all;
  &:hover {
    background: ${ props => props.theme.yellow400 };
  }
`

export const Section = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${ props => props.bg || '#fff' };
`

export const IconSection = styled.div`
  display: flex;
  width: 100%;
  max-width: 1200px;
  padding: 0 20px;
  margin: 80px 0;
  justify-content: space-between;
  @media (max-width: 800px ) {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 0;
  }
`

export const IconContainer = styled.div`
  width: 28%;
  text-align: center;
  img {
    width: 100px;
    margin: auto;
  }
  h3 {
    font-family: 'bold';
    margin-top: 20px;
    font-size: 20px;
    color: ${ props => props.theme.gray800 };
  }
  p {
    font-family: 'regular';
    margin-top: 10px;
    font-size: 16px;
    color: ${ props => props.theme.gray800 };
  }
  @media (max-width: 800px ) {
    width: 80%;
    margin-bottom: 80px;
  }
`

export const VideoSection = styled.div`
  padding: 50px 20px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  h2 {
    margin-bottom: 20px;
    color: #fff;
    font-family: 'bold';
    font-size: 40px;
    text-align: center;
    @media (max-width: 800px ) {
      font-size: 30px;
    }
  }
  iframe {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
`

export const VideoWrapper = styled.div`
  width: 100%;
  max-width: 900px;
  height: 100%;
`

export const VideoInnerWrapper = styled.div`
  position: relative;
  padding-bottom: 56.25%;
`

export const CommunityVideos = styled.div`
  padding: 50px 20px;
  h2 {
    margin-bottom: 20px;
    color: ${ props => props.theme.gray800 };
    font-family: 'bold';
    font-size: 40px;
    text-align: center;
    @media (max-width: 800px ) {
      font-size: 30px;
    }
  }
`

export const Footer = styled.footer`
  background: black;
  background: url(${ props => props.bg }) no-repeat center bottom;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  width: 100%;
  height: 250px;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.8;
    width: 100%;
    height: 100%;
    background: rgb(250,204,21);
    background: linear-gradient(250deg, #f57c00 0%, ${ props => props.theme.gray900 } 45%);
    z-index: -1;
    @media (max-width: 800px ) {
      background: ${ props => props.theme.gray900 };
      opacity: 0.85;
    }
  }
  @media (max-width: 800px ) {
    background: url(${ props => props.mobileBg }) no-repeat center center;
    height: 200px;
  }
`

export const FooterInner = styled.div`
  padding: 0 20px;
  text-align: center;
  .footer-title {
    font-family: 'bold';
    color: #fff;
    font-size: 30px;
    @media (max-width: 800px ) {
      font-size: 25px;
    }
  }
  .footer-subtitle {
    font-family: 'light';
    color: #fff;
    font-size: 23px;
    @media (max-width: 800px ) {
      font-size: 20px;
    }
  }
  a {
    color: ${ props => props.theme.yellow300 };
  }
`
