import { put } from "@vercel/blob";

/** IST calendar day as YYYY-MM-DD (digest groups by Indian days). */
function istDay(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * POST /api/track-buy — records one BUY ON MEESHO tap.
 * Body: { productId, productName?, price? }
 * Always answers 200 (analytics must never surface errors to the shopper,
 * and must never delay the Meesho redirect — the client fires and forgets).
 */
export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false });
    }
    const { productId, productName, price } = req.body || {};
    if (!productId || !process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(200).json({ ok: true });
    }
    const key = `buy-clicks/${istDay()}/${Date.now()}-${randomId()}.json`;
    await put(
      key,
      JSON.stringify({
        t: new Date().toISOString(),
        productId: String(productId),
        productName: String(productName || productId),
        price: typeof price === "number" ? price : null,
      }),
      { access: "public", contentType: "application/json" }
    );
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(200).json({ ok: true });
  }
}
