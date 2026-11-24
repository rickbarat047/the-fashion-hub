/**
 * GET /api/prices — current prices straight from Meesho's affiliate API.
 *
 * The catalogue ships with snapshot prices so the site renders instantly and
 * still works with no network. This endpoint refreshes those numbers from the
 * same Meesho collection feeds that power the buyer reviews, so a seller price
 * change shows up on the storefront without a redeploy.
 *
 * Results are cached in-memory per serverless instance AND at Vercel's edge
 * (s-maxage) so we never hammer Meesho on every page view.
 *
 * NOTE: keep COLLECTIONS in sync with the MAP in scripts/fetch-reviews.cjs.
 * This list must be self-contained — Vercel bundles this file into its own
 * lambda and cannot resolve imports from src/ at runtime.
 */
const COLLECTIONS: Record<string, string> = {
  "539819444": "7200898",
  "423040500": "7280984",
  "495407917": "7352338",
  "1105951833": "7505103",
  "417397973": "7618258",
  "519415423": "7673817",
  "499279857": "7435003",
  "646503124": "7500146",
  "1047999712": "7801392",
  "1026362757": "7686247",
  "989057227": "7803271",
  "1092599960": "7906719",
  "1098820283": "7988953",
  "1071239231": "8026467",
  "705875792": "8086635",
  "1056291429": "8259072",
  "1016220210": "8377033",
  "889479467": "8498361",
  "1084128719": "8575931",
  "1060917211": "9063156",
  "1123108769": "9617426",
  "1048837080": "9619125",
  "530603958": "9690990",
  "687058617": "9690990",
  "757544728": "9690990",
  "1112165981": "9826211",
  "481244020": "9918329",
  "435899553": "10013269",
  "1076522502": "10075598",
  "985690990": "10319031",
  "428512663": "10281439",
  "1009455923": "10220780",
  "1095976457": "10215402",
  "973837279": "10486458",
  "1153459762": "10427789",
  "447557329": "10378516",
  "480179648": "10538607",
  "964489194": "10656523",
  "1122901942": "10705912",
};

type LiveProduct = {
  id: number | string;
  price?: number;
  rating?: number;
  rating_count?: number;
};

export interface LivePrice {
  price: number;
  priceLabel: string;
  rating?: number;
  ratingCount?: number;
}

type PriceMap = Record<string, LivePrice>;

const CACHE_TTL_MS = 10 * 60 * 1000;
let cached: { map: PriceMap; at: number } | null = null;
let inFlight: Promise<PriceMap> | null = null;

async function fetchCollection(collectionId: string): Promise<LiveProduct[]> {
  const url = `https://affiliate.meesho.com/api/affiliate/api/v1/collection/${collectionId}?collectionType=autodm`;
  const res = await fetch(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return Array.isArray(data?.products) ? data.products : [];
}

async function mapWithLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor++;
        results[index] = await fn(items[index]);
      }
    })
  );
  return results;
}

async function buildPriceMap(): Promise<PriceMap> {
  // Several products can share one collection (Meesho reuses some feeds).
  const byCollection = new Map<string, string[]>();
  for (const [productId, collectionId] of Object.entries(COLLECTIONS)) {
    const ids = byCollection.get(collectionId) || [];
    ids.push(productId);
    byCollection.set(collectionId, ids);
  }

  const groups = [...byCollection.entries()];
  const feeds = await mapWithLimit(groups, 8, async ([collectionId]) => {
    try {
      return await fetchCollection(collectionId);
    } catch {
      return [] as LiveProduct[]; // a single failing feed must not break the rest
    }
  });

  const map: PriceMap = {};
  feeds.forEach((feed, groupIndex) => {
    for (const id of groups[groupIndex][1]) {
      const live = feed.find((item) => String(item.id) === String(id));
      if (!live || typeof live.price !== "number" || !isFinite(live.price) || live.price <= 0) continue;
      map[id] = {
        price: live.price,
        priceLabel: `₹${live.price.toLocaleString("en-IN")}`,
        ...(typeof live.rating === "number" ? { rating: live.rating } : {}),
        ...(typeof live.rating_count === "number" ? { ratingCount: live.rating_count } : {}),
      };
    }
  });

  return map;
}

export default async function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "public, s-maxage=900, stale-while-revalidate=3600");
  if (req.method !== "GET") return res.status(405).json({ ok: false });

  try {
    const now = Date.now();
    if (!cached || now - cached.at >= CACHE_TTL_MS) {
      if (!inFlight) {
        inFlight = buildPriceMap()
          .then((map) => {
            cached = { map, at: Date.now() };
            return map;
          })
          .finally(() => {
            inFlight = null;
          });
      }
      await inFlight;
    }

    const source = cached!;
    res.status(200).json({
      ...source.map,
      fetchedAt: new Date(source.at).toISOString(),
      source: "meesho-affiliate-api",
    });
  } catch {
    // Never surface a price error — the catalogue's snapshot prices remain.
    if (cached) {
      res.status(200).json({
        ...cached.map,
        fetchedAt: new Date(cached.at).toISOString(),
        source: "cache",
        stale: true,
      });
    } else {
      res.status(200).json({ fetchedAt: null, source: "unavailable" });
    }
  }
}
