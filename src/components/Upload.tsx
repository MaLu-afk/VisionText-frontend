import { useState, useRef, useEffect } from 'react';
import { Upload, Loader2, CheckCircle, X } from 'lucide-react';
import { uploadImage } from '../services/api';
import type { UploadResponse } from '../types';

export default function UploadComponent() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length !== files.length) {
      setError('Algunos archivos no son imágenes válidas y fueron ignorados');
    } else {
      setError(null);
    }

    setSelectedFiles(validFiles);
    
    // Create previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Por favor selecciona al menos una imagen');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadResults([]);

    try {
      const results: UploadResponse[] = [];
      
      for (const file of selectedFiles) {
        try {
          const result: UploadResponse = await uploadImage(file);
          results.push(result);
        } catch (err) {
          results.push({
            success: false,
            message: `Error al subir ${file.name}: ${err instanceof Error ? err.message : 'Error desconocido'}`
          });
        }
      }

      setUploadResults(results);
      
      // Clear selection if all uploads were successful
      const allSuccessful = results.every(r => r.success);
      if (allSuccessful) {
        setSelectedFiles([]);
        setPreviews([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (err) {
      setError('Error al subir las imágenes. Por favor intenta nuevamente.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    // Revoke all blob URLs to avoid memory leaks
    previews.forEach(preview => URL.revokeObjectURL(preview));
    
    setSelectedFiles([]);
    setPreviews([]);
    setUploadResults([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    // Revoke the blob URL to avoid memory leaks
    URL.revokeObjectURL(previews[index]);
    
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      previews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [previews]);

  return (
    <div className="space-y-6">
      {/* Upload Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Subir Imágenes
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Sube imágenes a la base de datos para que puedan ser encontradas mediante búsquedas de texto o imagen
        </p>
      </div>

      {/* Upload Area */}
      <div className="max-w-4xl mx-auto">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center space-y-2"
          >
            <Upload className="w-16 h-16 text-gray-400" />
            <span className="text-lg text-gray-600">Haz clic para seleccionar imágenes</span>
            <span className="text-sm text-gray-500">o arrastra y suelta aquí</span>
            <span className="text-xs text-gray-400">Puedes seleccionar múltiples imágenes</span>
          </label>
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Imágenes seleccionadas ({selectedFiles.length})
              </h3>
              <button
                onClick={clearSelection}
                disabled={uploading}
                className="text-sm text-gray-500 hover:text-gray-700 disabled:text-gray-300"
              >
                Limpiar selección
              </button>
            </div>

            {/* Preview Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={previews[index]}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload Button */}
            <div className="flex justify-center">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Subiendo imágenes...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Subir {selectedFiles.length} imagen{selectedFiles.length !== 1 ? 'es' : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Upload Results */}
      {uploadResults.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-3">
          <h3 className="text-lg font-medium text-gray-900">Resultados de la subida</h3>
          {uploadResults.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                result.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                ) : (
                  <X className="w-5 h-5 text-red-600 mr-2" />
                )}
                <p className={`text-sm ${
                  result.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading State */}
      {uploading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Procesando imágenes...</p>
        </div>
      )}
    </div>
  );
}