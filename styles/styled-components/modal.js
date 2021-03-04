import styled from "@emotion/styled"

export const ModalOuter = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 15;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  &:after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${ props => props.theme.gray800 };
    z-index: -1;
    opacity: 0.8;
  }
`

export const ModalInner = styled.div`
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06);
  background: #fff;
  border-radius: 4px;
  margin: 30px 20px;
  padding: ${ props => props.padding || "30px" };
  max-width: ${ props => props.width };
  width: 100%;
  position: relative;
`

export const Close = styled.img`
  position: absolute;
  right: 7px;
  top: 7px;
  width: 10px;
  height: 10px;
  cursor: pointer;
  padding: 5px;
  z-index: 10;
  box-sizing: content-box;
`
