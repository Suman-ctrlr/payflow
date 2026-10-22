import { useState } from "react";
import "./Login.css";

const API_URL = "/api/v1";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.authenticated) {
        throw new Error(data.message || "Invalid username or password.");
      }

      setPassword("");
      onLogin(data.username);
    } catch (err) {
      setError(err.message || "Unable to connect to PayFlow.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <span className="login-brand-mark">P</span>
          <span>PayFlow</span>
        </div>

        <p className="login-eyebrow">PAYMENT OPERATIONS</p>
        <h1>Welcome back</h1>
        <p className="login-description">
          Sign in to access your payment dashboard.
        </p>

        <label htmlFor="payflow-username">Username</label>
        <input
          id="payflow-username"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />

        <label htmlFor="payflow-password">Password</label>
        <input
          id="payflow-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {error && <p className="login-error" role="alert">{error}</p>}

        <button type="submit" disabled={busy}>
          {busy ? "Signing in..." : "Sign in"}
        </button>

        <p className="login-footer">Secure access to your workspace</p>
      </form>
    </main>
  );
}
