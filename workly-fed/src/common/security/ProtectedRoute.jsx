import useAuth from "../../hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { isTokenExpired } from "../../lib/jwt";
import api from "../../lib/api";

const ProtectedRoute = ({ children }) => {
    const { user, refreshToken, logout } = useAuth();
    const location = useLocation();
    const [checking, setChecking] = useState(true);
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        const checkToken = async () => {
            if (!isTokenExpired(user.token)) {
                setIsValid(true);
                setChecking(false);
                return;
            }

            try {
                const rs = await api.post('/Auth/refresh', { refreshToken });
                const { accessToken } = rs.data;
                const newUser = { ...user, token: accessToken };
                localStorage.setItem('authTokens', JSON.stringify(newUser));
                setIsValid(true);
            } catch {
                logout();
                setIsValid(false);
            } finally {
                setChecking(false);
            }
        };
        checkToken();
        // eslint-disable-next-line
    }, []);

    if (checking) {
        return <div className="flex items-center justify-center min-h-screen text-gray-300">Verificando autenticação...</div>;
    }
    if (!isValid) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
};

export default ProtectedRoute;