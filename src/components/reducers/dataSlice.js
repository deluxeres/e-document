import { createSlice } from '@reduxjs/toolkit'

export const dataSlice = createSlice({
  name: 'data',
  initialState: {
    value: 0,
  },
  reducers: {
    increment: (state) => {
      state.value += 0
    },
    decrement: (state) => {
      state.value -= 0
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload
    },
  },
})

export const { increment, decrement, incrementByAmount } = dataSlice.actions

export const selectData = (state) => state.data.value

export default dataSlice.reducer