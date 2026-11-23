/**
 * Build-time review fetcher — pulls REAL buyer reviews from the Meesho
 * affiliate collection API and bakes them into public/reviews.json.
 *
 * Why build-time, not runtime: browsers can't call the Meesho API directly
 * (no CORS), but Node can. Reviews refresh on every deploy.
 *
 * Fault-tolerant by design: per-product try/catch, merges into the existing
 * file, never deletes products it couldn't refresh, never fails the build.
 * Products without a known collection mapping are skipped (their pages
 * simply hide the reviews section).
 *
 * Mapping: Meesho product ID -> [collectionId, collectionType].
 * Find collection IDs in the `c` param of affiliate URLs:
 *   c=<account>:<source>:<COLLECTION_ID>
 */
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "public", "reviews.json");
const PRICE_OUT = path.join(__dirname, "..", "public", "prices.json");

const MAP = {
  539819444: ["7200898", "autodm"],
  423040500: ["7280984", "autodm"],
  495407917: ["7352338", "autodm"],
  1105951833: ["7505103", "autodm"],
  417397973: ["7618258", "autodm"],
  519415423: ["7673817", "autodm"],
  499279857: ["7435003", "autodm"],
  646503124: ["7500146", "autodm"],
  1047999712: ["7801392", "autodm"],
  1026362757: ["7686247", "autodm"],
  989057227: ["7803271", "autodm"],
  1092599960: ["7906719", "autodm"],
  1098820283: ["7988953", "autodm"],
  1071239231: ["8026467", "autodm"],
  705875792: ["8086635", "autodm"],
  1056291429: ["8259072", "autodm"],
  1016220210: ["8377033", "autodm"],
  889479467: ["8498361", "autodm"],
  1084128719: ["8575931", "autodm"],
  1060917211: ["9063156", "autodm"],
  1123108769: ["9617426", "autodm"],
  1048837080: ["9619125", "autodm"],
  530603958: ["9690990", "autodm"],
  687058617: ["9690990", "autodm"],
  757544728: ["9690990", "autodm"],
  1112165981: ["9826211", "autodm"],
  481244020: ["9918329", "autodm"],
  435899553: ["10013269", "autodm"],
  1076522502: ["10075598", "autodm"],
  985690990: ["10319031", "autodm"],
  428512663: ["10281439", "autodm"],
  1009455923: ["10220780", "autodm"],
  1095976457: ["10215402", "autodm"],
  973837279: ["10486458", "autodm"],
  1153459762: ["10427789", "autodm"],
  447557329: ["10378516", "autodm"],
  480179648: ["10538607", "autodm"],
  964489194: ["10656523", "autodm"],
};

const MAX_REVIEWS = 3;

function pickName(author) {
  if (!author) return "Meesho buyer";
  return author.name || "Meesho buyer";
}

async function fetchCollection(collectionId, type) {
  const url = `https://affiliate.meesho.com/api/affiliate/api/v1/collection/${collectionId}?collectionType=${type}`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function main() {
  let existing = {};
  try {
    existing = JSON.parse(fs.readFileSync(OUT, "utf8"));
  } catch {
    existing = {};
  }

  // Build-time price snapshot. Real-time updates are served by /api/prices;
  // this file is the offline fallback and feeds the static SEO pages.
  let prices = {};
  try {
    prices = JSON.parse(fs.readFileSync(PRICE_OUT, "utf8"));
  } catch {
    prices = {};
  }

  for (const [productId, [collectionId, type]] of Object.entries(MAP)) {
    try {
      const data = await fetchCollection(collectionId, type);
      const p = (data.products || []).find((x) => String(x.id) === String(productId));
      if (!p) {
        console.log(`reviews: product ${productId} not in collection ${collectionId}, kept previous`);
        continue;
      }
      const reviews = (p.reviews || [])
        .filter((r) => r && r.comments && String(r.comments).trim().length > 0)
        // Feature only substantive write-ups: at least a few real letters
        // (filters out emoji-only reactions while keeping every aggregate exact)
        .filter((r) => /[\p{L}]{4,}/u.test(String(r.comments)))
        .sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0))
        .slice(0, MAX_REVIEWS)
        .map((r) => ({
          rating: r.rating,
          comments: String(r.comments).slice(0, 400),
          author: pickName(r.author),
          helpfulCount: r.helpfulCount || 0,
          media: ((r.media || []).filter((m) => m && m.url).slice(0, 3)).map((m) => m.url),
        }));
      if (typeof p.price === "number" && isFinite(p.price) && p.price > 0) {
        prices[productId] = {
          price: p.price,
          priceLabel: `₹${p.price.toLocaleString("en-IN")}`,
          rating: p.rating,
          ratingCount: p.rating_count,
          fetchedAt: new Date().toISOString(),
        };
      }
      existing[productId] = {
        rating: p.rating,
        ratingCount: p.rating_count,
        reviews,
        fetchedAt: new Date().toISOString(),
      };
      console.log(`reviews: ${productId} → ${reviews.length} reviews, ${p.rating_count} ratings, ₹${p.price}`);
    } catch (e) {
      console.log(`reviews: ${productId} FAILED (${e.message}), kept previous`);
    }
  }

  fs.writeFileSync(OUT, JSON.stringify(existing, null, 2));
  fs.writeFileSync(PRICE_OUT, JSON.stringify(prices, null, 2));
  console.log(`reviews.json written; prices.json written (${Object.keys(prices).length} products)`);
}

main().then(
  () => {},
  (e) => {
    console.log("reviews: fatal", e.message);
  }
);
