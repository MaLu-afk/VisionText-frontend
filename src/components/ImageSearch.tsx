import { useState, useRef } from 'react';
import { Search, Upload, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { searchByImage } from '../services/api';
import type { SearchResult, SearchResponse } from '../types';

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
      const response: SearchResponse = await searchByImage({
        image: selectedImage,
        limit: 20,
        threshold: 0.1
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
    <div className="space-y-6">
      {/* Search Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Búsqueda por Imagen
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Sube una imagen y nuestro sistema encontrará imágenes visualmente similares usando inteligencia artificial
        </p>
      </div>

      {/* Image Upload Area */}
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="w-12 h-12 text-gray-400" />
                <span className="text-gray-600">Haz clic para subir una imagen</span>
                <span className="text-sm text-gray-500">o arrastra y suelta aquí</span>
              </label>
            </div>

            {selectedImage && (
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {selectedImage.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedImage.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    Buscar similares
                  </button>
                  <button
                    onClick={clearImage}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            {imagePreview ? (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Vista previa</h3>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ) : (
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">La vista previa aparecerá aquí</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
          <h3 className="text-xl font-semibold text-gray-900">Imágenes similares encontradas</h3>
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
          <p className="text-gray-600">Analizando imagen y buscando similares...</p>
        </div>
      )}
    </div>
  );
}