import styled from "@emotion/styled"

export const SidebarContainer = styled.div`
  background: ${ props => props.theme.gray800 };
  min-height: 100%;
  display: block;
  position: sticky;
  top: 0;
  left: 0;
  padding: 40px 20px;
  box-sizing: border-box;
  @media (min-width: 1024px) {
    bottom: 0;
    width: 24vw;
  }
`

export const LinkButton = styled.div`
  a {
    background: ${ props => props.theme.yellow400 };
    width: 100%;
    text-align: center;
    font-family: 'bold';
    color: ${ props => props.theme.gray800 };
    display: block;
    padding: 10px;
    border-radius: 3px;
    text-transform: uppercase;
    font-size: 14px;
    transition: 0.2s ease-in-out all;
    &:hover {
      background: ${ props => props.theme.yellow500 };
    }
  }
`

export const SearchBoxContainer = styled.div`
  width: 100%;
  display: block;
  margin-bottom: 20px;
  svg {
    position: absolute;
    top: 10px;
    right: 10px;
    color: ${ props => props.theme.gray800 };
  }
`

export const SearchBox = styled.input`
  width: 190px;
  padding: 5px 10px;
  font-family: 'regular';
  color: ${ props => props.theme.gray800 };
  border-radius: 2px;
  ::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
    color: ${ props => props.theme.gray500 };
  }
`

export const DateContainer = styled.div`
  width: 100%;
  .date-label {
    color: #fff;
    font-family: 'bold';
    font-size: 13px;
    text-transform: uppercase;
    margin-bottom: 3px;
  }
`

export const DatePickerContainer = styled.div`
  width: 100%;
  position: relative;
  input {
    width: 100%;
    padding: 5px 10px;
    font-family: 'regular';
    border-radius: 2px;
    color: ${ props => props.theme.gray800 };
  }
  svg {
    position: absolute;
    top: 4px;
    right: 5px;
    width: 27px;
    height: 27px;
    cursor: pointer;
    color: ${ props => props.theme.gray800 };
  }
`

export const UserResultBox = styled.div`
  background: ${ props => props.theme.gray700 };
  border-radius: 3px;
  margin-bottom: 10px;
  padding: 15px;
  box-sizing: border-box;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06);
  .username {
    color: ${ props => props.theme.yellow300 };
    font-family: 'bold';
  }
  .fullname {
    color: #fff;
    font-family: 'regular';
    font-size: 14px;
  }
  button {
    width: 100%;
    background: ${ props => props.theme.yellow400 };
    color: ${ props => props.theme.gray800 };
    border-radius: 3px;
    margin-top: 8px;
    font-family: 'bold';
    padding: 5px;
    text-transform: uppercase;
    font-size: 14px;
    transition: 0.2s ease-in-out all;
    &:hover {
      background: ${ props => props.theme.yellow500 };
    }
  }
`
