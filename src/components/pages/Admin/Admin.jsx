import React from 'react'

function Admin() {
  return (
    <div className='admin'>
        <div className='admin-wrapper'>
            <span className='admin-wrapper__title'>Admin e-panel</span>
            <span className='admin-wrapper__subtitle'>E-document</span>
            <div className='admin-form'>
                <div className='admin-form__container'>
                    <div className='admin-form__block'>
                        <p>Name</p>
                        <input className="admin-input" type='text' placeholder='Введiть значення'/>
                    </div>
                    <div className='admin-form__block'>
                        <p>Surname</p>
                        <input className="admin-input" type='text' placeholder='Введiть значення'/>
                    </div>
                    <div className='admin-form__block'>
                        <p>Patric</p>
                        <input className="admin-input" type='text' placeholder='Введiть значення'/>
                    </div>
                    <div className='admin-form__block'>
                        <p>Sex</p>
                        <input className="admin-input" type='text' placeholder='Введiть значення'/>
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
            </div>
        </div>
    </div>
  )
}

export default Admin