import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminAuthClientGate } from "@/components/admin/AdminAuthClientGate";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return (
    <AdminAuthClientGate>
      <div className="flex min-h-screen bg-[#F8F4EF]">
        <AdminNav />
        <div className="flex-1 mr-64 lg:mr-72">{children}</div>
      </div>
    </AdminAuthClientGate>
  );
}
