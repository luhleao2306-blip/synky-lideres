import Dashboard from "./dashboard";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAppUser } from "../guest-auth";

export default async function AppPage(){const requestHeaders=await headers();const {user}=await getAppUser(new Request("https://leaders.synky.local/app",{headers:requestHeaders}),false);if(!user)redirect("/login?next=%2Fapp");return <Dashboard/>}
