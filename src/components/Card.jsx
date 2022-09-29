import React, {useState, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'

function Card() {

    const dispatch = useDispatch()

    const [item, setItem] = useState([])

    useEffect(() => {
        fetch("https://62823a7fed9edf7bd880d6a4.mockapi.io/passports")
          .then((res) => {
            return res.json();
          })
          .then((json) => {
            setItem(json);
          });
      }, []);



    // console.log(item);



    return (<>
        {item.map((obj, index) => {
          return (
            <div className='card' key={index}>
              <div className='card-wrapper'>
                <div className='card-header'>
                  <span className='card-country'>{obj.country}</span>
                </div>
                <div className='card-general'>
                  <div className='card-info__top'>
                    <div className='card-info__img'><img src={obj.photo} alt="img"/></div>
                    <div className='card-info__text'>
                      <div className='card-info__text__birth'>
                        <span className='card-info__title'>Дата народження:</span>
                        <span className='card-info__subtitle'>{obj.birthDate}</span>
                      </div>
                      <div className='card-info__text__expiry'>
                        <span className='card-info__title'>Дiйсний до:</span>
                        <span className='card-info__subtitle'>{obj.expiryDate}</span>
                      </div>
                      <div className='card-info__text__sex'>
                        <span className='card-info__title'>Стать:</span>
                        <span className='card-info__subtitle'>{obj.sex}</span>
                      </div>
                    </div>
                  </div>
                  <div className='card-info__bottom'>
                    <div className='card-info__text__surname'>
                      <span className='card-info__title'>Прiзвище/Surname</span>
                      <span className='card-info__subtitle'>{obj.surname}</span>
                    </div>
                    <div className='card-info__text__name'>
                      <span className='card-info__title'>Iм’я/Name</span>
                      <span className='card-info__subtitle'>{obj.name}</span>
                    </div>
                    <div className='card-info__text__patronimyc'>
                      <span className='card-info__title'>По батьковi/Patronimyc</span>
                      <span className='card-info__subtitle'>{obj.patron}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </>)
}

export default Card