export interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

export const geocodeCityOrAddress = async (query: string): Promise<GeocodeResult> => {
  if (!query || !query.trim()) {
    return {
      latitude: 22.307159,
      longitude: 73.181219,
      displayName: 'Vadodara, Gujarat, India',
    };
  }

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'EmgageTrackApplication/1.0',
        },
      }
    );

    const data = await response.json();
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };
    }
  } catch (err) {
    console.warn('OpenStreetMap Nominatim geocoding failed, using fallback:', err);
  }

  // Fallback default coordinates (Vadodara city center)
  return {
    latitude: 22.307159,
    longitude: 73.181219,
    displayName: query,
  };
};
