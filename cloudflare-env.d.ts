declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    SYNKY_ADMIN_INITIAL_PASSWORD?: string;
  }
}
