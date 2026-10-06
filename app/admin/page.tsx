import { redirect } from "next/navigation";
import { getChatGPTUser } from "../chatgpt-auth";
import { isPlatformAdmin } from "@/lib/platform-admin";
import AdminDashboard from "./admin-dashboard";
import "./admin.css";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getChatGPTUser();
  if (!user) redirect("/signin-with-chatgpt?return_to=%2Fadmin");
  if (!isPlatformAdmin(user)) redirect("/app");
  return <AdminDashboard adminEmail={user.email} />;
}
