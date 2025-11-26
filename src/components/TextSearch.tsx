import { useState } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';
import { searchByText } from '../services/api';
import type { SearchResponse } from '../types';

export default function TextSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
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
        query: query.trim()
        // Usa el threshold por defecto del backend (configurado en .env)
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
    <div className="space-y-8">
      {/* Search Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-gold-50 text-brand-gold-600 text-sm font-medium mb-2 border border-brand-gold-100">
          <Sparkles className="w-4 h-4 mr-2" />
          Búsqueda Semántica
        </div>
        <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
          Encuentra la imagen perfecta
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto text-lg">
          Describe lo que buscas con lenguaje natural y deja que nuestra IA haga el resto.
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative z-10">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-red-600 to-brand-gold-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej: un perro corriendo en el parque al atardecer..."
              className="w-full px-6 py-4 pl-14 text-lg bg-white border-0 rounded-2xl shadow-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-brand-red-600 transition-all"
              disabled={loading}
            />
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 w-6 h-6" />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-brand-red-600 text-white rounded-xl font-medium hover:bg-brand-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-red-100"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Buscar'
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-100 rounded-xl flex items-center text-brand-red-700 animate-in fade-in slide-in-from-top-2 shadow-sm">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Search Stats */}
      {searchStats && (
        <div className="max-w-2xl mx-auto text-center animate-in fade-in slide-in-from-top-2">
          <p className="text-slate-500 text-sm bg-white/50 inline-block px-4 py-1 rounded-full backdrop-blur-sm border border-slate-200">
            Encontrados <span className="font-semibold text-brand-red-600">{searchStats.count}</span> resultados en{' '}
            <span className="font-semibold text-brand-red-600">{searchStats.time.toFixed(2)}s</span>
          </p>
        </div>
      )}

      {/* Results Grid */}
      {results.length > 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map((result) => (
              <div
                key={result.id}
                className="bg-white rounded-2xl overflow-hidden card-hover border border-slate-100 cursor-pointer group"
                onClick={() => window.open(result.url, '_blank')}
              >
                <div className="aspect-square relative bg-slate-100 overflow-hidden">
                  {result.thumbnail_url ? (
                    <img
                      src={result.thumbnail_url}
                      alt={result.filename}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  {/* Removed ImageIcon watermark */}

                  {/* Similarity Badge */}
                  <div className="absolute top-3 right-3">
                    <div className="bg-brand-red-600/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg border border-white/10">
                      {formatSimilarity(result.similarity_score)}
                    </div>
                  </div>

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-red-700/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div className="p-4">
                  <h3 className="text-sm font-semibold text-slate-900 truncate mb-1 group-hover:text-brand-red-600 transition-colors">{result.filename}</h3>
                  {result.metadata && (
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{result.metadata.width} × {result.metadata.height}</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded-full">{(result.metadata.size / 1024).toFixed(0)} KB</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-brand-red-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <Loader2 className="w-12 h-12 animate-spin text-brand-red-600 relative z-10" />
          </div>
          <p className="text-slate-500 mt-4 font-medium">Explorando el universo visual...</p>
        </div>
      )}
    </div>
  );
}