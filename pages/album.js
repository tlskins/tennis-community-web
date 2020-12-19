import Link from 'next/link'
import { useEffect } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { addCount } from '../store/count/action'
import { wrapper } from '../store/store'
import { serverRenderClock, startClock } from '../store/tick/action'
import Clock from '../components/Clock'
import AddCount from '../components/AddCount'


const Album = ({ startClock, tick }) => {
  const title = "Albums"

  useEffect(() => {
    const timer = startClock()

    return () => {
      clearInterval(timer)
    }
  }, [])

  return (
    <div className="p-8">
      <h1 className="m-12">{title}</h1>
      <Clock lastUpdate={tick.lastUpdate} light={tick.light} />
      <AddCount />
      <nav>
        <Link href="/">
          <a>Navigate</a>
        </Link>
      </nav>
    </div>
  )
}

export const getServerSideProps = wrapper.getServerSideProps(
  async ({ store }) => {
    store.dispatch(serverRenderClock(true))
    store.dispatch(addCount())
  }
)

const mapStateToProps = (state) => state

const mapDispatchToProps = (dispatch) => {
  return {
    addCount: bindActionCreators(addCount, dispatch),
    startClock: bindActionCreators(startClock, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Album)