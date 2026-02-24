import { createSlice } from '@reduxjs/toolkit';

const savedUser = JSON.parse(localStorage.getItem('userData')) || null;

export const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: savedUser?.user || null,
        token: savedUser?.token || null,
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            // сохраняем в localStorage
            localStorage.setItem('userData', JSON.stringify(action.payload));
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem('userData');
        },
    },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;