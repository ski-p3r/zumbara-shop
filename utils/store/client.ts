export const clearClientCookies = (): void => {
  // Remove common auth cookies by setting them expired on the client
  const cookiesToClear = ["accessToken", "refreshToken", "user"];
  cookiesToClear.forEach((name) => {
    document.cookie = `${name}=; Max-Age=0; path=/;`;
  });

  // As a fallback, clear all cookies by iterating document.cookie
  // (This is best-effort — server-set httpOnly cookies can't be removed client-side.)
  const all = document.cookie.split(";");
  all.forEach((c) => {
    const idx = c.indexOf("=");
    const name = idx > -1 ? c.substr(0, idx).trim() : c.trim();
    if (name) document.cookie = `${name}=; Max-Age=0; path=/;`;
  });
};
