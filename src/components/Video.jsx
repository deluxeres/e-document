import React from 'react'
import VideoMP from '../img/main-background.mp4'

function Video() {
  return (
    <div className='video'>
        <video width="100%" height="100%" autoplay loop>
            <source src={VideoMP} type='video/mp4' />
        </video>
    </div>
  )
}

export default Video