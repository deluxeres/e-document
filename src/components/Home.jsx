import React, {useEffect} from 'react'
import Card from './Card'

function Home() {

  useEffect(()=> {
    document.title = "Головна - Navigation"
}, [])

  return (
    <div className='home'>
      <span className='page-title'>👋Вітаємо на платформі<span className='emp'> E-pass !</span></span>

      <div className='wrapper'>
      <label>
        <Card />
      </label>
      </div>
    </div>
  )
}

export default Home