// Minimal JWT decode (no validation, just base64 decode)
// Use this if you don't want to install a package
export default function jwt_decode(token) {
  if (!token) return {};
  const parts = token.split('.');
  if (parts.length !== 3) return {};
  try {
    return JSON.parse(atob(parts[1]));
  } catch {
    return {};
  }
}
