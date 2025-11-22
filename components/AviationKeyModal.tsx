import React, { useState } from 'react';
import { Key, ExternalLink } from 'lucide-react';

interface Props {
  onSave: (key: string) => void;
}

const AviationKeyModal: React.FC<Props> = ({ onSave }) => {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      setLoading(true);
      // Simple valid check simulation
      setTimeout(() => {
        onSave(key.trim());
        setLoading(false);
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-800 shadow-2xl shadow-sky-900/20">
        <div className="p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="rounded-full bg-sky-500/10 p-3">
              <Key className="h-8 w-8 text-sky-400" />
            </div>
          </div>
          
          <h2 className="text-center text-2xl font-bold text-white mb-2">Enter Access Key</h2>
          <p className="text-center text-slate-400 text-sm mb-6">
            To track real-time flights, this app requires an <strong>aviationstack</strong> API key.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">API Access Key</label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                placeholder="Enter your aviationstack key"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-sky-500 px-4 py-2 font-medium text-white hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Verifying...' : 'Start Tracking'}
            </button>
          </form>

          <div className="mt-6 flex justify-center">
             <a 
               href="https://aviationstack.com/product" 
               target="_blank" 
               rel="noreferrer"
               className="flex items-center text-xs text-sky-400 hover:text-sky-300 transition-colors"
             >
               <span>Get a free API key</span>
               <ExternalLink className="ml-1 h-3 w-3" />
             </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AviationKeyModal;
