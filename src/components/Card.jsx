import React, { useState, useEffect } from "react";
import { store } from "./pages/Admin/store";
// import {useSelector, useDispatch} from 'react-redux'

function Card() {
  const [string, setString] = useState("");

  useEffect(() => {
    //тут какой то код
    const fieldData = store({ type: "" });
    // Далее расставляйте полученный значения по элементам или в state записывайте
    setString(fieldData);
  }, []);

  // const dispatch = useDispatch()

  const [item, setItem] = useState([]);

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

  return (
    <div className="card">
      <div className="card-wrapper">
        <div className="card-header">
          <span className="card-country">{string.inputCountry}</span>
          <p>Паспорт</p>
        </div>
        <div className="card-general">
          <div className="card-info__top">
            <div className="card-info__img">
              <img src={string.inputPhoto} alt="img" />
            </div>
            <div className="card-info__text">
              <div className="card-info__text__birth">
                <span className="card-info__title">Дата народження:</span>
                <span className="card-info__subtitle">{string.inputBirth}</span>
              </div>
              <div className="card-info__text__expiry">
                <span className="card-info__title">Дiйсний до:</span>
                <span className="card-info__subtitle">
                  {string.inputExpiry}
                </span>
              </div>
              <div className="card-info__text__sex">
                <span className="card-info__title">Стать:</span>
                <span className="card-info__subtitle">{string.inputSex}</span>
              </div>
            </div>
          </div>
          <div className="card-info__bottom">
            <div className="card-info__text__surname">
              <span className="card-info__title">Прiзвище/Surname</span>
              <span className="card-info__subtitle">{string.inputSurname}</span>
            </div>
            <div className="card-info__text__name">
              <span className="card-info__title">Iм’я/Name</span>
              <span className="card-info__subtitle">{string.inputName}</span>
            </div>
            <div className="card-info__text__patronimyc">
              <span className="card-info__title">По батьковi/Patronimyc</span>
              <span className="card-info__subtitle">{string.inputPatric}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="card-back">
        <div className="card-wrapper">
          <div className="card-header">
            <span className="card-country">{string.inputVodCountry}</span>
            <p>Посвідчення водія</p>
          </div>
          <div className="card-general">
            <div className="card-info__top">
              <div className="card-info__img">
                <img src={string.inputVodPhoto} alt="img" />
              </div>
              <div className="card-info__text">
                <div className="card-info__text__birth">
                  <span className="card-info__title">Категорії</span>
                  <span className="card-info__subtitle">
                    {string.inputVodCategory}
                  </span>
                </div>
                <div className="card-info__text__expiry">
                  <span className="card-info__title">Видано</span>
                  <span className="card-info__subtitle">
                    {string.inputVodDown}
                  </span>
                </div>
                <div className="card-info__text__sex">
                  <span className="card-info__title">Номер</span>
                  <span className="card-info__subtitle">{string.inputVodNumber}</span>
                </div>
              </div>
            </div>
            <div className="card-info__bottom">
              <div className="card-info__text__surname">
                <span className="card-info__title">Прiзвище</span>
                <span className="card-info__subtitle">
                  {string.inputVodSurname}
                </span>
              </div>
              <div className="card-info__text__name">
                <span className="card-info__title">Iм’я/Name</span>
                <span className="card-info__subtitle">{string.inputVodName}</span>
              </div>
              <div className="card-info__text__patronimyc">
                <span className="card-info__title">По батьковi/Patronimyc</span>
                <span className="card-info__subtitle">
                  {string.inputVodPatric}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // return (<>
  //     {item.map((obj, index) => {
  //       return (
  //         <div className='card' key={index}>
  //           <div className='card-wrapper'>
  //             <div className='card-header'>
  //               <span className='card-country'>{obj.country}</span>
  //             </div>
  //             <div className='card-general'>
  //               <div className='card-info__top'>
  //                 <div className='card-info__img'><img src={obj.photo} alt="img"/></div>
  //                 <div className='card-info__text'>
  //                   <div className='card-info__text__birth'>
  //                     <span className='card-info__title'>Дата народження:</span>
  //                     <span className='card-info__subtitle'>{obj.birthDate}</span>
  //                   </div>
  //                   <div className='card-info__text__expiry'>
  //                     <span className='card-info__title'>Дiйсний до:</span>
  //                     <span className='card-info__subtitle'>{obj.expiryDate}</span>
  //                   </div>
  //                   <div className='card-info__text__sex'>
  //                     <span className='card-info__title'>Стать:</span>
  //                     <span className='card-info__subtitle'>{obj.sex}</span>
  //                   </div>
  //                 </div>
  //               </div>
  //               <div className='card-info__bottom'>
  //                 <div className='card-info__text__surname'>
  //                   <span className='card-info__title'>Прiзвище/Surname</span>
  //                   <span className='card-info__subtitle'>{obj.surname}</span>
  //                 </div>
  //                 <div className='card-info__text__name'>
  //                   <span className='card-info__title'>Iм’я/Name</span>
  //                   <span className='card-info__subtitle'>{obj.name}</span>
  //                 </div>
  //                 <div className='card-info__text__patronimyc'>
  //                   <span className='card-info__title'>По батьковi/Patronimyc</span>
  //                   <span className='card-info__subtitle'>{obj.patron}</span>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       )
  //     })}
  //   </>)
}

export default Card;
