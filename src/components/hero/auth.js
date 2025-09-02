// Utility to get user info from localStorage or JWT
import jwt_decode from "../../helpers/jwt_decode";

export function getCurrentUser() {
  // Try email signup user
  let parsed = null;
  const u = localStorage.getItem('user');
  if (u) {
    try { parsed = JSON.parse(u); } catch { parsed = null; }
  }
  // Try Google JWT
  if (!parsed) {
    const token = localStorage.getItem('jwt');
    if (token) {
      try {
        const decoded = jwt_decode(token);
        parsed = {
          name: decoded.name,
          email: decoded.email,
          referralCode: decoded.referralCode,
          _id: decoded._id
        };
      } catch {}
    }
  }
  return parsed;
}
