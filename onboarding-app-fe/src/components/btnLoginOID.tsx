// src/components/AuthButton.jsx
import React, { useState, useEffect } from "react";
import api from "../api/api";

export default function AuthButton() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        api.get("/auth/me", { withCredentials: true })
        .then((res) => 
            {
                localStorage.setItem('user', JSON.stringify(res.data));
                setUser(res.data)
            })
        .catch(() => setUser(null));
    }, []);

    const login = () => {
        window.location.href = "api/auth/login";
    };

    const logout = () => {
        window.location.href = "api/auth/logout";
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
