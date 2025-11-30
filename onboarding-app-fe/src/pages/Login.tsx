import { Button } from "react-bootstrap";
import AuthButton from "../components/btnLoginOID";
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-light">
        <div className="card shadow p-5 rounded" style={{ maxWidth: '400px', width: '100%' }}>
            <h1 className="mb-4 text-center">Login</h1>
            <p className="text-center text-muted mb-4">
                Please login using your OpenID provider
            </p>
            <div className="d-flex justify-content-center gap-2">
                <Link to="/" className="btn btn-outline-secondary">Home</Link>
                <AuthButton />
            </div>
        </div>
    </div>
  );
}
