/**
 * Generates a structured JSON response for product search.
 * @param {Array<object>} products - List of product objects.
 * @returns {object}
 */
export function generateProductResponse(products) {
  if (products.length > 0) {
    return {
      intent: "search_product",
      status: "success",
      message: `Nice choice 👌 I found a few options you might like:`,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.images?.[0] || null,
        description: p.description,
      })),
    };
  }

  return {
    intent: "search_product",
    status: "not_found",
    message: `Hmm… I couldn’t find that exact item 😅  
But I can help you find something similar. Want me to suggest alternatives?`,
  };
}

export function generateServiceResponse(services) {
  if (services.length > 0) {
    return {
      intent: "find_service",
      status: "success",
      message: `Got you 👍 Here are some service providers near you:`,
      services,
    };
  }

  return {
    intent: "find_service",
    status: "not_found",
    message: `I couldn’t find any nearby right now 😕  
Maybe try a different service or location?`,
  };
}
