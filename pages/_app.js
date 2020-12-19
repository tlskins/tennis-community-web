import { wrapper } from '../store/store'
import '../styles/index.css'

function WrappedApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default wrapper.withRedux(WrappedApp)