
import React, { useState, useEffect, useCallback } from 'react';
import { AviationStackFlight, FlightData } from './types';
import Map from './components/Map';
import FlightDetail from './components/FlightDetail';
import AviationKeyModal from './components/AviationKeyModal';
import { fetchFlights } from './services/aviationService';
import { LayoutDashboard, Plane, RotateCw, Search } from 'lucide-react';

const App: React.FC = () => {
  const [aviationKey, setAviationKey] = useState<string | null>(localStorage.getItem('aviation_stack_key'));
  const [flights, setFlights] = useState<AviationStackFlight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<AviationStackFlight | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleKeySave = (key: string) => {
    localStorage.setItem('aviation_stack_key', key);
    setAviationKey(key);
  };

  const loadFlights = useCallback(async () => {
    if (!aviationKey) return;
    setLoading(true);
    try {
      const data = await fetchFlights(aviationKey);
      // Filter for flights that have distinct coordinates or airline names to avoid clutter with empty data
      const validFlights = data.data.filter(f => f.airline?.name && (f.live || f.flight_status === 'active'));
      setFlights(validFlights);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Load failed", error);
      // In a real app, show toast
    } finally {
      setLoading(false);
    }
  }, [aviationKey]);

  useEffect(() => {
    if (aviationKey) {
      loadFlights();
      const interval = setInterval(loadFlights, 60000); // Poll every minute
      return () => clearInterval(interval);
    }
  }, [aviationKey, loadFlights]);

  // Filter flights for sidebar list
  const filteredFlights = flights.filter(f => 
    (f.airline?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.flight?.iata || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.departure?.iata || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.arrival?.iata || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen w-screen bg-slate-900 text-slate-100 flex overflow-hidden">
      {!aviationKey && <AviationKeyModal onSave={handleKeySave} />}

      {/* Sidebar */}
      <div className="w-80 bg-slate-950 border-r border-slate-800 flex-shrink-0 flex flex-col z-10">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-sky-600 p-2 rounded-lg">
              <Plane className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-white">SkyTrack AI</h1>
              <p className="text-xs text-slate-500 font-mono">LIVE MONITORING</p>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search flight, airline..." 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-sky-500 transition-colors text-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Flight List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading && flights.length === 0 ? (
             <div className="p-8 text-center text-slate-500 text-sm animate-pulse">
               Loading Air Traffic...
             </div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {filteredFlights.map((flight, idx) => (
                <button
                  key={`${flight.flight?.iata || idx}-${idx}`}
                  onClick={() => setSelectedFlight(flight)}
                  className={`w-full text-left p-4 hover:bg-slate-900 transition-colors group ${selectedFlight === flight ? 'bg-slate-800 border-l-2 border-sky-500' : 'border-l-2 border-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`font-mono font-bold ${selectedFlight === flight ? 'text-sky-400' : 'text-slate-300 group-hover:text-sky-300'}`}>
                      {flight.flight?.iata || flight.flight?.number || 'N/A'}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900">
                      LIVE
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-slate-400 gap-2 mb-1">
                    <span>{flight.departure?.iata || '---'}</span>
                    <span className="text-slate-600">→</span>
                    <span>{flight.arrival?.iata || '---'}</span>
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {flight.airline?.name || 'Unknown Airline'}
                  </div>
                </button>
              ))}
              {filteredFlights.length === 0 && !loading && (
                 <div className="p-4 text-center text-xs text-slate-600">
                    No flights found matching filters.
                 </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 text-xs text-slate-500 flex justify-between items-center">
           <span>{flights.length} active flights</span>
           <button 
             onClick={loadFlights} 
             disabled={loading}
             className={`p-1.5 rounded hover:bg-slate-800 ${loading ? 'animate-spin' : ''}`}
           >
             <RotateCw className="h-3.5 w-3.5" />
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
         {/* Map Overlay / Stats Header */}
         <div className="absolute top-4 left-4 z-10 flex gap-4">
            <div className="bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg p-3 shadow-lg flex items-center gap-3">
               <div className="bg-emerald-500/10 p-2 rounded-full">
                  <LayoutDashboard className="h-5 w-5 text-emerald-400" />
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">System Status</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-mono text-slate-300">
                      {loading ? 'SYNCING...' : 'ONLINE'}
                    </span>
                  </div>
               </div>
            </div>

            <div className="bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg p-3 shadow-lg flex items-center gap-3">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Last Update</span>
                    <span className="text-xs font-mono text-sky-400">
                      {lastUpdated ? lastUpdated.toLocaleTimeString() : '--:--:--'}
                    </span>
                </div>
            </div>
         </div>

         <Map 
           flights={flights} 
           onSelectFlight={setSelectedFlight} 
           selectedFlight={selectedFlight}
         />

         {selectedFlight && (
           <FlightDetail 
             flight={selectedFlight} 
             onClose={() => setSelectedFlight(null)} 
           />
         )}
      </div>
    </div>
  );
};

export default App;
