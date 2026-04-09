import prisma from '@/lib/prisma';

/**
 * Searches for products in the Bopstore database.
 * @param {object} filters - Structured search filters.
 * @returns {Promise<Array<object>>} - A list of matching products.
 */
export async function searchProduct(filters) {
  const { query, category, minPrice, maxPrice, isHotDeal } = filters;

// Filter out common stop-words to increase relevance
  const stopWords = ['new', 'brand', 'i', 'want', 'need', 'to', 'buy', 'a', 'the'];
  const keywords = query.split(/\s+/)
    .filter(word => word.length > 1 && !stopWords.includes(word.toLowerCase()));

  const products = await prisma.product.findMany({
    where: {
      isArchived: false,
      stock: { gt: 0 }, // Only show items in stock
      ...(isHotDeal !== undefined && { isHotDeal }),
      ...(category && { category: { contains: category, mode: 'insensitive' } }),
      ...( (minPrice || maxPrice) && {
        price: {
          ...(minPrice && { gte: minPrice }),
          ...(maxPrice && { lte: maxPrice }),
        }
      }),
      AND: keywords.map(word => ({
        OR: [
          { name: { contains: word, mode: 'insensitive' } },
          { description: { contains: word, mode: 'insensitive' } },
        ]
      }))
    },
    orderBy: { createdAt: 'desc' },
    take: 5, // Limit results for brevity
  });
  return products;
}