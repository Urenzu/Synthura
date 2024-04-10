import './App.css'
import VideoFrame from './components/VideoFrame.jsx'

function App() {

  return (
    <>
      <VideoFrame srcFeed="https://www.youtube.com/watch?v=XfX2Ap30pwU" className="video-feed" type="addCamera" />
    </>
  )
}

export default App
