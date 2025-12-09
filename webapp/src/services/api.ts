import { useAuthStore } from "../store/authstore";

const getApiHost = () => {
    return import.meta.env.VITE_API_HOST 
};

export const API_HOST = getApiHost();

export const createApi = async (url: string, options: RequestInit = {}) => {
    const token = useAuthStore.getState().token;
    
    const defaultOptions: RequestInit = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    return fetch(`${API_HOST}${url}`, mergedOptions)
        .then(async res => {
            if (res.status === 401) {
                useAuthStore.getState().logOut();
                window.location.href = "/";
                throw new Error("Unauthorized - Token expired or invalid");
            }
            if (!res.ok) {
                throw new Error(await res.text() || "Something went wrong");
            }
            return res.json();
        });
};
