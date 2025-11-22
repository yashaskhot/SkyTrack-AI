import React, { useState, useEffect, useRef } from 'react';
import { AviationStackFlight } from '../types';
import { Plane, MapPin, Clock, Wind, ArrowRight, Bot, Send, X } from 'lucide-react';
import { getFlightInsights, chatAboutFlight } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface Props {
  flight: AviationStackFlight;
  onClose: () => void;
}

const FlightDetail: React.FC<Props> = ({ flight, onClose }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset state on new flight selection
    setInsight(null);
    setMessages([]);
    setIsChatting(false);
    
    const fetchInsight = async () => {
      setLoadingInsight(true);
      const text = await getFlightInsights(flight);
      setInsight(text);
      setLoadingInsight(false);
    };

    fetchInsight();
  }, [flight]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsChatting(true);

    const response = await chatAboutFlight([...messages, userMsg], input, flight);
    setMessages(prev => [...prev, { role: 'model', content: response }]);
    setIsChatting(false);
  };

  return (
    <div className="absolute right-0 top-0 h-full w-full max-w-md bg-slate-900/95 backdrop-blur-md border-l border-slate-700 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out z-20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
        <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plane className="text-emerald-400" />
                {flight.airline?.name || 'Unknown Airline'}
            </h2>
            <span className="text-xs font-mono text-slate-400">{flight.flight?.iata || flight.flight?.number || 'N/A'} • {flight.flight_status}</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700">
            <X className="h-5 w-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        
        {/* Route Info */}
        <div className="flex items-center justify-between bg-slate-800 p-4 rounded-lg border border-slate-700">
            <div className="text-center">
                <div className="text-2xl font-bold text-sky-400">{flight.departure?.iata || '---'}</div>
                <div className="text-xs text-slate-500 truncate max-w-[80px]">
                    {flight.departure?.airport?.split(' ')[0] || 'Unknown'}
                </div>
            </div>
            <ArrowRight className="text-slate-600" />
            <div className="text-center">
                <div className="text-2xl font-bold text-sky-400">{flight.arrival?.iata || '---'}</div>
                <div className="text-xs text-slate-500 truncate max-w-[80px]">
                    {flight.arrival?.airport?.split(' ')[0] || 'Unknown'}
                </div>
            </div>
        </div>

        {/* Flight Stats */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Wind className="h-3 w-3" /> Speed
                </div>
                <div className="text-lg font-mono text-white">
                    {flight.live?.speed_horizontal ? Math.round(flight.live.speed_horizontal * 0.539957) : '---'} <span className="text-xs text-slate-500">kts</span>
                </div>
            </div>
            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Clock className="h-3 w-3" /> Altitude
                </div>
                <div className="text-lg font-mono text-white">
                    {flight.live?.altitude ? Math.round(flight.live.altitude * 3.28084).toLocaleString() : '---'} <span className="text-xs text-slate-500">ft</span>
                </div>
            </div>
        </div>

        {/* AI Insights Section */}
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-purple-400 font-semibold">
                <Bot className="h-4 w-4" />
                <span>AI Flight Analyst</span>
            </div>
            
            <div className="bg-slate-800/50 border border-purple-900/30 rounded-lg p-4 text-sm text-slate-300 leading-relaxed">
                {loadingInsight ? (
                    <div className="flex items-center gap-2 animate-pulse">
                        <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                        <span>Analysing flight data...</span>
                    </div>
                ) : (
                    <div className="markdown-prose">
                       {insight?.split('\n').map((line, i) => <p key={i} className="mb-2">{line}</p>)}
                    </div>
                )}
            </div>
        </div>

        {/* Chat Interface */}
        <div className="space-y-3 pt-4 border-t border-slate-700">
            <h3 className="text-sm font-medium text-slate-400">Ask about this flight</h3>
            <div className="h-64 bg-slate-950 rounded-lg border border-slate-800 flex flex-col">
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {messages.length === 0 && (
                        <div className="text-center text-xs text-slate-600 mt-10">
                            Ask things like "What's the weather in {flight.arrival?.iata || 'destination'}?" or "Tell me about this aircraft."
                        </div>
                    )}
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-lg p-2 text-xs ${
                                msg.role === 'user' 
                                ? 'bg-sky-600 text-white' 
                                : 'bg-slate-800 text-slate-200'
                            }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                     {isChatting && (
                         <div className="flex justify-start">
                             <div className="bg-slate-800 rounded-lg p-2">
                                 <div className="flex gap-1">
                                     <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                     <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                     <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                                 </div>
                             </div>
                         </div>
                     )}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSend} className="p-2 border-t border-slate-800 flex gap-2">
                    <input 
                        className="flex-1 bg-slate-900 border border-slate-700 rounded text-xs px-2 py-1 text-white focus:outline-none focus:border-sky-500"
                        placeholder="Ask Gemini..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                    />
                    <button type="submit" disabled={isChatting} className="bg-sky-600 hover:bg-sky-500 text-white p-1.5 rounded transition-colors">
                        <Send className="h-3 w-3" />
                    </button>
                </form>
            </div>
        </div>

      </div>
    </div>
  );
};

export default FlightDetail;