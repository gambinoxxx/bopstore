const SERVICE_ALIASES = {
  mechanic: ['mechanic', 'mechanics', 'auto repair', 'car repair', 'vehicle repair'],
  tailor: ['tailor', 'tailoring', 'seamstress', 'fashion designer'],
  plumber: ['plumber', 'plumbing'],
  electrician: ['electrician', 'electrical repair'],
  barber: ['barber', 'barbershop'],
  cleaner: ['cleaner', 'cleaning service'],
  photographer: ['photographer', 'photography'],
};

// These filters match the category values currently accepted by Bopstore.
// We use a shared category fragment where appropriate so, for example, a
// search for shoes can also find "Female shoes" and "unisex shoe".
const PRODUCT_CATEGORY_ALIASES = [
  { filter: 'phone', aliases: ['phone', 'phones', 'tablet', 'tablets', 'iphone', 'android'] },
  { filter: 'laptop', aliases: ['laptop', 'laptops', 'desktop', 'desktops', 'computer', 'computers'] },
  { filter: 'television', aliases: ['television', 'televisions', 'tv', 'tvs', 'audio', 'speaker', 'speakers'] },
  { filter: 'camera', aliases: ['camera', 'cameras'] },
  { filter: 'appliance', aliases: ['appliance', 'appliances', 'fridge', 'refrigerator', 'washing machine', 'blender'] },
  { filter: 'fashion', aliases: ['fashion', 'clothes', 'clothing', 'outfit', 'outfits', 'dress', 'dresses', 'jean', 'jeans', 'trouser', 'trousers'] },
  { filter: 'shirt', aliases: ['shirt', 'shirts', 't-shirt', 't-shirts'] },
  { filter: 'shoe', aliases: ['shoe', 'shoes', 'sneaker', 'sneakers', 'footwear', 'slipper', 'slippers', 'sandal', 'sandals'] },
  { filter: 'watch', aliases: ['watch', 'watches'] },
  { filter: 'makeup', aliases: ['makeup', 'cosmetic', 'cosmetics'] },
  { filter: 'beauty', aliases: ['beauty'] },
  { filter: 'grocer', aliases: ['grocery', 'groceries', 'food', 'foods'] },
  { filter: 'furniture', aliases: ['furniture', 'office chair', 'table', 'tables'] },
  { filter: 'kitchen', aliases: ['kitchen', 'dining', 'cookware'] },
  { filter: 'baby', aliases: ['baby', 'babies'] },
  { filter: 'gaming', aliases: ['gaming', 'console', 'consoles', 'playstation', 'xbox'] },
  { filter: 'sport', aliases: ['sport', 'sports', 'sporting'] },
  { filter: 'automobile', aliases: ['automobile', 'car part', 'car parts', 'auto part', 'auto parts'] },
  { filter: 'book', aliases: ['book', 'books', 'media'] },
  { filter: 'jewelry', aliases: ['jewelry', 'jewellery', 'ring', 'rings', 'necklace', 'necklaces'] },
  { filter: 'drone', aliases: ['drone', 'drones'] },
  { filter: 'clipper', aliases: ['clipper', 'clippers'] },
  { filter: 'fragrance', aliases: ['fragrance', 'fragrances', 'perfume', 'perfumes'] },
  { filter: 'health', aliases: ['health', 'wellness', 'supplement', 'supplements', 'bodybuilding'] },
  { filter: 'bag', aliases: ['bag', 'bags', 'handbag', 'handbags'] },
  { filter: 'jersey', aliases: ['jersey', 'jerseys'] },
];

const PRICE_PATTERN = /(?:₦|ngn|naira)?\s*(\d{1,3}(?:,\d{3})+|\d+)(?:\s*(?:to|and|-|–)\s*(?:₦|ngn|naira)?\s*(\d{1,3}(?:,\d{3})+|\d+))?/i;

function toAmount(value) {
  return Number(value.replace(/,/g, ''));
}

function extractPriceRange(message) {
  const match = message.match(PRICE_PATTERN);
  if (!match) return {};

  const firstAmount = toAmount(match[1]);
  const secondAmount = match[2] ? toAmount(match[2]) : null;
  const mentionsCurrency = /₦|ngn|naira/i.test(match[0]);

  // Avoid mistaking ordinary quantities, such as "2 black shoes", for prices.
  if (!mentionsCurrency && firstAmount < 500) return {};

  if (secondAmount != null) {
    return {
      minPrice: Math.min(firstAmount, secondAmount),
      maxPrice: Math.max(firstAmount, secondAmount),
    };
  }

  if (/under|below|less than|maximum|max\b/i.test(message)) return { maxPrice: firstAmount };
  if (/over|above|more than|minimum|min\b/i.test(message)) return { minPrice: firstAmount };

  return {};
}

/**
 * Detects unambiguous catalog requests without relying on an external model.
 * Ambiguous conversation continues through the existing AI intent detector.
 */
export function extractCatalogQuery(message) {
  const normalized = message.toLowerCase().replace(/\s+/g, ' ').trim();
  if (!normalized) return null;

  for (const [serviceType, aliases] of Object.entries(SERVICE_ALIASES)) {
    if (aliases.some(alias => normalized.includes(alias))) {
      return { intent: 'find_service', service_type: serviceType };
    }
  }

  const priceRange = extractPriceRange(normalized);
  const category = PRODUCT_CATEGORY_ALIASES.find(({ aliases }) =>
    aliases.some(alias => new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`, 'i').test(normalized))
  )?.filter;
  const asksForProducts = /\b(buy|find|search|show|looking for|need|want|product|products|item|items)\b/i.test(normalized);

  if (category || (asksForProducts && Object.keys(priceRange).length > 0)) {
    return {
      intent: 'search_product',
      query: normalized,
      ...(category && { category }),
      ...priceRange,
    };
  }

  return null;
}
