import { useFetch } from "./useClient";

export const useHealth = () => {

    const {isLoading, data, commonFetch} = useFetch({
        method : 'GET',
        endpoint : '/health'
    })

    return {isLoading, data, commonFetch}
}
