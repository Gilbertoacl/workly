import { createContext, useEffect, useState } from "react";
import authService from "../../features/authentication/authService";

export const AuthContext = createContext(null);

export function AuthProvider ({ children }){
    const [authTokens, setAuthTokens] = useState(() => {
        const stored = localStorage.getItem("authTokens");
        return stored ? JSON.parse(stored) : null;
    });
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("authTokens");
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        const storedTokens = localStorage.getItem('authTokens');
        if (storedTokens) {
            setAuthTokens(JSON.parse(storedTokens));
            setUser(JSON.parse(storedTokens));
        }
    }, []);

    const handleLogin = async (email, password) => {
        try {
            const authData = await authService.login(email, password);
            setAuthTokens(authData);
            setUser(authData);
        } catch (error) {
            throw error;
        }
    }

    const handleLogout = () => {
        authService.logout();
        setAuthTokens(null);
        setUser(null);
    }

    const value = {
        user,
        accessToken: authTokens?.token || user?.token,
        refreshToken: authTokens?.refreshToken || user?.refreshToken,
        login: handleLogin,
        logout: handleLogout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
};