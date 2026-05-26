import { createSlice } from '@reduxjs/toolkit';

const getSavedUser = () => {
    try {
        return JSON.parse(localStorage.getItem('userData')) || null;
    } catch {
        localStorage.removeItem('userData');
        return null;
    }
};

const savedUser = getSavedUser();

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
