import prisma from '@/lib/prisma';

/**
 * Searches for products in the Bopstore database.
 * @param {object} filters - Structured search filters.
 * @returns {Promise<Array<object>>} - A list of matching products.
 */
export async function searchProduct(filters) {
  const { query, category, brand, color, minPrice, maxPrice, isHotDeal } = filters;

// Filter out common stop-words to increase relevance
  const stopWords = ['new', 'brand', 'i', 'want', 'need', 'to', 'buy', 'a', 'the'];
  const keywords = query ? query.split(/\s+/).filter(word => word.length > 1 && !stopWords.includes(word.toLowerCase())) : [];

  const baseWhere = {
    isArchived: false,
    stock: { gt: 0 },
    ...(isHotDeal !== undefined && { isHotDeal }),
    ...((minPrice || maxPrice) && {
      price: {
        ...(minPrice && { gte: minPrice }),
        ...(maxPrice && { lte: maxPrice }),
      }
    }),
  };

  // 1. Attempt Strict Keyword Search (AND)
  let products = await prisma.product.findMany({
    where: {
      ...baseWhere,
      ...(category && { category: { contains: category, mode: 'insensitive' } }),
      AND: keywords.map(word => ({
        OR: [
          { name: { contains: word, mode: 'insensitive' } },
          { description: { contains: word, mode: 'insensitive' } },
        ]
      }))
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  // 2. Fallback: Search by Category or Brand (Netflix Style Pivot)
  if (products.length === 0 && (category || brand)) {
    products = await prisma.product.findMany({
      where: {
        ...baseWhere,
        OR: [
          category ? { category: { contains: category, mode: 'insensitive' } } : {},
          brand ? { name: { contains: brand, mode: 'insensitive' } } : {},
        ]
      },
      take: 5,
    });
    if (products.length > 0) products.isAlternative = true;
  }

  // 3. Last Resort: Loose Keyword Search (OR)
  if (products.length === 0 && keywords.length > 0) {
    products = await prisma.product.findMany({
      where: {
        ...baseWhere,
        OR: keywords.map(word => ({
          name: { contains: word, mode: 'insensitive' }
        }))
      },
      take: 5,
    });
    if (products.length > 0) products.isAlternative = true;
  }

  return products;
}