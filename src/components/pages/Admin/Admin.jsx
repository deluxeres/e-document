import React, {useState, useEffect} from 'react'
import {useNavigate } from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'
import {  
    decrement,
    increment,
    incrementByAmount,
    incrementAsync,
    selectData,
} from '../../reducers/dataSlice'

function Admin() {

    const data = useSelector(selectData);
    const dispatch = useDispatch();

    const navigate = useNavigate();

    const formSave = ()=> {
        alert('Форма була збережена')
        console.log(inputName, inputSurname, inputPatric, inputSex);        
    }

    const formBack = ()=> {
        navigate('/')
    }


    const [inputName, setInputName] = useState('')
    const [inputSurname, setInputSurname] = useState('')
    const [inputPatric, setInputPatric] = useState('')
    const [inputSex, setInputSex] = useState('')

  return (
    <div className='admin'>
        <div className='admin-wrapper'>
            <span className='admin-wrapper__title'>Admin e-panel</span>
            <span className='admin-wrapper__subtitle'>E-document</span>
            <div className='admin-form'>
                <div className='admin-form__container'>
                    <div className='admin-form__block'>
                        <p>Name</p>
                        <input className="admin-input" type='text' placeholder='Введiть значення' value={inputName} onChange={(e)=> setInputName(e.target.value)}/>
                    </div>
                    <div className='admin-form__block'>
                        <p>Surname</p>
                        <input className="admin-input" type='text' placeholder='Введiть значення' value={inputSurname} onChange={(e)=> setInputSurname(e.target.value)}/>
                    </div>
                    <div className='admin-form__block'>
                        <p>Patric</p>
                        <input className="admin-input" type='text' placeholder='Введiть значення' value={inputPatric} onChange={(e)=> setInputPatric(e.target.value)}/>
                    </div>
                    <div className='admin-form__block'>
                        <p>Sex</p>
                        <input className="admin-input" type='text' placeholder='Введiть значення' value={inputSex} onChange={(e)=> setInputSex(e.target.value)}/>
                    </div>
                    <div className='admin-form__block'>
                        <p>Date of birth</p>
                        <input className="admin-input" type='text' placeholder='Введiть значення'/>
                    </div>
                    <div className='admin-form__block'>
                        <p>Expiry date</p>
                        <input className="admin-input" type='text' placeholder='Введiть значення'/>
                    </div>
                    <div className='admin-form__block'>
                        <p>Photo</p>
                        <input className="admin-input" type='text' placeholder='Введiть значення'/>
                    </div>
                    <div className='admin-form__block'>
                        <p>Country</p>
                        <input className="admin-input" type='text' placeholder='Введiть значення'/>
                    </div>
                </div>
                <div className='admin-form__button'>
                    <button onClick={dispatch(incrementByAmount(String(inputName) || ''))}>Зберегти</button>
                    <button onClick={formBack}>На головну</button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Admin