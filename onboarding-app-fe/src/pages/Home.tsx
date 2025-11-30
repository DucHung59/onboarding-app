import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/api";

interface UserInfo {
  email: string;
  username: string;
  displayName: string;
}

export default function AppHeader() {
  const navigate = useNavigate();

  const [user, setUser] = useState<UserInfo | null>(null);

  // Lấy user từ localStorage
  useEffect(() => {
    api.get("/auth/me", { withCredentials: true })
    .then((res) => 
        {
            localStorage.setItem('user', JSON.stringify(res.data));
            const parsedUser = JSON.parse(res.data);
            const { email, username, displayName } = parsedUser.user;
            setUser({ email, username, displayName });
        })
    .catch(() => setUser(null));
  }, []);

  const handleLogin = () => navigate("/login");

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "http://localhost:3000/auth/logout";
  };

  const redirectToProtected = () => {
    navigate("/about")
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <span className="navbar-brand">MyApp</span>
          <div className="d-flex ms-auto">
            {user ? (
              <>
                <span className="navbar-text me-3">Hello, {user.email}</span>
                <button className="btn btn-outline-light" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <button className="btn btn-light" onClick={handleLogin}>
                Login
              </button>
            )}
          </div>
        </div>
      </nav>
      <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-light">
        <div className="card shadow p-5 rounded" style={{ maxWidth: '400px', width: '100%' }}>
          { user ? (
              <div>
                <h4 className="mb-4 text-center">Protected Page</h4>
                <p className="text-center text-muted mb-4">
                Go to Protected Page
                </p>
                <div className="d-flex justify-content-center">
                  <button className="btn btn-warning" onClick={redirectToProtected}>
                    Go
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h4 className="mb-4 text-center">You must Login</h4>
                <p className="text-center text-muted mb-4">
                Login to view Protected Page
                </p>
                <div className="d-flex justify-content-center">
                  <Button variant="primary" size="lg" onClick={handleLogin}>
                    Login
                  </Button>
                </div>
              </div>
            )
          }
        </div>
      </div>
    </>
  );
}
