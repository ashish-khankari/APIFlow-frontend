import { OnboardingData, UserData } from "@/app/types/userTypes";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: {
        company_name: '',
        email: '',
        full_name: '',
        id: null,
    } as UserData,
    onboardingData: {
        company_name: '',
    } as OnboardingData,
    token: ''
}

const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        SET_USERS: (state, action) => {
            console.log('action.payload', action.payload)
            state.user = action.payload;
            state.token = action.payload;
        },
        SET_ONBOARDING_DETAILS: (state, action) => {
            state.onboardingData = action.payload;
        }
    }
})

export const { SET_USERS, SET_ONBOARDING_DETAILS } = usersSlice.actions;
export default usersSlice.reducer;