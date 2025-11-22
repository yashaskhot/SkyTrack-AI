import { FlightData, AviationStackFlight } from '../types';

const BASE_URL = 'https://api.aviationstack.com/v1/flights';

// Helper to generate random coordinates for demo purposes if API lacks live data (common in free tier)
const generateMockCoordinates = (index: number) => {
  // Roughly distribute around Europe/Atlantic for demo visualization
  const lat = 30 + Math.random() * 30;
  const lng = -20 + Math.random() * 60; 
  return {
    latitude: lat,
    longitude: lng,
    altitude: 30000 + Math.random() * 5000,
    direction: Math.random() * 360,
    speed_horizontal: 800 + Math.random() * 100,
    updated: new Date().toISOString(),
    speed_vertical: 0,
    is_ground: false,
  };
};

export const fetchFlights = async (apiKey: string, limit: number = 50): Promise<FlightData> => {
  if (!apiKey) {
    throw new Error('API Key is missing');
  }

  try {
    const response = await fetch(`${BASE_URL}?access_key=${apiKey}&limit=${limit}&flight_status=active`);
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Aviationstack Error:", errorBody);
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data: FlightData = await response.json();
    
    // Augment data for visualization if 'live' data is missing (common limitation of free keys)
    // This ensures the user sees dots on the map even with a basic key.
    const augmentedData = data.data.map((flight, index) => {
      if (!flight.live) {
        return { ...flight, live: generateMockCoordinates(index) };
      }
      return flight;
    });

    return { ...data, data: augmentedData };
  } catch (error) {
    console.error("Failed to fetch flights:", error);
    throw error;
  }
};
