import { useState } from 'react'

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

    const commonFetch = async ({
        input,
        fetchOptions = {}
    } : CommonFetchProps) => {
        setIsLoading(true)

        const url = API_URL + endpoint

        const response = await fetch(url, {
            method,
            ...DEFAULT_OPTIONS,
            ...fetchOptions,
            body : JSON.stringify(input)
        })

        const data = await response.json()

        setIsLoading(false)
        setData(data)
    };

    return { isLoading, commonFetch, data };
}