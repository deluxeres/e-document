import React from 'react'
import {Link} from 'react-router-dom'

function Header() {
  return (
    <div className='header'>
       <div className='container'>
            <Link to="/home" className='logo'>UA</Link>
       </div>
    </div>
  )
}

export default Header