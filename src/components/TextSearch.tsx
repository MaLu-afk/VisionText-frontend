import { useState } from 'react';
import { Search, Loader2, Image as ImageIcon } from 'lucide-react';
import { searchByText } from '../services/api';
import type { SearchResult, SearchResponse } from '../types';

export default function TextSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchStats, setSearchStats] = useState<{ count: number; time: number } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Por favor ingresa un texto para buscar');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setSearchStats(null);

    try {
      const response: SearchResponse = await searchByText({
        query: query.trim(),
        limit: 20,
        threshold: 0.1
      });

      setResults(response.results);
      setSearchStats({
        count: response.total_count,
        time: response.query_time
      });

      if (response.results.length === 0) {
        setError('No se encontraron imágenes similares. Intenta con otra descripción.');
      }
    } catch (err) {
      setError('Error al realizar la búsqueda. Por favor intenta nuevamente.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatSimilarity = (score: number): string => {
    return `${(score * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Búsqueda por Texto
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Describe lo que quieres buscar y nuestro sistema encontrará las imágenes más similares usando inteligencia artificial
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej: un perro corriendo en el parque, paisajes montañosos, flores rojas..."
            className="w-full px-4 py-3 pr-12 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Search Stats */}
      {searchStats && (
        <div className="max-w-2xl mx-auto p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700 text-sm">
            Se encontraron <span className="font-semibold">{searchStats.count}</span> resultados en{' '}
            <span className="font-semibold">{searchStats.time.toFixed(2)}s</span>
          </p>
        </div>
      )}

      {/* Results Grid */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">Resultados encontrados</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map((result) => (
              <div
                key={result.id}
                className="bg-white rounded-lg shadow-md overflow-hidden image-card cursor-pointer"
                onClick={() => window.open(result.url, '_blank')}
              >
                <div className="aspect-square relative bg-gray-100">
                  {result.thumbnail_url ? (
                    <img
                      src={result.thumbnail_url}
                      alt={result.filename}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 grid place-items-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-semibold">
                    {formatSimilarity(result.similarity_score)}
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm text-gray-700 truncate font-medium">{result.filename}</p>
                  {result.metadata && (
                    <p className="text-xs text-gray-500 mt-1">
                      {result.metadata.width}×{result.metadata.height} • {(result.metadata.size / 1024).toFixed(1)}KB
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Buscando imágenes...</p>
        </div>
      )}
    </div>
  );
}