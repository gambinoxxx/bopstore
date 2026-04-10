import prisma from '@/lib/prisma';

/**
 * Finds service providers near a given location.
 * @param {string} serviceType - The type of service (e.g., 'tailor').
 * @param {number} latitude - User's current latitude.
 * @param {number} longitude - User's current longitude.
 * @param {number} [minRating] - Optional minimum rating for service providers.
 * @returns {Promise<Array<object>>} - A list of nearby service providers.
 */
export async function findNearbyServices(serviceType, latitude, longitude, minRating) {
  // Define a bounding box (roughly 50km) to narrow down the search before sorting by distance
  // This is much faster than calculating distance for every store in the DB
  const range = 0.5; // Approx 50km in degrees
  const hasLocation = latitude != null && longitude != null;

  const where = {
    category: { equals: serviceType, mode: 'insensitive' },
    type: 'service',
    isActive: true,
    ...(minRating && { rating: { gte: minRating } }),
  };

  if (hasLocation) {
    where.latitude = {
      gte: latitude - range,
      lte: latitude + range,
    };
    where.longitude = {
      gte: longitude - range,
      lte: longitude + range,
    };
  }

  const services = await prisma.store.findMany({
    where,
    select: {
      id: true,
      name: true,
      address: true,
      contact: true,
      whatsappNumber: true,
      latitude: true,
      longitude: true,
      logo: true,
    },
    take: 10,
  });

  if (!hasLocation) {
    return services.map(service => ({ ...service, distance: 'Distance unknown' }));
  }

  // Calculate actual distance using Haversine formula and sort
  return services.map(service => {
    const distance = calculateDistance(latitude, longitude, service.latitude, service.longitude);
    return { ...service, distance: distance.toFixed(1) + ' km' };
  }).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance)).slice(0, 5);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}