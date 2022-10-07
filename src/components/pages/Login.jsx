import React, {useState} from 'react'
import {Link, useNavigate } from 'react-router-dom'
import {Input, InputGroup, InputLeftAddon} from '@chakra-ui/react'

function Login() {

  const [form, setForm] = useState('')
  const navigate = useNavigate();

  const handleClick = ()=> {
    navigate('/home')
  }

  return (
    <div className='login'>
      <div className='login-wrapper'>
        <div className='login-container'>
            <span className='login-title'>👋 Вiйти до собистого кабiнету</span>
            <span className='login-subtitle'>E-document</span>
          <div className='login-form'>
          <InputGroup>
            <InputLeftAddon children='+380' className="inputAdd"/>
            <Input className="inputNumber" placeholder='95 000 41 51' maxLength="9" />
          </InputGroup>
          <Input placeholder='Ваш пароль' maxLength="40" type="password" />
          </div>
          <div className='login-forgot'>
            <Link to="/home">Забули пароль?</Link>
            <Link to="/home">Зареєструватися</Link>
          </div>
          <div className='login-button'>
            <button onClick={handleClick}>Вiйти</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login