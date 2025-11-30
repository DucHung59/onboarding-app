import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api/api';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    api.get('/auth/check', { withCredentials: true })
      .then(res => {
        setAuthenticated(res.data.loggedIn || false);
        if (!res.data.loggedIn) {
          console.log('User not authenticated, redirecting to login');
        }
      })
      .catch((err) => {
        console.error('Auth check failed:', err);
        setAuthenticated(false);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!authenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
