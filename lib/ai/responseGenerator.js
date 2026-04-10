/**
 * Generates a structured JSON response for product search.
 * @param {Array<object>} products - List of product objects.
 * @returns {object}
 */
export function generateProductResponse(products) {
  if (products && products.length > 0) {
    return {
      intent: "search_product",
      status: "success",
      content: products.isAlternative ? `I don't have that exact item right now, but here are some great alternatives you might love! 👇` : `I found ${products.length} product(s) matching your query:`,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.images?.[0] || null, // Assuming first image is primary
        description: p.description,
      })),
    };
  } else {
    return {
      intent: "search_product",
      status: "not_found",
      content: "I couldn't find exactly that in our current stock, but I can suggest some great alternatives or help you search for something similar! What do you think?",
    };
  }
}

/**
 * Generates a structured JSON response for service search.
 * @param {Array<object>} services - List of service provider objects.
 * @returns {object}
 */
export function generateServiceResponse(services) {
  return {
    intent: "find_service",
    status: services && services.length > 0 ? "success" : "not_found",
    content: services && services.length > 0 ? `Here are some service providers I found:` : "I couldn't find any service providers matching your criteria.",
    services: services.map(s => ({ 
      id: s.id, 
      name: s.name, 
      address: s.address, 
      phone: s.contact, 
      whatsapp: s.whatsappNumber,
      logo: s.logo,
      distance: s.distance
    })),
  };
}