import { useCallback, useEffect, useState } from "react";
import "./App.css";

const API_URL = "/api/v1";

function formatAmount(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(Number(amount));
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function App() {
  const [payments, setPayments] = useState([]);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadPayments = useCallback(async () => {
    try {
      setError("");
      const response = await fetch(`${API_URL}/payments`);
      if (!response.ok) throw new Error("Unable to load payments.");

      const data = await response.json();
      setPayments(data.payments ?? []);
    } catch (err) {
      setError(err.message || "Could not connect to PayFlow API.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numericAmount,
          currency,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Payment creation failed.");
      }

      setMessage("Test payment created successfully.");
      setAmount("");
      await loadPayments();
    } catch (err) {
      setError(err.message || "Could not create payment.");
    } finally {
      setSubmitting(false);
    }
  }

  const totalAmount = payments.reduce(
    (sum, payment) =>
      payment.currency === "INR" ? sum + Number(payment.amount) : sum,
    0,
  );

  const pendingCount = payments.filter(
    (payment) => payment.status === "PENDING",
  ).length;

  const successCount = payments.filter(
    (payment) => payment.status === "SUCCESS",
  ).length;

  const recentPayments = [...payments].sort(
    (a, b) =>
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime(),
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">P</span>
          <span>PayFlow</span>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <div className="nav-item active">
          <span>▦</span> Overview
        </div>

        <div className="nav-item">
          <span>↔</span> Payments
        </div>

        <div className="sidebar-bottom">
          <span className="status-dot" />
          API integration
          <small>Development mode</small>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="eyebrow">PAYMENT OPERATIONS</div>
            <h1>Overview</h1>
          </div>

          <div className="environment">
            <span className="status-dot" />
            Sandbox
          </div>
        </header>

        <section className="welcome">
          <div>
            <div className="eyebrow light">YOUR PAYMENT WORKSPACE</div>
            <h2>Payments, made clearer.</h2>
            <p>Monitor and manage your simulated payment records.</p>
          </div>

          <div className="welcome-icon">↗</div>
        </section>

        {error && <div className="alert error">{error}</div>}
        {message && <div className="alert success">{message}</div>}

        <section className="stats-grid">
          <article className="stat-card">
            <span className="stat-label">Total payments</span>
            <strong>{loading ? "…" : payments.length}</strong>
            <span className="stat-foot">All recorded transactions</span>
          </article>

          <article className="stat-card">
            <span className="stat-label">Total value (INR)</span>
            <strong>
              {loading ? "…" : formatAmount(totalAmount)}
            </strong>
            <span className="stat-foot">INR payments only</span>
          </article>

          <article className="stat-card">
            <span className="stat-label">Pending</span>
            <strong>{loading ? "…" : pendingCount}</strong>
            <span className="stat-foot">Awaiting simulated outcome</span>
          </article>

          <article className="stat-card">
            <span className="stat-label">Successful</span>
            <strong>{loading ? "…" : successCount}</strong>
            <span className="stat-foot">Marked as successful</span>
          </article>
        </section>

        <section className="content-grid">
          <article className="panel payment-panel">
            <div className="panel-heading">
              <div>
                <h3>Recent payments</h3>
                <p>Records loaded from PostgreSQL through the API.</p>
              </div>

              <button
                className="secondary-button"
                type="button"
                onClick={loadPayments}
                disabled={loading}
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="empty-state">Loading payments…</div>
            ) : payments.length === 0 ? (
              <div className="empty-state">
                No payments yet. Create your first test payment.
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Payment</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td>
                          <strong className="payment-id">
                            {payment.id.slice(0, 8)}
                          </strong>
                          <small>
                            Ref: {payment.referenceId?.slice(0, 8) || "—"}
                          </small>
                        </td>

                        <td className="amount-cell">
                          {formatAmount(payment.amount, payment.currency)}
                        </td>

                        <td>
                          <span
                            className={`badge ${String(
                              payment.status,
                            ).toLowerCase()}`}
                          >
                            {payment.status}
                          </span>
                        </td>

                        <td>{formatDate(payment.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>

          <article className="panel form-panel">
            <div className="panel-heading">
              <div>
                <h3>Create payment</h3>
                <p>Add a simulated transaction.</p>
              </div>

              <span className="form-icon">＋</span>
            </div>

            <form onSubmit={handleSubmit}>
              <label htmlFor="amount">Payment amount</label>
              <input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="e.g. 499.99"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />

              <label htmlFor="currency">Currency</label>
              <select
                id="currency"
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
              >
                <option value="INR">INR — Indian Rupee</option>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — Pound Sterling</option>
              </select>

              <div className="sandbox-note">
                <strong>Sandbox transaction</strong>
                <p>
                  This creates a database record only. No real money is
                  transferred.
                </p>
              </div>

              <button
                className="primary-button"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Creating…" : "Create test payment"}
              </button>
            </form>
          </article>
        </section>

        <footer>
          PayFlow · Development sandbox · Spring Boot + PostgreSQL
        </footer>
      </main>
    </div>
  );
}

export default App;
