/**
 * Post-build: generates one static HTML page per product at
 *   dist/product/<slug>/index.html
 * with product-specific title + Open Graph / Twitter meta (photo, name, price).
 *
 * Why: the app is client-rendered, so every route serves the same generic
 * index.html. WhatsApp/Instagram/Twitter unfurlers don't run JS — without
 * these files every shared product link shows the same bland preview.
 * Each generated page boots the SAME app bundle (same <script>/<link> as
 * dist/index.html), so visitors get the identical experience; only bots
 * and tab titles see the difference.
 *
 * Vercel serves these static files for /product/<slug> (filesystem wins
 * over the SPA catch-all rewrite), and the in-app router handles the
 * trailing slash transparently.
 *
 * IMPORTANT: when adding products to src/data/products.ts, add a matching
 * entry to PRODUCTS below and rebuild.
 */
const fs = require("fs");
const path = require("path");

const SITE = "https://the-fashion-hub-store.vercel.app";

const PRODUCTS = [
  {
    slug: "pure-cotton-ajrakh-print-angrakha-kurti",
    name: "Pure Cotton Ajrakh Print Angrakha Kurti",
    price: 354,
    priceLabel: "₹354",
    rating: 4.3,
    ratingCount: 2197,
    image: "https://images.meesho.com/images/products/539819444/bcruu_512.webp?width=1024",
    blurb:
      "Pure cotton Ajrakh Angrakha kurti at ₹354 — hand-block print, surplice tie front, sizes S to 4XL. Buy direct on Meesho.",
  },
  {
    slug: "chitrarekha-refined-kurtis",
    name: "Chitrarekha Refined Kurtis",
    price: 540,
    priceLabel: "₹540",
    rating: 4.2,
    ratingCount: 4615,
    image: "https://images.meesho.com/images/products/423040500/bbb7c_512.webp?width=1024",
    blurb:
      "Chitrarekha refined crimson kurti at ₹540 — structured A-line, gold placket buttons, XS to 4XL. Buy direct on Meesho.",
  },
  {
    slug: "floral-printed-short-kurti",
    name: "Floral Printed Short Kurti",
    price: 250,
    priceLabel: "₹250 onwards",
    rating: 0,
    ratingCount: 0,
    image: "https://images.meesho.com/images/products/1049948196/9yqd5_512.webp?width=1024",
    blurb:
      "Floral printed short kurti from ₹250 — breezy everyday cotton, notch collar. Buy direct on Meesho via The Fashion Hub.",
  },
  {
    slug: "silk-kurta",
    name: "Silk Kurta",
    price: 555,
    priceLabel: "₹555",
    rating: 4.1,
    ratingCount: 9532,
    image: "https://images.meesho.com/images/products/495407917/6lpng_512.webp?width=1024",
    blurb:
      "Maroon silk kurta at ₹555 — gold zari embroidery, flattering A-line, XS to 5XL. Buy direct on Meesho.",
  },
  {
    slug: "black-floral-embroidered-short-kurti",
    name: "Black Floral Embroidered Short Kurti with Full Sleeves & Lace Work",
    price: 614,
    priceLabel: "₹614",
    rating: 0,
    ratingCount: 0,
    image: "https://images.meesho.com/images/products/1105951833/cxwt2.jpg",
    blurb:
      "Black floral embroidered short kurti at ₹614 — full sleeves, lace work. Buy direct on Meesho via The Fashion Hub.",
  },
  {
    slug: "womans-rayon-printed-short-kurta",
    name: "Woman's Rayon Printed Short Kurta",
    price: 196,
    priceLabel: "₹196",
    rating: 3.9,
    ratingCount: 10346,
    image: "https://images.meesho.com/images/products/417397973/gtdak.jpg",
    blurb:
      "Rayon printed short kurta at just ₹196 — 3.9 stars from 10,000+ Meesho ratings. Buy direct on Meesho.",
  },
  {
    slug: "cotton-top-palazzo-set-neck-lace",
    name: "Two Piece Cotton Top and Palazzo Set with Neck Lace Pattern",
    price: 308,
    priceLabel: "₹308 onwards",
    rating: 4.1,
    ratingCount: 747,
    image: "https://images.meesho.com/images/products/519415423/neof4.jpg",
    blurb:
      "Cotton top-palazzo set at ₹308 onwards — neck lace, elastic palazzos, 4.1 stars on Meesho. Buy direct via The Fashion Hub.",
  },
  {
    slug: "pink-embroidered-short-kurta",
    name: "Women's Printed Short Kurta",
    price: 288,
    priceLabel: "₹288",
    rating: 3.9,
    ratingCount: 8215,
    image: "https://images.meesho.com/images/products/499279857/jalzh.jpg",
    blurb:
      "Pink embroidered short kurta at ₹288 — white floral needlework, 3.9 stars from 8,000+ ratings. Buy direct on Meesho.",
  },
  {
    slug: "rani-pink-floral-short-kurti",
    name: "Women Rayon Printed Short Kurti",
    price: 246,
    priceLabel: "₹246",
    rating: 4.2,
    ratingCount: 23585,
    image: "https://images.meesho.com/images/products/646503124/luulm.jpg",
    blurb:
      "Rani pink rayon short kurti at ₹246 — square neck, dori tie-up, 4.2 stars from 23,000+ ratings. Buy direct on Meesho.",
  },
  {
    slug: "pink-collar-short-kurti",
    name: "Pink Collar Short Kurti",
    price: 293,
    priceLabel: "₹293",
    rating: 3.5,
    ratingCount: 4,
    image: "https://images.meesho.com/images/products/1047999712/e7t93.jpg",
    blurb:
      "Pink collar short kurti at ₹293 — crisp collar, sleeveless floral. Buy direct on Meesho via The Fashion Hub.",
  },
  {
    slug: "rust-block-print-short-kurti",
    name: "Rust Block-Print Short Kurti",
    price: 236,
    priceLabel: "₹236",
    rating: 3.9,
    ratingCount: 53,
    image: "https://images.meesho.com/images/products/1026362757/9jcqv.jpg",
    blurb:
      "Rust block-print short kurti at ₹236 — sweetheart neck, pom-pom hem. Buy direct on Meesho via The Fashion Hub.",
  },
  {
    slug: "blue-floral-short-kurti",
    name: "Blue Floral Short Kurti",
    price: 232,
    priceLabel: "₹232",
    rating: 4.2,
    ratingCount: 785,
    image: "https://images.meesho.com/images/products/989057227/xghfg.jpg",
    blurb:
      "Blue floral short kurti at ₹232 — shell-trim bell sleeves, 4.2 stars on Meesho. Buy direct via The Fashion Hub.",
  },
  {
    slug: "maroon-embroidered-short-kurti",
    name: "Maroon Embroidered Short Kurti",
    price: 256,
    priceLabel: "₹256",
    rating: 4.2,
    ratingCount: 47,
    image: "https://images.meesho.com/images/products/1092599960/lfxy5.jpg",
    blurb:
      "Maroon embroidered rayon kurti at ₹256 — V-neck, bell sleeves, 4.2 stars on Meesho. Buy direct via The Fashion Hub.",
  },
  {
    slug: "cream-lace-trim-short-kurti",
    name: "Cream Lace-Trim Short Kurti",
    price: 278,
    priceLabel: "₹278",
    rating: 4.2,
    ratingCount: 9,
    image: "https://images.meesho.com/images/products/1098820283/zfbah.jpg",
    blurb:
      "Cream lace-trim short kurti at ₹278 — red lace edging, 4.2 stars on Meesho. Buy direct via The Fashion Hub.",
  },
  {
    slug: "maroon-motif-short-kurti",
    name: "Maroon Motif Short Kurti",
    price: 339,
    priceLabel: "₹339",
    rating: 4.2,
    ratingCount: 17,
    image: "https://images.meesho.com/images/products/1071239231/p0ucw.jpg",
    blurb:
      "Maroon motif short kurti at ₹339 — square neck, side slits, 4.2 stars on Meesho. Buy direct via The Fashion Hub.",
  },
  {
    slug: "baby-pink-floral-short-kurti",
    name: "Baby Pink Floral Printed Short Kurti",
    price: 263,
    priceLabel: "₹263",
    rating: 4.1,
    ratingCount: 550,
    image: "https://images.meesho.com/images/products/705875792/w6iys.jpg",
    blurb:
      "Baby pink floral rayon short kurti at ₹263 — bell sleeves, 4.1 stars on Meesho. Buy direct via The Fashion Hub.",
  },
  {
    slug: "black-phool-paati-floral-short-kurti",
    name: "Black Phool Paati Floral Short Kurti",
    price: 274,
    priceLabel: "₹274",
    rating: 4.2,
    ratingCount: 592,
    image: "https://images.meesho.com/images/products/1056291429/zxnog.jpg",
    blurb:
      "Black phool-paati floral rayon short kurti at ₹274 — daily wear, 4.2 stars on Meesho. Buy direct via The Fashion Hub.",
  },
  {
    slug: "maroon-floral-short-kurti",
    name: "Maroon Floral Trendy Short Kurti",
    price: 267,
    priceLabel: "₹267",
    rating: 0,
    ratingCount: 0,
    image: "https://images.meesho.com/images/products/1016220210/bacua.jpg",
    blurb:
      "Maroon floral rayon short kurti at ₹267 — sweetheart neck, three-quarter sleeves. Buy direct via The Fashion Hub.",
  },
  {
    slug: "deep-olive-green-cotton-kurti",
    name: "Deep Olive Green Cotton Kurti",
    price: 307,
    priceLabel: "₹307",
    rating: 4.3,
    ratingCount: 863,
    image: "https://images.meesho.com/images/products/889479467/byjjq.jpg",
    blurb:
      "Deep olive cotton kurti at ₹307 — square notch neck, gold motifs, 4.3 stars on Meesho. Buy direct via The Fashion Hub.",
  },
  {
    slug: "blue-casual-cotton-short-kurti",
    name: "Blue Casual Cotton Short Kurti",
    price: 276,
    priceLabel: "₹276",
    rating: 4.5,
    ratingCount: 10,
    image: "https://images.meesho.com/images/products/1084128719/ssdzc.jpg",
    blurb:
      "Indigo blue cotton short kurti at ₹276 — V-neck, full sleeves, 4.5 stars on Meesho. Buy direct via The Fashion Hub.",
  },
  {
    slug: "short-kurti-for-women-girls",
    name: "Short Kurti for Women & Girls",
    price: 238,
    priceLabel: "₹238",
    rating: 3.7,
    ratingCount: 21,
    image: "https://the-fashion-hub-store.vercel.app/products/kurti-021/product-21-main.jpg",
    blurb:
      "Maroon rayon short kurti at ₹238 — notch neck, lace border, 3.7 stars from 21 Meesho ratings. Buy direct via The Fashion Hub.",
  },
  {
    slug: "women-black-white-printed-square-neck-short-kurti",
    name: "Women Black & White Printed Square Neck Short Kurti/Tunic",
    price: 290,
    priceLabel: "₹290",
    rating: 0,
    ratingCount: 0,
    image: "https://images.meesho.com/images/products/1123108769/xllrt.jpg",
    blurb:
      "Black & white printed cotton short kurti at ₹290 — square neck, comfort fit, sizes S to XXL. Buy direct on Meesho.",
  },
  {
    slug: "blue-floral-printed-short-kurti",
    name: "Blue Floral Printed Short Kurti",
    price: 257,
    priceLabel: "₹257",
    rating: 4.1,
    ratingCount: 505,
    image: "https://images.meesho.com/images/products/1048837080/qynjd.jpg",
    blurb:
      "Blue floral printed cotton short kurti at ₹257 — straight fit, 3/4 sleeves, sizes XS to XXL. Buy direct on Meesho.",
  },
  {
    slug: "anarkali-suit-women-kurta-pant-dupatta-set",
    name: "Anarkali Suit Women Kurta Pant Dupatta Set",
    price: 502,
    priceLabel: "₹502 onwards",
    rating: 4.2,
    ratingCount: 21972,
    image: "https://images.meesho.com/images/products/530603958/kyijn.jpg",
    blurb:
      "Anarkali suit with cotton blend kurta, pants, and dupatta at ₹502 onwards — embroidered Bollywood style. Buy direct on Meesho.",
  },
  {
    slug: "ladies-ethnic-wear-printed-suit-set",
    name: "Ladies Ethnic Wear Printed Suit Set",
    price: 318,
    priceLabel: "₹318 onwards",
    rating: 4.1,
    ratingCount: 4722,
    image: "https://images.meesho.com/images/products/687058617/tlohw.jpg",
    blurb:
      "Blue printed cotton blend suit set at ₹318 onwards — kurta, pants, dupatta. Buy direct on Meesho.",
  },
  {
    slug: "grey-embroidered-kurta-pant-dupatta-set",
    name: "Grey Embroidered Kurta Pant Dupatta Set",
    price: 513,
    priceLabel: "₹513 onwards",
    rating: 4,
    ratingCount: 1249,
    image: "https://images.meesho.com/images/products/757544728/tgd9n.jpg",
    blurb:
      "Grey embroidered cotton blend kurta pant dupatta set at ₹513 onwards — festive ethnic co-ord. Buy direct on Meesho.",
  },
  {
    slug: "short-kurti-for-women-blue",
    name: "Short Kurti for Women",
    price: 298,
    priceLabel: "₹298 onwards",
    rating: 4.1,
    ratingCount: 17,
    image: "https://images.meesho.com/images/products/1112165981/ohtxg.jpg",
    blurb:
      "Blue rayon short kurti at ₹298 onwards — three-quarter sleeves, above knee. Buy direct on Meesho.",
  },
  {
    slug: "pakistani-beautiful-dress-kurti-plazo-set",
    name: "Pakistani Beautiful Dress Kurti and Plazo Set",
    price: 408,
    priceLabel: "₹408 onwards",
    rating: 4.1,
    ratingCount: 2654,
    image: "https://images.meesho.com/images/products/481244020/rse0w.jpg",
    blurb:
      "Pakistani style rayon kurta and plazo set at ₹408 onwards — A-line fit, three-quarter sleeves, sizes S to 6XL. Buy direct on Meesho.",
  },
  {
    slug: "womens-cotton-printed-kurta-pant-set",
    name: "Womens Cotton Printed Kurta Pant Set",
    price: 277,
    priceLabel: "₹277",
    rating: 4.0,
    ratingCount: 19235,
    image: "https://images.meesho.com/images/products/435899553/9vr0k.jpg",
    blurb:
      "Cotton printed kurta and pant set at ₹277 — A-line fit, floral pattern, sizes S to XXXL. Buy direct on Meesho.",
  },
  {
    slug: "women-printed-cotton-short-kurti-square-neck-bell-sleeves",
    name: "Women Printed Cotton Short Kurti with Square Neck & Bell Sleeves",
    price: 207,
    priceLabel: "₹207",
    rating: 4.1,
    ratingCount: 1016,
    image: "https://images.meesho.com/images/products/1076522502/1inbk.jpg",
    blurb:
      "Multicolor printed cotton short kurti at ₹207 — square neck, bell sleeves, sizes S to XXL. Buy direct on Meesho.",
  },
  {
    slug: "elegant-white-lace-embroidered-puff-sleeve-top",
    name: "Elegant Women's White Lace Embroidered Puff Sleeve Top",
    price: 354,
    priceLabel: "₹354",
    rating: 4.2,
    ratingCount: 45,
    image: "https://images.meesho.com/images/products/985690990/9lqsw.jpg?width=1024",
    blurb:
      "Elegant white cotton top at ₹354 — lace embroidery, shirt collar, short puff sleeves, sizes S to XL. Buy direct on Meesho.",
  },
  {
    slug: "honky-tonky-brown-bishop-sleeve-printed-top",
    name: "Honky Tonky Casual Bishop Sleeve Printed Women Brown Top",
    price: 289,
    priceLabel: "₹289",
    rating: 4.2,
    ratingCount: 1275,
    image: "https://images.meesho.com/images/products/428512663/d7ysb.jpg?width=1024",
    blurb:
      "Honky Tonky brown crepe top at ₹289 — printed fabric, long bishop sleeves, sizes XS to XXL. Buy direct on Meesho.",
  },
  {
    slug: "trendy-khadi-cotton-short-kurti-neck-embroidery",
    name: "Trendy Short Kurti in Khadi Cotton with Elegant Neck Embroidery",
    price: 260,
    priceLabel: "₹260",
    rating: 4,
    ratingCount: 98,
    image: "https://images.meesho.com/images/products/1009455923/6dbbo.jpg?width=1024",
    blurb:
      "Black Khadi cotton short kurti at ₹260 — elegant neck embroidery, keyhole neckline, sizes S to XXL. Buy direct on Meesho.",
  },
  {
    slug: "festive-print-half-sleeve-middy-gown",
    name: "Festive Printed Half-Sleeve Middy Gown",
    price: 365,
    priceLabel: "₹365",
    rating: 4.4,
    ratingCount: 59,
    image: "https://images.meesho.com/images/products/1095976457/nwe1k.jpg?width=1024",
    blurb:
      "Festive red rayon middy gown at ₹365 — floral print, short sleeves, white lace trim, sizes XS to XXL. Buy direct on Meesho.",
  },
  {
    slug: "white-printed-rayon-kurti-pink-farsi-salwar-set",
    name: "Women's White Printed Rayon Short Kurti with Pink Farsi Salwar Ethnic Co-Ord Set",
    price: 487,
    priceLabel: "₹487",
    rating: 4.1,
    ratingCount: 572,
    image: "https://images.meesho.com/images/products/973837279/l2b4k.jpg?width=1024",
    blurb:
      "White printed rayon short kurti with pink Farsi salwar co-ord set at ₹487 — mandarin neck, sizes S to XL. Buy direct on Meesho.",
  },
  {
    slug: "blue-heart-printed-rayon-puff-sleeve-top",
    name: "Blue Heart Printed Rayon Puff Sleeve Top",
    price: 302,
    priceLabel: "₹302",
    rating: 0,
    ratingCount: 0,
    image: "https://images.meesho.com/images/products/1153459762/g4kd1.jpg?width=1024",
    blurb:
      "Blue heart printed rayon top at ₹302 — mandarin collar, three-quarter puff sleeves, sizes XS to XL. Buy direct on Meesho.",
  },
  {
    slug: "jaipuri-floral-empire-top",
    name: "Jaipuri Floral Empire Top",
    price: 300,
    priceLabel: "₹300",
    rating: 4.2,
    ratingCount: 1029,
    image: "https://images.meesho.com/images/products/447557329/hliuy.jpg?width=1024",
    blurb:
      "Jaipuri floral empire top at ₹300 — viscose rayon, mandarin collar, A-line fit, sizes XS to XXL. Buy direct on Meesho.",
  },
  {
    slug: "purple-chikankari-printed-short-kurta",
    name: "Purple Chikankari Printed Short Kurta",
    price: 281,
    priceLabel: "₹281",
    rating: 4,
    ratingCount: 27008,
    image: "https://images.meesho.com/images/products/480179648/fhsvn.jpg?width=1024",
    blurb:
      "Purple Chikankari printed short kurta at ₹281 — rayon, A-line fit, sizes S to XXXL. Buy direct on Meesho.",
  },
  {
    slug: "lucknowi-chikankari-rayon-short-kurti",
    name: "Lucknowi Chikankari Rayon Short Kurti",
    price: 404,
    priceLabel: "₹404",
    rating: 4.1,
    ratingCount: 1307,
    image: "https://images.meesho.com/images/products/964489194/xeqjw.jpg?width=1024",
    blurb:
      "Black Lucknowi Chikankari rayon short kurti at ₹404 — embroidered floral work, notch neck, sizes S to XXXL. Buy direct on Meesho.",
  },
  {
    slug: "olive-green-floral-printed-cotton-short-kurti",
    name: "Olive Green Floral Printed Cotton Short Kurti",
    price: 218,
    priceLabel: "₹218",
    rating: 4.3,
    ratingCount: 140,
    image: "https://images.meesho.com/images/products/1122901942/zjt3r.jpg?width=1024",
    blurb:
      "Olive green floral printed cotton short kurti at ₹218 — mandala print, V-neck, full sleeves, sizes S to XXL. Buy direct on Meesho.",
  },
];

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

// Keep share-preview prices in sync with the live Meesho snapshot written by
// fetch-reviews.cjs. Deriving slug -> productId from the catalogue avoids a
// second hand-maintained mapping.
const slugToMeeshoId = {};
try {
  const catalogue = fs.readFileSync(path.join(__dirname, "..", "src", "data", "products.ts"), "utf8");
  for (const block of catalogue.split(/\n  \{\n    id: /).slice(1)) {
    const slug = block.match(/slug:\s*"([^"]+)"/);
    const id = block.match(/meeshoProductId:\s*"([^"]+)"/);
    if (slug && id) slugToMeeshoId[slug[1]] = id[1];
  }
} catch {}

let livePrices = {};
try {
  livePrices = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "public", "prices.json"), "utf8"));
} catch {}

const distDir = path.join(__dirname, "..", "dist");
const base = fs.readFileSync(path.join(distDir, "index.html"), "utf8");

// Default share image for the generic homepage shell
const withDefaultOg = base.replace(
  "</head>",
  `    <link rel="canonical" href="${SITE}/" />\n    <meta property="og:image" content="${SITE}/icon-512.png" />\n  </head>`
);
fs.writeFileSync(path.join(distDir, "index.html"), withDefaultOg);

for (const p of PRODUCTS) {
  const url = `${SITE}/product/${p.slug}`;
  const live = livePrices[slugToMeeshoId[p.slug]];
  const price = typeof live?.price === "number" ? live.price : p.price;
  const priceLabel = `₹${price.toLocaleString("en-IN")}${p.priceLabel && p.priceLabel.includes("onwards") ? " onwards" : ""}`;
  const rating = typeof live?.rating === "number" ? live.rating : p.rating;
  const ratingCount = typeof live?.ratingCount === "number" ? live.ratingCount : p.ratingCount;
  const blurb = p.blurb.replace(/₹[\d,]+(?:\s*onwards)?/, priceLabel);
  const title = `${p.name} — ${priceLabel} | The Fashion Hub`;
  let html = base;
  // Replace homepage canonical/og:image with product-specific ones
  html = html.replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${url}" />`
  );
  html = html.replace(
    /<meta property="og:image" content="[^"]*" \/>/,
    `<meta property="og:image" content="${p.image}" />`
  );
  html = html.replace(
    /<meta property="og:image:alt" content="[^"]*" \/>/,
    `<meta property="og:image:alt" content="${esc(p.name)}" />`
  );
  html = html.replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`);
  html = html.replace(
    /<meta name="description" content=".*?" \/>/,
    `<meta name="description" content="${esc(blurb)}" />`
  );
  html = html.replace(
    /<meta property="og:title" content=".*?" \/>/,
    `<meta property="og:title" content="${esc(title)}" />`
  );
  html = html.replace(
    /<meta property="og:description" content=".*?" \/>/,
    `<meta property="og:description" content="${esc(blurb)}" />`
  );
  html = html.replace(
    /<meta name="twitter:title" content=".*?" \/>/,
    `<meta name="twitter:title" content="${esc(title)}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content=".*?" \/>/,
    `<meta name="twitter:description" content="${esc(blurb)}" />`
  );
  const extra = [
    `<meta property="og:site_name" content="The Fashion Hub" />`,
    `<meta property="og:locale" content="en_IN" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:type" content="product" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:site" content="@the_fashion_hub46" />`,
    `<meta name="twitter:image" content="${p.image}" />`,
    `<meta name="twitter:image:alt" content="${esc(p.name)}" />`,
    `<meta property="product:price:amount" content="${price}" />`,
    `<meta property="product:price:currency" content="INR" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large" />`,
    // JSON-LD Product schema for Google rich results
    `<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": p.name,
      "description": blurb,
      "image": p.image,
      "brand": { "@type": "Brand", "name": "The Fashion Hub" },
      "offers": {
        "@type": "Offer",
        "url": url,
        "priceCurrency": "INR",
        "price": price,
        "availability": "https://schema.org/InStock",
        "seller": { "@type": "Organization", "name": "Meesho" }
      },
      "aggregateRating": rating && ratingCount ? {
        "@type": "AggregateRating",
        "ratingValue": rating,
        "reviewCount": ratingCount,
        "bestRating": 5,
        "worstRating": 1
      } : undefined
    })}</script>`,
    // JSON-LD BreadcrumbList schema
    `<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/" },
        { "@type": "ListItem", "position": 2, "name": "All Collections", "item": SITE + "/shop" },
        { "@type": "ListItem", "position": 3, "name": p.name, "item": url }
      ]
    })}</script>`,
  ].join("\n    ");
  html = html.replace("</head>", `    ${extra}\n  </head>`);

  const dir = path.join(distDir, "product", p.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
  console.log("meta page:", `/product/${p.slug}`);
}
console.log("done:", PRODUCTS.length, "product pages");
