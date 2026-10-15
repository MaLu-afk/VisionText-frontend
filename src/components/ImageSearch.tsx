import { useState, useRef } from 'react';
import { Search, Upload, Loader2, Image as ImageIcon, X, Sparkles } from 'lucide-react';
import { searchByImage } from '../services/api';
import type { SearchResult } from '../types';

export default function ImageSearch() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchStats, setSearchStats] = useState<{ count: number; time: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        setError(null);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setError('Por favor selecciona un archivo de imagen válido');
      }
    }
  };

  const handleSearch = async () => {
    if (!selectedImage) {
      setError('Por favor selecciona una imagen para buscar');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setSearchStats(null);

    try {
      const response = await searchByImage({
        image: selectedImage
        // Usa el threshold por defecto del backend (configurado en .env)
      });

      setResults(response.results);
      setSearchStats({
        count: response.total_count,
        time: response.query_time
      });

      if (response.results.length === 0) {
        setError('No se encontraron imágenes similares. Intenta con otra imagen.');
      }
    } catch (err) {
      setError('Error al realizar la búsqueda. Por favor intenta nuevamente.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResults([]);
    setSearchStats(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
          Búsqueda Visual
        </div>
        <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
          Búsqueda por Imagen
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto text-lg">
          Sube una imagen y encuentra otras visualmente similares en nuestra base de datos.
        </p>
      </div>

      {/* Image Upload Area */}
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${selectedImage
                ? 'border-brand-red-300 bg-brand-red-50/50'
                : 'border-slate-300 hover:border-brand-red-400 hover:bg-slate-50'
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />

              {!selectedImage ? (
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center space-y-4"
                >
                  <div className="w-16 h-16 bg-brand-red-50 text-brand-red-600 rounded-full flex items-center justify-center mb-2">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="block text-lg font-medium text-slate-900">Sube una imagen</span>
                    <span className="block text-sm text-slate-500 mt-1">o arrastra y suelta aquí</span>
                  </div>
                </label>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">
                        {selectedImage.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(selectedImage.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      onClick={clearImage}
                      className="p-2 bg-white text-slate-500 rounded-full hover:bg-red-50 hover:text-red-500 border border-slate-200 transition-colors shadow-sm"
                      title="Eliminar imagen"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="w-full bg-brand-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-red-100 flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Analizando...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        Buscar Similares
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            {imagePreview ? (
              <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                <h3 className="text-sm font-medium text-slate-700 ml-1">Vista previa</h3>
                <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 relative group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                </div>
              </div>
            ) : (
              <div className="aspect-square bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 border-dashed">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <p className="text-slate-500 text-sm">La vista previa aparecerá aquí</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
          <h3 className="text-xl font-bold text-slate-900 px-1">Resultados Similares</h3>
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
          <p className="text-slate-500 mt-4 font-medium">Analizando patrones visuales...</p>
        </div>
      )}
    </div>
  );
}