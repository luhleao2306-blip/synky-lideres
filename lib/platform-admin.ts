type PlatformUser = { email: string; isGuest?: boolean } | null | undefined;

const platformAdminEmails = new Set([
  "contato@somus.group",
  "admin@synky.com.br",
]);

/** Platform administration is granted only to authenticated, non-visitor accounts. */
export function isPlatformAdmin(user: PlatformUser): boolean {
  if (!user || user.isGuest) return false;
  return platformAdminEmails.has(user.email.trim().toLowerCase()) || process.env.NODE_ENV === "development";
}
