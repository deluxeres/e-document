import React, {useState} from 'react'
import {Link} from 'react-router-dom'

function Header() {

  const [modal, setModal] = useState(false)

  return (
    <div className='header'>
       <div className='header__container'>
            <Link to="/home" className='logo'>UA</Link>
            <button className='header__menu' onClick={()=> setModal(!modal)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="#ffffff" viewBox="0 0 30 30" width="35px" height="35px"><path d="M 3 7 A 1.0001 1.0001 0 1 0 3 9 L 27 9 A 1.0001 1.0001 0 1 0 27 7 L 3 7 z M 3 14 A 1.0001 1.0001 0 1 0 3 16 L 27 16 A 1.0001 1.0001 0 1 0 27 14 L 3 14 z M 3 21 A 1.0001 1.0001 0 1 0 3 23 L 27 23 A 1.0001 1.0001 0 1 0 27 21 L 3 21 z"/>
              </svg>
              <div className={modal ? ["header__menu", "active"].join(" ") : "header__menu"}>
                <div className='header__menu__nav'>
                  <nav>
                    <li>
                      <Link to="/admin">Admin Panel</Link>
                    </li>
                    <li>
                      <Link to="/">На головну</Link>
                    </li>
                  </nav>
                </div>
            </div>
            </button>
       </div>
    </div>
  )
}

export default Header