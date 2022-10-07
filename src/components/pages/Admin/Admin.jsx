import React, {useState, useEffect} from 'react'
import {useNavigate } from 'react-router-dom'
import { useToast } from '@chakra-ui/react'
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'

import { store } from '../Admin/store'

function Admin() {

    // useEffect(()=> {
    //     localStorage.setItem('items', JSON.stringify(store.data));
    // })

    // const [object, setObject] = useState(
    //     setObject()
    // )

    const navigate = useNavigate();

    const toast = useToast()


    const formSave = ()=> {
        store({type: 'changeInputName', data: inputName}); 
        store({type: 'changeInputSurname', data: inputSurname});
        store({type: 'changeInputPatric', data: inputPatric});
        store({type: 'changeInputSex', data: inputSex});
        store({type: 'changeInputBirth', data: inputBirth});
        store({type: 'changeInputExpiry', data: inputExpiry});
        store({type: 'changeInputPhoto', data: inputPhoto});  
        store({type: 'changeInputCountry', data: inputCountry}); 


        store({type: 'changeInputVodName', data: inputVodName}); 
        store({type: 'changeInputVodSurname', data: inputVodSurname});
        store({type: 'changeInputVodPatric', data: inputVodPatric});
        store({type: 'changeInputVodCategory', data: inputVodCategory});
        store({type: 'changeInputVodDown', data: inputVodDown});
        store({type: 'changeInputVodNumber', data: inputVodNumber});
        store({type: 'changeInputVodPhoto', data: inputVodPhoto});  
        store({type: 'changeInputVodCountry', data: inputVodCountry}); 

        toast({
          title: 'Форма була збережена',
          description: "Ви можете повернутись до E-document",
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
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

    const [inputVodName, setInputVodName] = useState('')
    const [inputVodSurname, setInputVodSurname] = useState('')
    const [inputVodPatric, setInputVodPatric] = useState('')
    const [inputVodCategory, setInputVodCategory] = useState('')
    const [inputVodDown, setInputVodDown] = useState('')
    const [inputVodNumber, setInputVodNumber] = useState('')
    const [inputVodPhoto, setInputVodPhoto] = useState('')
    const [inputVodCountry, setInputVodCountry] = useState('')
    

  return (
    <div className='admin'>

    <div className='row'>
    <Tabs variant='soft-rounded' colorScheme='blue' className="tabs">
            <TabList>
                <Tab>Паспорт</Tab>
                <Tab>Вод.права</Tab>
            </TabList>
            <TabPanels>
                <TabPanel>
                <div className='admin-wrapper'>
                <span className='admin-wrapper__title'>Admin e-panel</span>
                    <span className='admin-wrapper__subtitle'>📇 Паспорт</span>
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
                                <input className="admin-input" type="text" placeholder='Введiть значення' value={inputBirth} onChange={(e)=> setinputBirth(e.target.value)}/>
                            </div>
                            <div className='admin-form__block'>
                                <p>Expiry date</p>
                                <input className="admin-input" type="text"  placeholder='Введiть значення' value={inputExpiry} onChange={(e)=> setinputExpiry(e.target.value)}/>
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
                </TabPanel>
                <TabPanel>
                <div className='admin-wrapper'>
                <span className='admin-wrapper__title'>Admin e-panel</span>
                    <span className='admin-wrapper__subtitle'>🚔 Водійські права</span>
                    <div className='admin-form'>
                        <div className='admin-form__container'>
                            <div className='admin-form__block'>
                                <p>Категорії</p>
                                <input className="admin-input" type='text' placeholder='Введiть значення' value={inputVodCategory} onChange={(e)=> setInputVodCategory(e.target.value)}/>
                            </div>
                            <div className='admin-form__block'>
                                <p>Видано</p>
                                <input className="admin-input" type='text' placeholder='Введiть значення' value={inputVodDown} onChange={(e)=> setInputVodDown(e.target.value)}/>
                            </div>
                            <div className='admin-form__block'>
                                <p>Номер</p>
                                <input className="admin-input" type='text' placeholder='Введiть значення' value={inputVodNumber} onChange={(e)=> setInputVodNumber(e.target.value)}/>
                            </div>
                            <div className='admin-form__block'>
                                <p>Прiзвище</p>
                                <input className="admin-input" type='text' placeholder='Введiть значення' value={inputVodSurname} onChange={(e)=> setInputVodSurname(e.target.value)}/>
                            </div>
                            <div className='admin-form__block'>
                                <p>Iм’я/Name</p>
                                <input className="admin-input" type="text" placeholder='Введiть значення' value={inputVodName} onChange={(e)=> setInputVodName(e.target.value)}/>
                            </div>
                            <div className='admin-form__block'>
                                <p>По батьковi/Patronimyc</p>
                                <input className="admin-input" type="text"  placeholder='Введiть значення' value={inputVodPatric} onChange={(e)=> setInputVodPatric(e.target.value)}/>
                            </div>
                            <div className='admin-form__block'>
                                <p>Photo</p>
                                <input className="admin-input" type='text' placeholder='Введiть значення' value={inputVodPhoto} onChange={(e)=> setInputVodPhoto(e.target.value)}/>
                            </div>
                            <div className='admin-form__block'>
                                <p>Country</p>
                                <input className="admin-input" type='text' placeholder='Введiть значення' value={inputVodCountry} onChange={(e)=> setInputVodCountry(e.target.value)}/>
                            </div>
                        </div>
                        <div className='admin-form__button'>
                            <button onClick={formSave}>Зберегти</button>
                            <button onClick={formBack}>На головну</button>
                        </div>
                    </div>
                </div>
                </TabPanel>
            </TabPanels>
        </Tabs>
    </div>
    </div>
  )
}

export default Admin