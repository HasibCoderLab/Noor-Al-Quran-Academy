import bcrypt from "bcryptjs";

const USERS_KEY = "aqa_users";
const SESSION_KEY = "aqa_session";

const isBrowser = typeof window !== "undefined";

const read = (key, fallback) => {
  if (!isBrowser) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const auth = {
  getUsers() {
    return read(USERS_KEY, []);
  },

  register({ name, email, password, country }) {
    const users = this.getUsers();
    const emailLower = email.trim().toLowerCase();

    if (users.some((user) => user.email === emailLower)) {
      return { error: "An account with this email already exists." };
    }

    const user = {
      id: uid(),
      name: name.trim(),
      email: emailLower,
      country,
      password: bcrypt.hashSync(password, 10),
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    this.setSession(user);
    return { user };
  },

  login({ email, password }) {
    const emailLower = email.trim().toLowerCase();
    const user = this.getUsers().find((item) => item.email === emailLower);

    if (!user) {
      return { error: "No account found with this email." };
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return { error: "Incorrect password. Please try again." };
    }

    this.setSession(user);
    return { user };
  },

  setSession(user) {
    if (!isBrowser) return;
    const { password, ...safe } = user;
    localStorage.setItem(SESSION_KEY, JSON.stringify(safe));
  },

  getSession() {
    return read(SESSION_KEY, null);
  },

  logout() {
    if (!isBrowser) return;
    localStorage.removeItem(SESSION_KEY);
  },
};
