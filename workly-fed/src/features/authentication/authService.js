import api from "../../lib/api";

const login = async (email, password) => {
    try {
        const response = await api.post('/Auth/login', { email, password });

        if (response.data.token) {
            localStorage.setItem('authTokens', JSON.stringify(response.data));
        }

        return response.data;
    } catch (error) {
        const msg = error.response?.data?.message || "Erro desconhecido ao fazer login";
        throw new Error(msg);
    }
};

const logout = () => {
    localStorage.removeItem('authTokens');
}

const authService = {
    login,
    logout,
}

export default authService;
