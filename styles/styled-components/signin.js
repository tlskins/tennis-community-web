import styled from "@emotion/styled"

export const SignInForm = styled.div`
  display: flex;
  flex-direction: column;
  h2 {
    text-align: center;
    font-family: 'bold';
    color: ${ props => props.theme.gray800 };
    font-size: 30px;
    margin-bottom: 20px;
  }
  button {
    background: ${ props => props.theme.gray800 };
    color: ${ props => props.theme.yellow300 };
    padding: 10px;
    border-radius: 4px;
    font-family: 'bold';
    font-size: 16px;
  }
  p {
    margin-top: 20px;
    font-family: 'regular';
    color: ${ props => props.theme.gray800 };
  }
  .link {
    text-decoration: underline;
    cursor: pointer;
    margin-left: 10px;
    font-family: 'bold';
  }
`

export const SignInInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  label {
    font-family: 'regular';
    font-size: 14px;
    color: ${ props => props.theme.gray800 };
  }
  input {
    border: 1px solid ${ props => props.theme.gray400 };
    padding: 10px;
    border-radius: 4px;
  }
`
