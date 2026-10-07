type PlatformUser = { email: string; isGuest?: boolean; platformAdmin?: boolean } | null | undefined;

const platformAdminEmails = new Set([
  "contato@somus.group",
  "admin@synky.com.br",
]);

/** Platform administration is granted only to authenticated, non-visitor accounts. */
export function isPlatformAdmin(user: PlatformUser): boolean {
  if (!user || user.isGuest) return false;
  if (typeof user.platformAdmin === "boolean") return user.platformAdmin || process.env.NODE_ENV === "development";
  return platformAdminEmails.has(user.email.trim().toLowerCase()) || process.env.NODE_ENV === "development";
}
export function reservedPlatformEmail(email: string): boolean { return platformAdminEmails.has(email.trim().toLowerCase()); }
