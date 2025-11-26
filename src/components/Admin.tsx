import { useState, useEffect } from 'react';
import { Trash2, Loader2, AlertCircle, LogOut } from 'lucide-react';
import { getAllImagesAdmin, deleteImageAdmin } from '../services/api';
import AdminLogin from './AdminLogin';
import type { AdminImage } from '../types';

export default function Admin() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [images, setImages] = useState<AdminImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    useEffect(() => {
        // Verificar si hay token guardado
        const token = localStorage.getItem('admin_token');
        if (token) {
            setIsAuthenticated(true);
            loadImages();
        }
    }, []);

    const loadImages = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getAllImagesAdmin();
            setImages(data.images);
        } catch (err: any) {
            if (err.response?.status === 401) {
                // Token inválido, cerrar sesión
                handleLogout();
            } else {
                setError('Error al cargar imágenes');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (imageId: string) => {
        setDeleting(imageId);
        setError(null);

        try {
            await deleteImageAdmin(imageId);
            setImages(images.filter(img => img.id !== imageId));
            setDeleteConfirm(null);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al eliminar imagen');
        } finally {
            setDeleting(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        setIsAuthenticated(false);
        setImages([]);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (!isAuthenticated) {
        return <AdminLogin onLoginSuccess={() => { setIsAuthenticated(true); loadImages(); }} />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Panel de Administración</h2>
                    <p className="text-gray-600 mt-1">Gestiona todas las imágenes del sistema</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                        <p className="text-red-700">{error}</p>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                    <p className="text-gray-600">Cargando imágenes...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                        Imágenes del Sistema ({images.length})
                    </h3>

                    {/* Images Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Imagen
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Información
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Descripción
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Vector ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {images.map((image) => (
                                        <tr key={image.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <img
                                                    src={image.thumbnail_url}
                                                    alt={image.filename}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <p className="font-medium text-gray-900">{image.filename}</p>
                                                    <p className="text-gray-500">
                                                        {image.metadata.width}×{image.metadata.height} • {formatFileSize(image.metadata.size)}
                                                    </p>
                                                    <p className="text-gray-500">{image.metadata.format}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-700 max-w-xs truncate">
                                                    {image.description || <span className="text-gray-400 italic">Sin descripción</span>}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                                    {image.vector_id}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => setDeleteConfirm(image.id)}
                                                    disabled={deleting === image.id}
                                                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                                                >
                                                    {deleting === image.id ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                                            Eliminando...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Trash2 className="w-4 h-4 mr-1" />
                                                            Eliminar
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Confirmar Eliminación
                        </h3>
                        <p className="text-gray-600 mb-4">
                            ¿Estás seguro de que deseas eliminar esta imagen? Esta acción eliminará:
                        </p>
                        <ul className="text-sm text-gray-600 mb-6 space-y-1">
                            <li>• Registro en PostgreSQL</li>
                            <li>• Imagen y thumbnail en MinIO</li>
                            <li>• Vector en índice FAISS</li>
                        </ul>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
