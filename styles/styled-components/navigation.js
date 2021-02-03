import styled from "@emotion/styled"


export const NavigationBar = styled.nav`
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  height: 50px;
  font-family: 'regular';
  border-bottom: 1px solid rgba(156, 163, 175);
  color: ${ props => props.theme.gray800 };
`

export const LinkClass = styled.div`
  a {
    font-family: ${ props => props.active ? 'black' : 'regular' };
  }
`

export const DropdownLink = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  a {
    margin-left: 0;
  }
  .dropdown-container {
    position: absolute;
    width: 150px;
    background: #fff;
    top: 50px;
    z-index: 2;
    flex-direction: column;
    border-radius: 3px;
    text-align: center;
    display: none;
    transform: translate(-30%, 0);
    a {
      padding: 7px 0;
      &:hover {
        background: ${ props => props.theme.gray100 };
        border-radius: 3px;
      }
    }
  }
  &:hover {
    .dropdown-container {
      display: flex;
    }
  }
`

export const LinksContainer = styled.ul`
  display: flex;
  height: 100%;
  align-items: center;
  a {
    padding: 0 5px;
    margin-left: 35px;
  }
`
