// This endpoint runs on the same origin as the frontend. Credentials are
// validated twice: at the Next.js gateway and by the Express session verifier.
export async function api(path, options = {}) {
  const response = await fetch("/api/backend/" + path.replace(/^\//, ""), {
    credentials: "same-origin",
    cache: "no-store",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });
  let result;
  try { result = await response.json(); } catch { result = {}; }
  if (!response.ok) {
    throw new Error(result.error || result.message || "Request failed (" + response.status + ")");
  }
  return result;
}

export const queryString = (filters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined && value !== "All")
      params.set(key, String(value));
  });
  return params.toString();
};
