import { GoogleGenAI } from "@google/genai";
import { AviationStackFlight } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFlightInsights = async (flight: AviationStackFlight): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Gemini API Key is missing. Unable to generate insights.";
  }

  try {
    const prompt = `
      Analyze the following flight details and provide a brief, engaging summary for an aviation enthusiast.
      
      Flight: ${flight.airline?.name || 'Unknown Airline'} flight ${flight.flight?.iata || flight.flight?.number || 'Unknown'}
      Route: ${flight.departure?.airport || 'Unknown Origin'} (${flight.departure?.iata || '---'}) to ${flight.arrival?.airport || 'Unknown Destination'} (${flight.arrival?.iata || '---'})
      Aircraft: ${flight.aircraft?.iata || 'Unknown Type'} (Registration: ${flight.aircraft?.registration || 'N/A'})
      Status: ${flight.flight_status}
      Current Altitude: ${flight.live?.altitude ? Math.round(flight.live.altitude * 3.28084) + ' ft' : 'N/A'}
      Current Speed: ${flight.live?.speed_horizontal ? Math.round(flight.live.speed_horizontal * 0.539957) + ' kts' : 'N/A'}

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
    return "Unable to generate AI insights at this time.";
  }
};

export const chatAboutFlight = async (history: {role: string, content: string}[], newMessage: string, flightContext: AviationStackFlight): Promise<string> => {
    if (!process.env.API_KEY) return "Gemini API Key missing.";

    const systemInstruction = `You are SkyTrack AI, an expert aviation assistant. 
    You are currently tracking flight ${flightContext.flight?.iata || flightContext.flight?.number || 'Unknown'} from ${flightContext.departure?.airport || 'Unknown'} to ${flightContext.arrival?.airport || 'Unknown'}.
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