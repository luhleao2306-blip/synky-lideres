import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAppUser } from "../guest-auth";
import { isPlatformAdmin } from "@/lib/platform-admin";
import AdminDashboard from "./admin-dashboard";
import "./admin.css";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const requestHeaders = await headers();
  const { user } = await getAppUser(new Request("https://leaders.synky.local/admin", { headers: requestHeaders }), false);
  if (!user) redirect("/login?next=%2Fadmin");
  if (!isPlatformAdmin(user)) redirect("/app");
  return <AdminDashboard adminEmail={user.email} />;
}
