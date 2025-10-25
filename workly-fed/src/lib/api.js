import axios from 'axios';

const API_URL = 'http://localhost:8080';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use(
    (config) => {
        const authTokens = JSON.parse(localStorage.getItem('authTokens'));

        if (authTokens?.token) {
            config.headers['Authorization'] = `Bearer ${authTokens.token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response, 
    async (error) => {
        const originalRequest = error.config;
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            originalRequest._retry = true; 

            try {
                const tokens = JSON.parse(localStorage.getItem('authTokens'));
                const rs = await api.post('/Auth/refresh', { refreshToken: tokens.refreshToken });
                const { token } = rs.data;
                const newTokens = {...tokens, token };
                localStorage.setItem('authTokens', JSON.stringify(newTokens));
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                return api(originalRequest);                
            } catch (_error) {
                localStorage.removeItem('authTokens');
                window.location.href = '/login';
                return Promise.reject(_error);
            }
        }
        return Promise.reject(error);
    }
);

export default api;