import { useState, useEffect, useRef, useReducer } from "react"

// interval timer

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

// window dimensions

function getWindowDimensions() {
  const isServer = typeof window === "undefined"
  if (isServer) {
    return { width: 1200, height: 700 }
  }

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

    const isServer = typeof window === "undefined"
    if (!isServer) {
      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    }
  }, [])

  return windowDimensions
}

// session persistence https://medium.com/persondrive/persist-data-with-react-hooks-b62ec17e843c

const isObjectLiked = (value) =>
  value.constructor.name == "Array" ||
  value.constructor.name == "Object"

const rehydrate = (value, defaultValue) => {
  if (!value) return defaultValue
  if (value === "false") value = false
  if (value === "true") value = true
  if (!isObjectLiked(value)) {
    return value
  }
  try {
    const parse = JSON.parse(value)
    return parse
  } catch (err) {
    return defaultValue
  }
}

const hydrate = (value) => {
  if (!isObjectLiked(value)) {
    return value
  }
  return JSON.stringify(value)
}

// useSession hook
const config = {
  key: "@hivetennis_session",
}

export const useSession = (state, setState) => {
  const [hydrated, setHydrated] = useState(false)
  // rehydrate data from session storage
  useEffect(() => {
    const value = sessionStorage.getItem(config.key)
    setState(rehydrate(value))
    setHydrated(true)
  }, [])

  // hydrate data to session storage
  useEffect(() => {
    // if (isNil(state) || isEmpty(state)) {
    if (!state) {
      sessionStorage.removeItem(config.key)
    }
    sessionStorage.setItem(hydrate(state))
  }, [state])
  
  return {
    hydrated,
  }
}
