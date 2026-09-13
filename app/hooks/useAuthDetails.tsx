'use-client';

import { useAppSelector } from "../lib/hooks";

const useAuthDetails = () => {
    const authDetails = useAppSelector(state => state.auth);
    return authDetails
}

export default useAuthDetails;