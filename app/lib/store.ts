import { configureStore } from '@reduxjs/toolkit';
import usersReducer from "./reducer/usersSlice";

export const makeStore = () => {
    return configureStore({
        reducer: usersReducer,
    })
};

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch'];
