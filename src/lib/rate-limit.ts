type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  if (buckets.size > 10000) {
    for (const [k, b] of buckets) {
      if (now > b.resetAt) {
        buckets.delete(k);
      }
    }
  }

  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) {
    return false;
  }

  bucket.count++;
  return true;
}

export function clientIp(request: Request): string {
  const real = request.headers.get("x-real-ip");
  if (real?.trim()) return real.trim();

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // último salto = adicionado pelo proxy confiável (Vercel); entradas à esquerda são forjáveis
    const last = forwarded.split(",").pop()?.trim();
    if (last) return last;
  }

  return "unknown";
}
