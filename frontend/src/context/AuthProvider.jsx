import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { checkUserLogin, logoutUserGet } from '../api/authApi.js';
import { roles } from '../router/index.jsx';
import { AuthContext } from './AuthContext.jsx';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const login = async () => {
        try {
            const response = await checkUserLogin();
            const data = typeof response.data === 'string' ? (() => {
                try {
                    return JSON.parse(response.data);
                } catch {
                    return null;
                }
            })() : response.data;

            if (data && typeof data === 'object' && data.email) {
                setUser({
                    ...data,
                    role: data.is_admin ? roles.ADMIN : roles.USER,
                });
                if (location.pathname === '/') {
                    navigate('/home');
                }
            } else {
                setUser(null);
                if (!location.pathname.startsWith('/auth/success') && !location.pathname.startsWith('/monitor')) {
                    navigate('/');
                }
            }
        } catch (error) {
            console.log(error);
            setUser(null);
            navigate('/');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        login();
    }, []);

    const logout = async () => {
        try {
            await logoutUserGet();
        } catch (error) {
            console.log(error);
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
