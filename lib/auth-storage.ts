const ACCESS_TOKEN_KEY = "gearup_access_token";

export function getAccessToken() {
  if (typeof window === "undefined") return null;

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeAccessToken() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}
