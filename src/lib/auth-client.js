import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Same-origin authentication avoids cookies being sent to the wrong Vercel host.
  baseURL: typeof window === "undefined"
    ? (process.env.NEXT_PUBLIC_APP_URL || "https://roktoseva.vercel.app")
    : window.location.origin,
});
export const { signIn, signUp, useSession } = authClient;