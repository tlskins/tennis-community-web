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
  }
`

export const HeaderTitleContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  padding: 0 20px;
`

export const HeaderTitle = styled.h1`
  color: #fff;
  font-size: 50px;
  font-family: 'black';
  max-width: 700px;
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
