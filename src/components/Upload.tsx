import { useState, useRef, useEffect } from 'react';
import { Upload, Loader2, CheckCircle, X, AlertCircle } from 'lucide-react';
import { uploadImage } from '../services/api';
import type { UploadResponse } from '../types';

export default function UploadComponent() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [descriptions, setDescriptions] = useState<string[]>([]);
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
    setDescriptions(Array(validFiles.length).fill(''));
    
    // Create previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleDescriptionChange = (index: number, description: string) => {
    const newDescriptions = [...descriptions];
    newDescriptions[index] = description;
    setDescriptions(newDescriptions);
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
      
      for (let i = 0; i < selectedFiles.length; i++) {
        try {
          const formData = new FormData();
          formData.append('image', selectedFiles[i]);
          
          const description = descriptions[i];
          if (description && description.trim()) {
            formData.append('description', description.trim());
          }

          console.log('Subiendo archivo:', selectedFiles[i].name, 'descripción:', description);
          
          const result: UploadResponse = await uploadImage(formData);
          console.log('Resultado del upload:', result);
          results.push(result);
          
        } catch (err: any) {
          console.error('Error específico en upload:', err);
          
          // Mejor manejo de errores
          const errorMessage = err.response?.data?.detail || 
                              err.response?.data?.message || 
                              err.message || 
                              'Error desconocido al subir la imagen';
          
          results.push({
            success: false,
            message: `Error al subir ${selectedFiles[i].name}: ${errorMessage}`
          });
        }
      }

      setUploadResults(results);
      
      // Clear selection if all uploads were successful
      const allSuccessful = results.every(r => r.success);
      if (allSuccessful) {
        setSelectedFiles([]);
        setPreviews([]);
        setDescriptions([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (err) {
      console.error('Error general en upload:', err);
      setError('Error al subir las imágenes. Por favor intenta nuevamente.');
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    previews.forEach(preview => URL.revokeObjectURL(preview));
    
    setSelectedFiles([]);
    setPreviews([]);
    setDescriptions([]);
    setUploadResults([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    const newDescriptions = descriptions.filter((_, i) => i !== index);
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    setDescriptions(newDescriptions);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };


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
          Sube imágenes a la base de datos. Si agregas una descripción, el sistema validará que coincida con la imagen (mínimo 25% de similitud).
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedFiles.map((file, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                  <div className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={previews[index]}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    
                    <div className="flex-grow space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                          Descripción (opcional):
                        </label>
                        <textarea
                          value={descriptions[index]}
                          onChange={(e) => handleDescriptionChange(index, e.target.value)}
                          placeholder="Describe lo que aparece en la imagen..."
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={2}
                          disabled={uploading}
                        />
                        <p className="text-xs text-gray-500">
                          Si agregas una descripción, se validará que coincida con la imagen
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 disabled:text-gray-300 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload Button */}
            <div className="flex justify-center pt-4">
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
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
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
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              )}
              <div>
                <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                  {result.message}
                </p>
                // Mostrar claramente POR QUÉ falló
                {result.banned_words && result.banned_words.length > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    Contenido prohibido detectado: {result.banned_words.join(', ')}
                  </p>
                )}
                {result.similarity_score !== undefined && result.required_similarity !== undefined && (
                  <p className="text-xs text-red-600 mt-1">
                    Similitud insuficiente: {(result.similarity_score * 100).toFixed(1)}% 
                    (mínimo requerido: {(result.required_similarity * 100).toFixed(1)}%)
                  </p>
                )}
              </div>
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