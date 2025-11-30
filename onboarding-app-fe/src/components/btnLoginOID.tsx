// src/components/AuthButton.jsx
import React, { useState, useEffect } from "react";
import api from "../api/api";

export default function AuthButton() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        api.get("/auth/me", { withCredentials: true })
            .then((res) => {
                localStorage.setItem('user', JSON.stringify(res.data));
                setUser(res.data)
            })
            .catch(() => setUser(null));
    }, []);

    const getApiBaseUrl = () => {
        return process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';
    };

    const login = () => {
        const apiBaseUrl = getApiBaseUrl();
        const loginUrl = `${apiBaseUrl}/auth/login`;
        window.location.href = loginUrl;
    };

    const logout = () => {
        const apiBaseUrl = getApiBaseUrl();
        const logoutUrl = `${apiBaseUrl}/auth/logout`;
        window.location.href = logoutUrl;
    };

    if (user) {
        return (
            <div>
                <button onClick={logout} className="btn btn-secondary">Logout</button>
            </div>
        );
    }

    return <button onClick={login} className="btn btn-primary">Login</button>;
}
