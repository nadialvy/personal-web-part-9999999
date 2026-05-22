import { useEffect, useState } from 'react'
import './App.css'
import Home from './pages/Home'
import Play from './pages/Play'
import CursorBubbles from './components/CursorBubbles'

function getPath() {
  return typeof window !== 'undefined' ? window.location.pathname : '/'
}

function App() {
  const [path, setPath] = useState<string>(getPath)

  useEffect(() => {
    function onPopState() {
      setPath(getPath())
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }
      const anchor = (event.target as HTMLElement | null)?.closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href || !href.startsWith('/')) return
      if (anchor.target === '_blank') return
      if (anchor.hasAttribute('download')) return

      event.preventDefault()
      if (href !== window.location.pathname) {
        window.history.pushState(null, '', href)
        setPath(href)
        window.scrollTo(0, 0)
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <>
      {path === '/play' ? <Play /> : <Home />}
      <CursorBubbles />
    </>
  )
}

export default App
