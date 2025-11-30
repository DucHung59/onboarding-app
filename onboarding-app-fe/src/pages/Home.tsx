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
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  // Lấy user từ API
  useEffect(() => {
    api.get("/auth/me", { withCredentials: true })
      .then((res) => {
        if (res.data.authenticated && res.data.user) {
          const userData = res.data.user;
          const { email, username, displayName } = userData;
          setUser({ email, username, displayName });
          setAuthenticated(true);
          console.log("Authenticated:", true);
          console.log("User:", userData);
        } else {
          setAuthenticated(false);
          setUser(null);
          console.log("Not authenticated");
        }
      })
      .catch((err) => {
        console.error("Auth check failed:", err);
        setUser(null);
        setAuthenticated(false);
      });
  }, []);

  const handleLogin = () => navigate("/login");

  const handleLogout = () => {
    localStorage.removeItem("user");
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/';
    const logoutUrl = `${apiBaseUrl}/auth/logout`;
    window.location.href = logoutUrl;
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
          {authenticated ? (
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
