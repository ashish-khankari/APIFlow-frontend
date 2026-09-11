import { createSlice } from "@reduxjs/toolkit";

export interface UserData {
    full_name: string,
    email: string,
    company_name: string,
    id?: number | null,
    password: string,
}

export interface OnboardingData {
    company_name: string,
}

const initialState = {
    user: {
        company_name: '',
        email: '',
        full_name: '',
        id: null,
        password: ''
    } as UserData,
    onboardingData: {
        company_name: '',
    } as OnboardingData
}

const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        SET_USERS: (state, action) => {
            state.user = action.payload;
        },
        SET_ONBOARDING_DETAILS: (state, action) => {
            state.onboardingData = action.payload;
        }
    }
})

export const { SET_USERS, SET_ONBOARDING_DETAILS } = usersSlice.actions;
export default usersSlice.reducer;