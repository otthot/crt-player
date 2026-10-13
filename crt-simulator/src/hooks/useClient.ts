import { useCallback, useState } from 'react'

const DEFAULT_OPTIONS = {}

type FetchProps = {
    endpoint : string;
    method : 'GET' | 'POST' | 'PUT' | 'DELETE';
}

type CommonFetchProps = {
    input?: {index: string, value: string}[];
    fetchOptions?: RequestInit;
}

const API_URL = "http://127.0.0.1:8000"

export function useFetch<T> ({endpoint, method} : FetchProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<T | null>(null)
    const [error, setError] = useState<Error | null>(null)

    const commonFetch = useCallback(async ({
        input,
        fetchOptions = {}
    } : CommonFetchProps = {}) => {
        setIsLoading(true)
        setError(null)

        try {
            const url = API_URL + endpoint
            const body = method === 'GET' ? undefined : JSON.stringify(input)

            const response = await fetch(url, {
                method,
                ...DEFAULT_OPTIONS,
                ...fetchOptions,
                body
            })

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`)
            }

            const responseData: T = await response.json()
            setData(responseData)
        } catch (caughtError) {
            setError(caughtError instanceof Error ? caughtError : new Error('Request failed'))
        } finally {
            setIsLoading(false)
        }
    }, [endpoint, method]);

    return { isLoading, commonFetch, data, error };
}
