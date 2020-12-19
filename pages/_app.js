import { wrapper } from '../store/store'
import '../styles/globals.css'

function WrappedApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default wrapper.withRedux(WrappedApp)