import { redirect } from "next/navigation";

// Backwards-compatible redirect for links to the previous allowlist screen.
export default function NotAuthorizedPage() { redirect("/pending"); }
