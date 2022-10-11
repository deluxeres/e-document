import React, {useState, useEffect} from 'react'
import './welcome.scss'

function Welcome() {

  const [scroll, setScroll] = useState(0)

  const handleScroll = ()=> {
    setScroll(window.scrollY)
  }

  useEffect(()=> {
    window.addEventListener('scroll', handleScroll);
  }, [])

  return (
    <div className="welcome">
        <div className={scroll < 300 ? "start" : "show"}>
        </div>
        <div className={scroll < 700 ? "front" : "frontShow"}>
        </div>
    </div>
  )
}

export default Welcome