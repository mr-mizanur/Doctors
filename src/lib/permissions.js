import "server-only";
import { auth, authDb } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function getAccess(headers) {
  const session = await auth.api.getSession({ headers });
  if (!session?.user?.id || typeof session.user.email !== "string") {
    return { session: null, role: null };
  }
  const email = session.user.email.toLowerCase();
  const id = String(session.user.id);
  const ids = [{ _id: id }, { id }];
  if (/^[a-f0-9]{24}$/i.test(id)) ids.push({ _id: new ObjectId(id) });
  const currentUser = await authDb.collection("user").findOne(
    { email, $or: ids },
    { projection: { role: 1 } },
  );
  return {
    session,
    role: currentUser?.role === "admin" ? "admin" : "user",
  };
}
