const request = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, ...data };
  } catch {
    return { ok: false, status: 0, error: "Network error. Please try again." };
  }
};

export const auth = {
  register(payload) {
    return request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  login(payload) {
    return request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  logout() {
    return request("/api/auth/logout", { method: "POST" });
  },

  async getSession() {
    const result = await request("/api/auth/me");
    return result.ok && result.user ? result.user : null;
  },
};
