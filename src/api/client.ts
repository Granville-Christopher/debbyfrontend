const ENV_API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "").trim();
export const API_BASE_URL = (ENV_API_BASE_URL || "https://debby-backend-production.up.railway.app").replace(/\/+$/, "");
const API_BASE = API_BASE_URL;
console.log("API_BASE URL:", API_BASE); // Debug log

type RequestOptions = {
  method?: string;
  body?: unknown;
  accessToken?: string | null;
  csrfToken?: string | null;
};

export const apiRequest = async <T>(
  path: string,
  { method = "GET", body, accessToken, csrfToken }: RequestOptions = {}
): Promise<T> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  if (csrfToken) {
    headers["X-CSRF-Token"] = csrfToken;
  }

  let requestBody: string | undefined;
  if (body) {
    requestBody = JSON.stringify(body);
    console.log(`API: Sending ${method} ${path} with body:`, body);
  } else {
    console.log(`API: Sending ${method} ${path} without body`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: requestBody,
    credentials: "include"
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    const err = new Error(error.error || "Request failed") as any;
    err.response = { data: error, status: res.status };
    throw err;
  }
  if (res.status === 204) {
    return {} as T;
  }
  return res.json();
};
