/**
 * Site Configuration for The Fashion Hub
 * Editorial Luxury Fashion Storefront
 */
export const siteConfig = {
  brandName: "The Fashion Hub",
  brandTagline: "Curated Women's Fashion Edit",
  curatorName: "Fashion Hub Studio",
  creatorBio: "A considered edit of modern Indian kurtis and quiet luxury garments handpicked from Meesho, bypassing endless scrolling for genuine sartorial poise.",
  instagramUrl: "https://www.instagram.com/the_fashion_hub46?stkn=bGd6ZHNwN3A3dDJh",
  instagramHandle: "@the_fashion_hub46",
  affiliateDisclosure: "Some links on this website are affiliate links. We may earn a small commission when you purchase through our links, at no extra cost to you. Orders, checkout, fulfillment, and customer service are processed directly by Meesho.",
  primaryAccent: "#8E4A38", // Deep earthy terracotta
  accentLight: "#F4EFEA",
  meeshoBadgeText: "Verified on Meesho",
  categories: [
    {
      id: "kurtis",
      name: "Kurtis",
      description: "Breathable cottons, ajrakh motifs & versatile silhouettes for every day.",
      slug: "kurtis",
    },
    {
      id: "ethnic-wear",
      name: "Ethnic Wear",
      description: "Timeless traditional crafts reimagined for the contemporary closet.",
      slug: "ethnic-wear",
    },
    {
      id: "everyday-edit",
      name: "Everyday Edit",
      description: "Effortless, comfortable statement pieces designed for routine polish.",
      slug: "everyday-edit",
    },
    {
      id: "festive-edit",
      name: "Festive Edit",
      description: "Rich silk blends, embroidery details & celebratory palettes.",
      slug: "festive-edit",
    },
  ],
  navLinks: [
    { label: "SHOP", href: "/shop" },
    { label: "COLLECTIONS", href: "/shop?category=Kurtis" },
    { label: "NEW", href: "/shop?category=__new" },
    { label: "ABOUT", href: "/#about" },
  ],
};
