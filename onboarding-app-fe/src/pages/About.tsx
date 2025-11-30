// src/pages/About.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface UserInfo {
  email: string;
  username: string;
  displayName: string;
}

export default function About() {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const { email, username, displayName } = parsedUser.user;
        setUser({ email, username, displayName });
      } catch (err) {
        console.error("Failed to parse user from localStorage", err);
      }
    }
  }, []);

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <p>User not logged in.</p>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card shadow p-4 rounded" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="card-title mb-3 text-center">About</h2>
        <ul className="list-group list-group-flush">
          <li className="list-group-item"><strong>Email:</strong> {user.email}</li>
          <li className="list-group-item"><strong>Username:</strong> {user.username}</li>
          <li className="list-group-item"><strong>Display Name:</strong> {user.displayName || '-'}</li>
        </ul>
      <div className="d-flex justify-content-center">
        <Link to="/" className="btn btn-outline-secondary mt-5">Return home</Link>
      </div>
      </div>
    </div>
  );
}
