import { env } from "cloudflare:workers";
import { getAppUser } from "../../../guest-auth";
import { ensureAuthSchema, sameOrigin } from "@/lib/cloudflare-auth";
import { boundedBody, photoMime, profilePhotoUrl } from "@/lib/profile";

export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control":"no-store" } });

export async function GET(request: Request) {
  if (!env.DB) return json({ error:"Foto indisponível." },503);
  try {
    const { user } = await getAppUser(request,false);
    if (!user || user.isGuest) return json({ error:"Entre para acessar sua foto." },401);
    await ensureAuthSchema();
    const row = await env.DB.prepare("SELECT photo,mime_type FROM synky_profile_photos WHERE user_id=?").bind(user.userId).first<{ photo:ArrayBuffer|number[]; mime_type:string }>();
    if (!row) return json({ error:"Você ainda não definiu uma foto." },404);
    const body = new Uint8Array(row.photo instanceof ArrayBuffer ? new Uint8Array(row.photo) : row.photo);
    return new Response(body.buffer, { headers: { "Content-Type":row.mime_type,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Content-Security-Policy":"default-src 'none'; sandbox","Cross-Origin-Resource-Policy":"same-origin" } });
  } catch { return json({ error:"Não foi possível carregar sua foto." },503); }
}

export async function POST(request: Request) { return changePhoto(request,false); }
export async function DELETE(request: Request) { return changePhoto(request,true); }
async function changePhoto(request: Request, remove: boolean) {
  if (!sameOrigin(request)) return json({ error:"Solicitação inválida." },403);
  if (!env.DB) return json({ error:"Foto indisponível." },503);
  try {
    const { user } = await getAppUser(request,false);
    if (!user || user.isGuest) return json({ error:"Entre para alterar sua foto." },401);
    await ensureAuthSchema();
    if (remove) await env.DB.prepare("DELETE FROM synky_profile_photos WHERE user_id=?").bind(user.userId).run();
    else {
      const bytes = await boundedBody(request,350_000), mime = photoMime(bytes);
      if (!mime || mime !== request.headers.get("content-type")) return json({ error:"Envie uma foto PNG, JPEG ou WebP válida." },400);
      await env.DB.prepare(`INSERT INTO synky_profile_photos(user_id,photo,mime_type,updated_at) VALUES(?,?,?,?)
        ON CONFLICT(user_id) DO UPDATE SET photo=excluded.photo,mime_type=excluded.mime_type,updated_at=excluded.updated_at`)
        .bind(user.userId,bytes.buffer,mime,new Date().toISOString()).run();
    }
    return json({ ok:true,avatarUrl:await profilePhotoUrl(user.userId) });
  } catch (error) {
    return json({ error:error instanceof Error && error.message === "BODY_TOO_LARGE" ? "A foto é muito grande. Escolha outra imagem." : "Não foi possível salvar sua foto. Tente novamente." },error instanceof Error && error.message === "BODY_TOO_LARGE" ? 413 : 503);
  }
}
