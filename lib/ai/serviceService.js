import prisma from '@/lib/prisma';

// Named-area distance can be improved over time by adding more Bopstore service
// areas here. Text matching still works for locations not yet listed.
const LOCATION_CENTERS = {
  isolo: { latitude: 6.5366, longitude: 3.3234 },
  ikeja: { latitude: 6.6018, longitude: 3.3515 },
  lekki: { latitude: 6.4350, longitude: 3.5316 },
  ajah: { latitude: 6.4650, longitude: 3.5700 },
  victoria: { latitude: 6.4281, longitude: 3.4214 },
  yaba: { latitude: 6.5129, longitude: 3.3849 },
  ikeja: { latitude: 6.6018, longitude: 3.3515 },
  abule: { latitude: 6.4500, longitude: 3.3850 },
};

function normalizeLocation(value = '') {
  return value.toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function getLocationTerms(locationQuery) {
  return normalizeLocation(locationQuery)
    .split(' ')
    .filter(term => term.length > 2 && !['lagos', 'state', 'nigeria'].includes(term));
}

function getLocationCenter(locationQuery) {
  const normalizedLocation = normalizeLocation(locationQuery);
  return Object.entries(LOCATION_CENTERS)
    .find(([area]) => normalizedLocation.includes(area))?.[1] || null;
}

function getServiceLocationCenter(service) {
  if (service.latitude != null && service.longitude != null) {
    return { latitude: service.latitude, longitude: service.longitude };
  }

  const addressCenter = getLocationCenter(service.address || '');
  if (addressCenter) return addressCenter;

  return null;
}

/**
 * Finds service providers near a given location.
 * @param {string} serviceType - The type of service (e.g., 'tailor').
 * @param {number} latitude - User's current latitude.
 * @param {number} longitude - User's current longitude.
 * @param {number} [minRating] - Optional minimum rating for service providers.
 * @param {object} [location] - How the user expressed their location preference.
 * @returns {Promise<Array<object>>} - A list of nearby service providers.
 */
export async function findNearbyServices(serviceType, latitude, longitude, minRating, location = {}) {
  const locationMode = location.locationMode || 'any';
  const locationQuery = location.locationQuery || '';
  const hasUserCoordinates = locationMode === 'nearby' && latitude != null && longitude != null;
  const requestedLocationCenter = locationMode === 'explicit' ? getLocationCenter(locationQuery) : null;
  const locationTerms = getLocationTerms(locationQuery);

  const where = {
    type: 'service',
    isActive: true,
    ...(minRating && { rating: { gte: minRating } }),
    OR: [
      { category: { contains: serviceType, mode: 'insensitive' } },
      {
        Product: {
          some: {
            isArchived: false,
            category: { contains: serviceType, mode: 'insensitive' },
          },
        },
      },
    ],
  };

  const services = await prisma.store.findMany({
    where,
    select: {
      id: true,
      name: true,
      address: true,
      description: true,
      contact: true,
      whatsappNumber: true,
      latitude: true,
      longitude: true,
      logo: true,
      rating: true,
      Product: {
        where: {
          isArchived: false,
          category: { contains: serviceType, mode: 'insensitive' },
        },
        select: {
          description: true,
        },
      },
    },
    take: 50,
  });

  return services
    .map(service => {
      const serviceLocationText = normalizeLocation(`${service.address} ${service.description} ${service.Product.map(product => product.description || '').join(' ')}`);
      const textLocationMatch = locationTerms.length > 0 && locationTerms.every(term => serviceLocationText.includes(term));
      const serviceCenter = getServiceLocationCenter(service);
      const requestedAreaDistance = serviceCenter && requestedLocationCenter
        ? calculateDistance(requestedLocationCenter.latitude, requestedLocationCenter.longitude, serviceCenter.latitude, serviceCenter.longitude)
        : null;
      const userDistance = serviceCenter && hasUserCoordinates
        ? calculateDistance(latitude, longitude, serviceCenter.latitude, serviceCenter.longitude)
        : null;

      return {
        ...service,
        textLocationMatch,
        requestedAreaDistance,
        userDistance,
      };
    })
    .filter(service => {
      if (locationMode !== 'explicit') return true;
      // A coordinate match supports providers whose profile text has not yet
      // been standardized, while keeping the named-area result relevant.
      return service.textLocationMatch || (service.requestedAreaDistance != null && service.requestedAreaDistance <= 10);
    })
    .sort((a, b) => {
      if (locationMode === 'nearby') {
        if (a.userDistance == null && b.userDistance == null) return b.rating - a.rating;
        if (a.userDistance == null) return 1;
        if (b.userDistance == null) return -1;
        return a.userDistance - b.userDistance;
      }

      if (locationMode === 'explicit') {
        if (a.textLocationMatch !== b.textLocationMatch) return a.textLocationMatch ? -1 : 1;
        if (a.requestedAreaDistance != null && b.requestedAreaDistance != null) return a.requestedAreaDistance - b.requestedAreaDistance;
        if (a.requestedAreaDistance != null) return -1;
        if (b.requestedAreaDistance != null) return 1;
      }

      return b.rating - a.rating;
    })
    .slice(0, 5)
    .map(({ Product, description, textLocationMatch, requestedAreaDistance, userDistance, ...service }) => ({
      ...service,
      distance: locationMode === 'nearby' && userDistance != null
        ? `${userDistance.toFixed(1)} km away`
        : locationMode === 'explicit' && requestedAreaDistance != null
          ? `${requestedAreaDistance.toFixed(1)} km from ${locationQuery}`
          : userDistance != null
            ? `${userDistance.toFixed(1)} km away`
            : 'Distance unknown',
    }));
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
