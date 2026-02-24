import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, InputGroup, Stack, Text, SimpleGrid, Box } from '@chakra-ui/react';
import { toaster } from "../ui/toaster"
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:4000' });

function Registration() {
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [patronymic, setPatronymic] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const navigate = useNavigate();

    const handleRegister = async () => {
        if (!/^\d{10}$/.test(phone)) {
            toaster.create({ title: 'Невірний номер', description: 'Введіть 10 цифр номера', type: 'error' });
            return;
        }
        if (!name || !surname || !patronymic || !birthDate) {
            toaster.create({ title: 'Заповніть всі обовʼязкові поля', type: 'error' });
            return;
        }
        if (password.length < 4) {
            toaster.create({ title: 'Пароль занадто короткий', type: 'error' });
            return;
        }
        if (password !== confirmPassword) {
            toaster.create({ title: 'Паролі не співпадають', type: 'error' });
            return;
        }

        try {
            await API.post('/register', {
                phone: phone,
                password,
                name: name,
                surname: surname,
                patronymic: patronymic,
                birth_date: birthDate,
                photo_url: photoUrl
            });

            toaster.create({ title: 'Реєстрація успішна', type: 'success' });
            navigate('/');
        } catch (e) {
            toaster.create({
                title: 'Помилка реєстрації',
                description: e.response?.data?.error || e.message,
                type: 'error'
            });
        }
    };

    return (
        <div className='login'>
            <div className='login-wrapper'>
                <div className='login-container' style={{ maxWidth: '600px', width: '100%' }}>
                    <span className='login-title'>📋 Реєстрація</span>

                    <div className='login-form'>
                        <SimpleGrid columns={2} gap={4}>
                            <Box>
                                <Text fontSize="xs" mb={1} color="gray.500">Прізвище</Text>
                                <Input
                                    placeholder='Прізвище'
                                    value={surname}
                                    onChange={e => setSurname(e.target.value)}
                                />
                            </Box>
                            <Box>
                                <Text fontSize="xs" mb={1} color="gray.500">Ім'я</Text>
                                <Input
                                    placeholder='Імʼя'
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </Box>

                            <Box>
                                <Text fontSize="xs" mb={1} color="gray.500">По батькові</Text>
                                <Input
                                    placeholder='По батькові'
                                    value={patronymic}
                                    onChange={e => setPatronymic(e.target.value)}
                                />
                            </Box>
                            <Box>
                                <Text fontSize="xs" mb={1} color="gray.500">Дата народження</Text>
                                <Input
                                    type="date"
                                    value={birthDate}
                                    onChange={e => setBirthDate(e.target.value)}
                                />
                            </Box>

                            {/* Вторая колонка - Контакты */}
                            <Box gridColumn="span 2">
                                <Text fontSize="xs" mb={1} color="gray.500">Номер телефону</Text>
                                <InputGroup>
                                    <Input
                                        placeholder='095 899 4151'
                                        maxLength={10}
                                        value={phone}
                                        onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                                    />
                                </InputGroup>
                            </Box>

                            <Box gridColumn="span 2">
                                <Text fontSize="xs" mb={1} color="gray.500">Посилання на фото профілю</Text>
                                <Input
                                    placeholder='https://example.com/photo.jpg'
                                    value={photoUrl}
                                    onChange={e => setPhotoUrl(e.target.value)}
                                />
                            </Box>

                            <Box>
                                <Text fontSize="xs" mb={1} color="gray.500">Пароль</Text>
                                <Input
                                    placeholder='Пароль'
                                    type='password'
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </Box>
                            <Box>
                                <Text fontSize="xs" mb={1} color="gray.500">Підтвердження</Text>
                                <Input
                                    placeholder='Повторіть пароль'
                                    type='password'
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                />
                            </Box>
                        </SimpleGrid>
                    </div>

                    <div className='login-button' style={{ marginTop: '20px' }}>
                        <button onClick={handleRegister}>Зареєструватися</button>
                    </div>

                    <div className='login-forgot' style={{ marginTop: '15px', textAlign: 'center' }}>
                        <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: 'black' }}>
                            Вже є аккаунт? Увійти
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Registration;