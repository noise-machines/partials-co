import { h } from 'preact' /** @jsx h */
import './index.css'
import tssAlbumArtSource from '../tss.png'
// import Router from 'preact-router'

// const routes = (
//   <Router>
//     <Home path='/' />
//   </Router>
// )

const albumArtStyle = {
  backgroundImage: `url(${tssAlbumArtSource})`
}

const App = () => {
  return (
    <div className='album-art' style={albumArtStyle}>
      <div className='border' />
      <div className='text-container'>
        <h2>Partials</h2>
        <a href='https://www.notion.so/partials/Time-Stands-Still-a52aff6f2c8b4b7b8a4c75c5189c01a4'>
          <h1>Time Stands Still</h1>
        </a>
      </div>
    </div>
  )
}

export default App
