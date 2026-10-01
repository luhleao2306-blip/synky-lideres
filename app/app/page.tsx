import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAppUser } from "../guest-auth";
import Dashboard from "./dashboard";

export default async function AppPage() {
  const request = new Request("https://synky-lideres.contato146558.chatgpt.site/app", { headers: await headers() });
  if (!(await getAppUser(request)).user) redirect("https://synky-hub.contato146558.chatgpt.site/painel?abrir=lideres");
  return <Dashboard />;
}
