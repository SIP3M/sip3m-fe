import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, AlertCircle, Loader2 } from 'lucide-react';
import { searchDosen, Dosen } from '../proposal.api';
import { debounce } from 'lodash';
import {
  useFloating,
  useClick,
  useDismiss,
  useInteractions,
  autoUpdate,
  flip,
  shift,
} from '@floating-ui/react';

interface DosenAutocompleteProps {
  onSelect: (dosen: Dosen) => void;
  placeholder?: string;
}

export default function DosenAutocomplete({ 
  onSelect, 
  placeholder = "Cari atau ketik nama dosen..." 
}: DosenAutocompleteProps) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<Dosen[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getFloatingProps } = useInteractions([click, dismiss]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const response = await searchDosen(query);
        setSuggestions(response.data || []);
        setIsOpen(true);
      } catch (err: any) {
        const message = err.message || 'Gagal mencari dosen. Silakan coba lagi.';
        setError(message);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    
    if (value.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setError(null);
    } else {
      debouncedSearch(value);
    }
  };

  const handleSelect = (dosen: Dosen) => {
    setInput(dosen.name);
    setSuggestions([]);
    setIsOpen(false);
    setError(null);
    onSelect(dosen);
  };

  return (
    <div className="relative w-full">
      <div ref={refs.setReference} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onFocus={() => input.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition-all bg-white"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 animate-spin" size={16} />
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-2 flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Dropdown suggestions - using floating-ui */}
      {isOpen && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          className="z-50 bg-white border border-gray-300 rounded-xl shadow-lg max-h-64 overflow-y-auto"
        >
          {suggestions.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {suggestions.map((dosen) => (
                <li key={dosen.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(dosen)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors focus:outline-none focus:bg-blue-50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{dosen.name}</p>
                        <p className="text-xs text-gray-500">{dosen.nidn}</p>
                        <p className="text-xs text-gray-400 truncate">{dosen.fakultas.nama}</p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            !loading && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-gray-500">Tidak ada hasil ditemukan</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
