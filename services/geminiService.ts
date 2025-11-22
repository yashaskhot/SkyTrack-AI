
import { GoogleGenAI } from "@google/genai";
import { AviationStackFlight } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFlightInsights = async (flight: AviationStackFlight): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Gemini API Key is missing. Unable to generate insights.";
  }

  if (!flight) {
    return "No flight data available.";
  }

  try {
    // Defensive data extraction to prevent "Cannot read property of null"
    const airlineName = flight.airline?.name || 'Unknown Airline';
    const flightCode = flight.flight?.iata || flight.flight?.number || 'Unknown Flight';
    
    const depAirport = flight.departure?.airport || 'Unknown Origin';
    const depIata = flight.departure?.iata || '---';
    
    const arrAirport = flight.arrival?.airport || 'Unknown Destination';
    const arrIata = flight.arrival?.iata || '---';
    
    const aircraftType = flight.aircraft?.iata || 'Unknown Type';
    const aircraftReg = flight.aircraft?.registration || 'N/A';
    
    const status = flight.flight_status || 'Unknown';
    
    const altitude = flight.live?.altitude ? `${Math.round(flight.live.altitude * 3.28084)} ft` : 'N/A';
    const speed = flight.live?.speed_horizontal ? `${Math.round(flight.live.speed_horizontal * 0.539957)} kts` : 'N/A';

    const prompt = `
      Analyze the following flight details and provide a brief, engaging summary for an aviation enthusiast.
      
      Flight: ${airlineName} flight ${flightCode}
      Route: ${depAirport} (${depIata}) to ${arrAirport} (${arrIata})
      Aircraft: ${aircraftType} (Registration: ${aircraftReg})
      Status: ${status}
      Current Altitude: ${altitude}
      Current Speed: ${speed}

      Please include:
      1. A quick fact about the airline or aircraft type.
      2. What passengers might be experiencing right now (e.g. "Cruising over the Atlantic").
      3. A brief note about the destination city.
      
      Keep it under 150 words. Format as markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No insights available.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate AI insights at this time. Please try again later.";
  }
};

export const chatAboutFlight = async (history: {role: string, content: string}[], newMessage: string, flightContext: AviationStackFlight): Promise<string> => {
    if (!process.env.API_KEY) return "Gemini API Key missing.";

    const flightCode = flightContext.flight?.iata || flightContext.flight?.number || 'Unknown';
    const depAirport = flightContext.departure?.airport || 'Unknown';
    const arrAirport = flightContext.arrival?.airport || 'Unknown';

    const systemInstruction = `You are SkyTrack AI, an expert aviation assistant. 
    You are currently tracking flight ${flightCode} from ${depAirport} to ${arrAirport}.
    Answer the user's questions about this flight, the aircraft, the airline, or aviation in general. 
    Be concise, professional, and helpful.`;

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction
        },
        history: history.map(h => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }]
        }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "I couldn't process that.";
};
