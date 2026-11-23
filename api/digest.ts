import { list, del } from "@vercel/blob";
import { Resend } from "resend";

/** IST calendar day as YYYY-MM-DD. */
function istDay(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function istLabel(day: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${day}T12:00:00+05:30`));
}

interface Click {
  productId: string;
  productName: string;
  price: number | null;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * GET /api/digest — runs daily via Vercel Cron (see vercel.json).
 * Aggregates yesterday's (IST) buy clicks and emails one digest.
 * Skips silently when unconfigured or when the day had zero clicks.
 */
export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ ok: false });
    }

    // Shared-secret guard (Vercel Cron sends this header automatically
    // when CRON_SECRET is set in project env).
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const auth = String(req.headers?.authorization || "");
      if (auth !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ ok: false });
      }
    }

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.DIGEST_EMAIL;
    if (!apiKey || !to || !process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(200).json({ ok: true, skipped: "not-configured" });
    }

    const yesterday = istDay(new Date(Date.now() - 24 * 60 * 60 * 1000));
    // Manual test hook: /api/digest?day=YYYY-MM-DD (requires CRON_SECRET).
    const requestedDay = String(req.query?.day || "");
    const day = /^\d{4}-\d{2}-\d{2}$/.test(requestedDay) ? requestedDay : yesterday;
    const { blobs } = await list({ prefix: `buy-clicks/${day}/`, limit: 1000 });

    const clicks: Click[] = [];
    await Promise.all(
      blobs.map(async (b) => {
        try {
          const r = await fetch(b.url);
          if (r.ok) clicks.push((await r.json()) as Click);
        } catch {
          // ignore single corrupt entries
        }
      })
    );

    if (clicks.length === 0) {
      return res.status(200).json({ ok: true, total: 0, skipped: "empty-day" });
    }

    const byProduct = new Map<string, { name: string; count: number; price: number | null }>();
    for (const c of clicks) {
      const row = byProduct.get(c.productId) || { name: c.productName, count: 0, price: c.price };
      row.count += 1;
      byProduct.set(c.productId, row);
    }
    const ranked = [...byProduct.entries()].sort((a, b) => b[1].count - a[1].count);

    const rows = ranked
      .map(
        ([, r]) =>
          `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(r.name)}</td>` +
          `<td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;"><b>${r.count}</b> (${Math.round((r.count / clicks.length) * 100)}%)</td>` +
          `<td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${r.price != null ? `₹${r.price}` : "—"}</td></tr>`
      )
      .join("");

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "Fashion Hub <onboarding@resend.dev>",
      to: [to],
      subject: `Fashion Hub digest — ${clicks.length} buy clicks (${istLabel(day)})`,
      html:
        `<div style="font-family:sans-serif;max-width:560px;">` +
        `<h2 style="margin:0 0 4px;">The Fashion Hub — daily digest</h2>` +
        `<p style="color:#666;margin:0 0 16px;">${escapeHtml(istLabel(day))} · <b>${clicks.length}</b> BUY ON MEESHO taps</p>` +
        `<table style="width:100%;border-collapse:collapse;font-size:14px;">` +
        `<tr style="text-align:left;color:#666;"><th style="padding:8px 12px;">Product</th><th style="padding:8px 12px;text-align:center;">Clicks</th><th style="padding:8px 12px;text-align:right;">Price</th></tr>` +
        rows +
        `</table>` +
        `<p style="color:#999;font-size:12px;margin-top:16px;">Counts taps on BUY ON MEESHO (all products link out to Meesho checkout). Full behaviour analytics live in GA4 once VITE_GA_MEASUREMENT_ID is set.</p>` +
        `</div>`,
    });
    if (error) {
      return res.status(200).json({ ok: false, emailError: true });
    }

    // Clear processed blobs so each click is counted exactly once.
    await del(blobs.map((b) => b.url));
    return res.status(200).json({ ok: true, total: clicks.length, day });
  } catch {
    return res.status(200).json({ ok: false });
  }
}
