import prisma from '@/lib/prisma';

/**
 * Searches for products in the Bopstore database.
 * @param {string} query - The search query for the product.
 * @returns {Promise<Array<object>>} - A list of matching products.
 */
export async function searchProduct(query) {
  // Split query into individual words to make search more flexible
  // e.g., "adidas shoe" -> ["adidas", "shoe"]
// Filter out common stop-words to increase relevance
  const stopWords = ['new', 'brand', 'i', 'want', 'need', 'to', 'buy', 'a', 'the'];
  const keywords = query.split(/\s+/)
    .filter(word => word.length > 1 && !stopWords.includes(word.toLowerCase()));
  const products = await prisma.product.findMany({
    where: {
      AND: keywords.map(word => ({
        OR: [
          { name: { contains: word, mode: 'insensitive' } },
          { description: { contains: word, mode: 'insensitive' } },
          { category: { contains: word, mode: 'insensitive' } }
        ]
      }))
    },
    take: 5, // Limit results for brevity
  });
  return products;
}