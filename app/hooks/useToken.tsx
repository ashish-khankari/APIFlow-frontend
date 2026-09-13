'use-client';

import { useAppSelector } from "../lib/hooks";

const useToken = () => {
    const fetchToken = useAppSelector(state => state.auth.token);
    return fetchToken || localStorage.getItem("token")
}

export default useToken;