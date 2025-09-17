export default function isTokenExpired(token: string | undefined | null): boolean {
  if (!token || typeof token !== 'string') return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const payload = JSON.parse(atob(padded));
    const now = Math.floor(Date.now() / 1000);
    return typeof payload.exp !== 'number' || payload.exp < now;
  } catch {
    return true;
  }
}
