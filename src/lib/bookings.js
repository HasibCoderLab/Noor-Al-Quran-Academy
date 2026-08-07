const BOOKINGS_KEY = "aqa_bookings";

const isBrowser = typeof window !== "undefined";

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const bookings = {
  getAll() {
    if (!isBrowser) return [];
    try {
      return JSON.parse(localStorage.getItem(BOOKINGS_KEY)) || [];
    } catch {
      return [];
    }
  },

  add(booking) {
    const all = this.getAll();
    const record = {
      id: uid(),
      status: "pending",
      createdAt: new Date().toISOString(),
      ...booking,
    };
    all.unshift(record);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(all));
    return record;
  },
};
