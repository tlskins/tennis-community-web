import { useState, useEffect, useRef } from "react"

let count = 0
let timerId = undefined

export function useInterval(callback, delay, limit = 0) {
  const savedCallback = useRef()

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    function tick() {
      savedCallback.current()
      count++
      console.log(`polling ${count} / ${limit}`)
      if (limit === 0 || count >= limit) {
        clearInterval(timerId)
      }
    }
    if (delay !== null) {
      timerId = setInterval(tick, delay, limit)
      return () => clearInterval(timerId)
    }
  }, [callback, delay])
}

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window
  return {
    width,
    height
  }
}

export function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions())

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions())
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return windowDimensions
}
