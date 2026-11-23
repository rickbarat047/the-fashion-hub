export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  subCategory?: string;
  price: number;
  priceLabel?: string;
  currency: string;
  color?: string;
  fabric?: string;
  fit?: string;
  length?: string;
  neck?: string;
  pattern?: string;
  patternType?: string;
  ornamentation?: string;
  sleeve?: string;
  occasion?: string;
  sizes?: string[];
  badge?: string;
  featured: boolean;
  trending: boolean;
  newArrival: boolean;
  rating?: number;
  ratingCount?: number;
  meeshoProductId?: string;
  meeshoAffiliateUrl: string;
  images: string[];
  description: string;
  highlights: string[];
  stylingNote?: string;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  sortBy?: "featured" | "price-asc" | "price-desc" | "newest";
  occasion?: string;
  fabric?: string;
}
