import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Require admin role. Use in server components and server actions.
 * Redirects to /unauthorized if not ADMIN.
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return session;
}
