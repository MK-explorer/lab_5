// src/pages/RegisterPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api";
import { useAuth } from "../context/AuthContext";
import styles from "./AuthPage.module.css";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      return setError("Пароль має бути не менше 6 символів");
    }
    setLoading(true);
    try {
      const { token, user } = await register(name, email, password);
      saveAuth(token, user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Реєстрація</h1>
        {error && <p className={styles.error}>{error}</p>}
        <label className={styles.label}>Ім'я
          <input
            className={styles.input}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Ваше ім'я"
          />
        </label>
        <label className={styles.label}>Email
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
          />
        </label>
        <label className={styles.label}>Пароль
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="мін. 6 символів"
          />
        </label>
        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? "Реєстрація..." : "Зареєструватись"}
        </button>
        <p className={styles.link}>
          Вже є акаунт? <Link to="/login">Увійти</Link>
        </p>
      </form>
    </div>
  );
}