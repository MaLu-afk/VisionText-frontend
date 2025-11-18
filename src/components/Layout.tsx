import { useState } from 'react';
import { Search, Image, Upload, Menu, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = () => {
    if (location.pathname === '/text-search' || location.pathname === '/') {
      return 'text';
    } else if (location.pathname === '/image-search') {
      return 'image';
    } else if (location.pathname === '/upload') {
      return 'upload';
    }
    return 'text';
  };

  const activeTab = getActiveTab();

  const handleTabChange = (tab: string) => {
    setIsMenuOpen(false);
    
    if (tab === 'text') {
      navigate('/text-search');
    } else if (tab === 'image') {
      navigate('/image-search');
    } else if (tab === 'upload') {
      navigate('/upload');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">CLIP Image Search</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => handleTabChange('text')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'text'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Search className="w-4 h-4 mr-2" />
                Búsqueda por Texto
              </button>
              <button
                onClick={() => handleTabChange('image')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'image'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Image className="w-4 h-4 mr-2" />
                Búsqueda por Imagen
              </button>
              <button
                onClick={() => handleTabChange('upload')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'upload'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Upload className="w-4 h-4 mr-2" />
                Subir Imágenes
              </button>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => handleTabChange('text')}
                className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium ${
                  activeTab === 'text'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Search className="w-5 h-5 mr-3" />
                Búsqueda por Texto
              </button>
              <button
                onClick={() => handleTabChange('image')}
                className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium ${
                  activeTab === 'image'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Image className="w-5 h-5 mr-3" />
                Búsqueda por Imagen
              </button>
              <button
                onClick={() => handleTabChange('upload')}
                className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium ${
                  activeTab === 'upload'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Upload className="w-5 h-5 mr-3" />
                Subir Imágenes
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Sistema de Búsqueda de Imágenes con CLIP - Proyecto Final Tópicos Avanzados en Machine Learning
          </p>
        </div>
      </footer>
    </div>
  );
}