import React from 'react'
import Card from './Card'

function Home() {
  return (
    <div className='home'>
      <span className='page-title'>👋Вітаємо на платформі<span className='emp'> E-pass !</span></span>

      <div className='wrapper'>
      <label>
        <input type="checkbox" className='card-input' />
        <Card />
      </label>
      </div>
    </div>
  )
}

export default Home