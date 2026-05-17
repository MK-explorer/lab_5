

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Помилка запиту");
  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const register = (name, email, password) =>
  request("/api/register", { method: "POST", body: JSON.stringify({ name, email, password }) });

export const login = (email, password) =>
  request("/api/login", { method: "POST", body: JSON.stringify({ email, password }) });

export const getProfile = () => request("/api/profile");

// ── Books ─────────────────────────────────────────────────────────────────────
export const getBooks = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/api/books${qs ? `?${qs}` : ""}`);
};

export const getBook = (id) => request(`/api/books/${id}`);

export const createBook = (data) =>
  request("/api/books", { method: "POST", body: JSON.stringify(data) });

// ── Orders ────────────────────────────────────────────────────────────────────
export const createOrder = (items) =>
  request("/api/orders", { method: "POST", body: JSON.stringify({ items }) });

export const getOrders = () => request("/api/orders");

// ── Reviews ───────────────────────────────────────────────────────────────────
export const addReview = (bookId, rating, comment) =>
  request(`/api/books/${bookId}/reviews`, {
    method: "POST",
    body: JSON.stringify({ rating, comment }),
  });