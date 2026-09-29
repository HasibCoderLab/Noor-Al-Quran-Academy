import { connectDB } from "./db";
import User from "../models/User";
import { AUTH_COOKIE, verifyToken } from "./jwt";

export async function requireAdmin(request) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const payload = token ? verifyToken(token) : null;

  if (!payload?.sub) {
    return { user: null, error: "Not authenticated.", status: 401 };
  }

  await connectDB();

  const user = await User.findById(payload.sub);
  if (!user || (payload.tokenVersion || 0) !== (user.tokenVersion || 0)) {
    return { user: null, error: "Not authenticated.", status: 401 };
  }

  if (user.role !== "admin") {
    return { user: null, error: "Forbidden.", status: 403 };
  }

  return { user, error: null, status: null };
}
