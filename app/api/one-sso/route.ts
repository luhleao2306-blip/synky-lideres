const HUB = "https://synky-hub.contato146558.chatgpt.site";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (request.headers.get("origin") !== HUB) return new Response("Origem inválida.", { status: 403 });
  let token: FormDataEntryValue | null;
  try { token = (await request.formData()).get("access_token"); }
  catch { return new Response("Acesso inválido.", { status: 400 }); }
  if (typeof token !== "string" || !/^[A-Za-z0-9._-]{100,4096}$/.test(token)) return new Response("Acesso inválido.", { status: 400 });
  let response: Response;
  try {
    response = await fetch(`${HUB}/api/grants/check`, {
      method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ product: "lideres" }), cache: "no-store",
    });
  } catch { return new Response("Não foi possível verificar seu acesso.", { status: 503 }); }
  if (!response.ok) return Response.redirect(`${HUB}/painel`, 303);
  return new Response(null, { status: 303, headers: {
    location: "/app", "set-cookie": `__Host-synky_one_access=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3600`,
    "cache-control": "no-store", "referrer-policy": "no-referrer",
  } });
}
