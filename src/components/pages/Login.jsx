import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {Input} from '@chakra-ui/react';
import { toaster } from "../ui/toaster"
import { useDispatch } from 'react-redux';
import { setUser } from '../reducers/userSlice';
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:4000' });

function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleClick = async () => {
    if (!/^\d{10}$/.test(phone)) {
      toaster.create({
        title: 'Невірний номер',
        description: 'Введіть корректний номер телефону',
        type: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top'
      });
      return;
    }

    if (!password) {
      toaster.create({
        title: 'Введіть пароль',
        type: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top'
      });
      return;
    }

    try {
      const { data } = await API.post('/login', { phone, password });

      dispatch(setUser({ user: data.user, token: data.token }));

      toaster.create({
        title: 'Успішний вхід',
        type: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });

      navigate('/home');
    } catch (e) {
      toaster.create({
        title: 'Помилка логіна',
        description: e.response?.data?.error || e.message,
        type: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top'
      });
    }
  };

  return (
      <div className='login'>
        <div className='login-wrapper'>
          <div className='login-container'>
            <span className='login-title'>👋 Особистий кабінет</span>
            <span className='login-subtitle'>E-document</span>

            <div className='login-form'>

              <Input
                  className="inputNumber"
                  placeholder='Номер телефону'
                  maxLength={10}
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  style={{ outline: "none", border: "none" }}
              />

              <Input
                  placeholder='Пароль'
                  maxLength={40}
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ outline: "none", border: "none" }}
              />
            </div>

            <div className='login-button'>
              <button style={{width:'100%'}} onClick={handleClick}>Увійти в систему</button>
            </div>

            <div className='login-forgot'>
              <Link to="/home">Забули пароль?</Link>
              <Link to="/register">Зареєструватися</Link>
            </div>
          </div>
        </div>
      </div>
  )
}

export default Login;