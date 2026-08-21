import { useFetch } from "../hooks/useClient";

interface HealthResponse {
    message: string;
}

export async function useGetHealth(): Promise<HealthResponse> {

    const { isLoading, data } = await useFetch({
        endpoint : '/health',
        method : 'GET'
    })
    
    const MESSAGE = data.message;

    return {
        message: MESSAGE || "API is healthy" // Assign a string value here
    };
}