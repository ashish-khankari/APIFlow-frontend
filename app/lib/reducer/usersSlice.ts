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
            state.user = action.payload;
        },
        SET_ONBOARDING_DETAILS: (state, action) => {
            state.onboardingData = action.payload;
        },
        SET_LOGIN_USER: (state, action) => {
            state.user = action.payload.user;
            if (action.payload.token) {
                state.token = action.payload.token;
            }
        },
        SET_LOGOUT: () => {
            return initialState;
        }
    }
})

export const { SET_USERS, SET_ONBOARDING_DETAILS, SET_LOGIN_USER, SET_LOGOUT } = usersSlice.actions;
export default usersSlice.reducer;