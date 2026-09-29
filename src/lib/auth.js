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

  verifyEmail(payload) {
    return request("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  resendVerification(payload) {
    return request("/api/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  forgotPassword(payload) {
    return request("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  resetPassword(payload) {
    return request("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  changePassword(payload) {
    return request("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateProfile(payload) {
    return request("/api/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  async getSession() {
    const result = await request("/api/auth/me");
    return result.ok && result.user ? result.user : null;
  },
};
