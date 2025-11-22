# SkyTrack AI ✈️ 🤖

SkyTrack AI is a modern flight tracking application that combines real-time aviation data with the power of Google's Gemini AI. Visualize active flights on an interactive D3 global map, view detailed telemetry, and chat with an AI assistant to get insights about specific flights, airlines, and destinations.

## Features

- **🌍 Interactive Global Map:** Visualizes active flights on a D3.js-powered orthogonal (globe) or mercator projection map.
- **📡 Real-Time Data:** Fetches live flight status, altitude, speed, and route information using the Aviationstack API.
- **🧠 AI Flight Analyst:** Uses **Google Gemini 2.5 Flash** to generate interesting summaries and facts about the selected flight, aircraft, and current location.
- **💬 Contextual AI Chat:** Chat with "SkyTrack AI" to ask specific questions about the flight (e.g., "What is the weather at the destination?", "How old is this aircraft?").
- **🔍 Search & Filter:** Easily find flights by airline, flight number, or airport code.
- **🎨 Modern UI:** A responsive, dark-themed interface built with Tailwind CSS and Lucide icons.

## Tech Stack

- **Frontend:** React 19 (TypeScript)
- **Styling:** Tailwind CSS
- **Visualization:** D3.js, TopoJSON
- **AI:** Google GenAI SDK (`@google/genai`)
- **Data Provider:** Aviationstack API

## Prerequisites

To run this project, you need API keys for the following services:

1.  **Google Gemini API:** Required for AI insights and chat.
    *   Get a key at [Google AI Studio](https://aistudio.google.com/).
2.  **Aviationstack API:** Required for flight data.
    *   Get a free key at [aviationstack.com](https://aviationstack.com/).

## Installation & Setup

1.  **Clone the repository** (or download the source).

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure the Gemini API Key:**
    Set your Gemini API key as an environment variable.
    *   If using a bundler (like Vite/Parcel), creating a `.env` file:
        ```env
        API_KEY=your_google_gemini_api_key_here
        ```
    *   *Note: The application expects `process.env.API_KEY` to be available.*

4.  **Start the development server:**
    ```bash
    npm start
    ```

5.  **Enter Aviationstack Key:**
    *   When the app loads, a modal will ask for your **Aviationstack API Access Key**.
    *   Enter the key to start fetching flight data.
    *   *Note: The key is stored locally in your browser's `localStorage` for convenience.*

## Usage Guide

1.  **Map View:** Click on any plane icon on the map to select a flight.
2.  **Sidebar:** Browse the list of active flights. Use the search bar to filter by airline or airport code (e.g., "LHR", "British Airways").
3.  **Flight Details:** When a flight is selected, a side panel appears:
    *   **Telemetry:** View altitude, speed, and route.
    *   **AI Analyst:** Read a generated summary of the flight.
    *   **Chat:** Type questions into the chat box to interact with the AI regarding the specific flight context.

## Troubleshooting

*   **"Cannot read properties of null"**: Ensure you are using the latest version of the code which handles nullable API fields gracefully.
*   **Map is empty**: The Aviationstack Free Tier has limitations and sometimes does not provide live coordinates (`live` object is null). The application attempts to mock coordinates for active flights if live data is missing to demonstrate functionality.
*   **AI not responding**: Ensure your `API_KEY` environment variable is set correctly and has quota available.

## License

MIT
