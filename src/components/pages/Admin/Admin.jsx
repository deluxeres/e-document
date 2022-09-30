import React, {useState, useEffect} from 'react'
import {useNavigate } from 'react-router-dom'

import { store } from '../Admin/store'

function Admin() {

    // useEffect(()=> {
    //     localStorage.setItem('items', JSON.stringify(store.data));
    // })

    // const [object, setObject] = useState(
    //     setObject()
    // )

    const navigate = useNavigate();

    const formSave = ()=> {
        store({type: 'changeInputName', data: inputName}); 
        store({type: 'changeInputSurname', data: inputSurname});
        store({type: 'changeInputPatric', data: inputPatric});
        store({type: 'changeInputSex', data: inputSex});
        store({type: 'changeInputBirth', data: inputBirth});
        store({type: 'changeInputExpiry', data: inputExpiry});
        store({type: 'changeInputPhoto', data: inputPhoto});  
        store({type: 'changeInputCountry', data: inputCountry}); 
    }

    const formBack = ()=> {
        navigate('/')
    }



    const [inputName, setInputName] = useState('')
    const [inputSurname, setInputSurname] = useState('')
    const [inputPatric, setInputPatric] = useState('')
    const [inputSex, setInputSex] = useState('')
    const [inputBirth, setinputBirth] = useState('')
    const [inputExpiry, setinputExpiry] = useState('')
    const [inputPhoto, setinputPhoto] = useState('')
    const [inputCountry, setinputCountry] = useState('')

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
                        <input className="admin-input" type='text' placeholder='Введiть значення' value={inputBirth} onChange={(e)=> setinputBirth(e.target.value)}/>
                    </div>
                    <div className='admin-form__block'>
                        <p>Expiry date</p>
                        <input className="admin-input" type='text' placeholder='Введiть значення' value={inputExpiry} onChange={(e)=> setinputExpiry(e.target.value)}/>
                    </div>
                    <div className='admin-form__block'>
                        <p>Photo</p>
                        <input className="admin-input" type='text' placeholder='Введiть значення' value={inputPhoto} onChange={(e)=> setinputPhoto(e.target.value)}/>
                    </div>
                    <div className='admin-form__block'>
                        <p>Country</p>
                        <input className="admin-input" type='text' placeholder='Введiть значення' value={inputCountry} onChange={(e)=> setinputCountry(e.target.value)}/>
                    </div>
                </div>
                <div className='admin-form__button'>
                    <button onClick={formSave}>Зберегти</button>
                    <button onClick={formBack}>На головну</button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Admin